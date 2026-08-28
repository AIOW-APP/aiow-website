#!/usr/bin/env python3
"""Strict localhost adapter used by the AIOW quote HTTP proof."""

import argparse
import base64
import datetime as dt
import hashlib
import json
import os
import re
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from zoneinfo import ZoneInfo

QUOTE_NUMBER = f"AIOW-{dt.datetime.now(ZoneInfo('Europe/Amsterdam')).year}-0001"
LEAD_ID = "mock-lead-0001"
SAFE_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$")


def is_safe_mail(mail, expected_from, expected_to):
    if not isinstance(mail, dict) or set(mail) != {"from", "to", "subject", "text", "html"}:
        return False, "mail keys"
    if mail["from"] != expected_from or mail["to"] != expected_to:
        return False, "mail from/to"
    if not all(isinstance(mail[key], str) and mail[key] for key in ("subject", "text", "html")):
        return False, "mail strings"
    html = mail["html"].lower()
    if any(token in html for token in ("<script", "javascript:", "onerror=", "onclick=", "<iframe")):
        return False, "unsafe html"
    return True, "ok"


class State:
    def __init__(self, mode, log_path, delay):
        self.mode = mode
        self.log_path = Path(log_path)
        self.delay = delay
        self.prepared = {}

    def record(self, item):
        self.log_path.parent.mkdir(parents=True, exist_ok=True)
        with self.log_path.open("a", encoding="utf-8") as handle:
            handle.write(json.dumps(item, sort_keys=True, separators=(",", ":")) + "\n")


class QuoteServer(ThreadingHTTPServer):
    state: State


class Handler(BaseHTTPRequestHandler):
    server_version = "AIOWQuoteMock/1"

    def send_json(self, status, payload):
        encoded = json.dumps(payload, separators=(",", ":")).encode()
        self.send_response(status)
        self.send_header("content-type", "application/json")
        self.send_header("content-length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def do_POST(self):
        state = self.server.state
        if self.path != "/quote":
            self.send_json(404, {"accepted": False})
            return
        if state.mode == "delay":
            time.sleep(state.delay)
        raw = self.rfile.read(int(self.headers.get("content-length", "0")))
        try:
            payload = json.loads(raw)
        except Exception as exc:
            state.record({"operation": "invalid-json", "valid": False, "reason": type(exc).__name__})
            self.send_json(400, {"accepted": False})
            return

        operation = payload.get("operation") if isinstance(payload, dict) else None
        request_header = self.headers.get("x-aiow-request-id", "")
        key_header = self.headers.get("idempotency-key", "")
        reasons = []
        if not isinstance(payload, dict):
            reasons.append("body not object")
        else:
            if payload.get("requestId") != request_header or not SAFE_ID.fullmatch(request_header):
                reasons.append("request id/header mismatch")
            if payload.get("idempotencyKey") != key_header or not (16 <= len(key_header) <= 128):
                reasons.append("idempotency/header mismatch")
            if payload.get("schemaVersion") != 1:
                reasons.append("schema version")

        if operation == "prepare" and not reasons:
            required = {"operation", "schemaVersion", "requestId", "idempotencyKey", "receivedAt", "country", "quote", "contact", "consent", "source"}
            if set(payload) != required:
                reasons.append("prepare keys")
            if payload.get("quote", {}).get("configuration", {}).get("contextSlug") != "accountants":
                reasons.append("context")
            if payload.get("country") != "NL":
                reasons.append("country")
            if payload.get("consent", {}).get("accepted") is not True:
                reasons.append("consent")
            if not reasons:
                state.prepared[key_header] = {
                    "requestId": request_header,
                    "idempotencyKey": key_header,
                    "quote": payload["quote"],
                    "contact": payload["contact"],
                    "source": payload["source"],
                    "country": payload["country"],
                    "receivedAt": payload["receivedAt"],
                }
        elif operation == "commit" and not reasons:
            prepared = state.prepared.get(key_header)
            if not prepared:
                reasons.append("no matching prepare")
            else:
                for field in ("requestId", "idempotencyKey", "quote", "contact", "source", "country"):
                    if payload.get(field) != prepared[field]:
                        reasons.append(f"commit differs: {field}")
                if payload.get("leadId") != LEAD_ID or payload.get("quoteNumber") != QUOTE_NUMBER:
                    reasons.append("lead/quote identity")
            pdf = payload.get("pdf")
            pdf_bytes = b""
            try:
                if not isinstance(pdf, dict) or set(pdf) != {"filename", "mimeType", "base64", "sha256"}:
                    raise ValueError("pdf keys")
                pdf_bytes = base64.b64decode(pdf["base64"], validate=True)
                if not pdf_bytes.startswith(b"%PDF-"):
                    raise ValueError("pdf magic")
                if pdf["mimeType"] != "application/pdf" or pdf["filename"] != f"{QUOTE_NUMBER}.pdf":
                    raise ValueError("pdf metadata")
                if hashlib.sha256(pdf_bytes).hexdigest() != pdf["sha256"]:
                    raise ValueError("pdf hash")
            except Exception as exc:
                reasons.append(str(exc))
            contact_email = payload.get("contact", {}).get("email")
            for field, recipient in (("customerMail", contact_email), ("internalMail", "offerte@aiow.ai")):
                valid, reason = is_safe_mail(payload.get(field), "offerte@aiow.ai", recipient)
                if not valid:
                    reasons.append(f"{field}: {reason}")
            internal_text = payload.get("internalMail", {}).get("text", "")
            if "Context: accountants" not in internal_text or "IP-land: NL" not in internal_text:
                reasons.append("internal context/country")
            if prepared and f"Ontvangen: {prepared['receivedAt']}" not in internal_text:
                reasons.append("internal received timestamp")
        elif operation not in ("prepare", "commit"):
            reasons.append("operation")

        valid = not reasons
        event = {
            "operation": operation,
            "valid": valid,
            "reasons": reasons,
            "requestId": request_header,
            "idempotencyKey": key_header,
        }
        if operation == "commit" and isinstance(payload, dict) and isinstance(payload.get("pdf"), dict):
            event["pdfSha256"] = payload["pdf"].get("sha256")
            event["mailCount"] = sum(field in payload for field in ("customerMail", "internalMail"))
            event["context"] = payload.get("quote", {}).get("configuration", {}).get("contextSlug")
            event["country"] = payload.get("country")
        state.record(event)

        if not valid:
            self.send_json(400, {"accepted": False, "error": "; ".join(reasons)})
        elif operation == "prepare" and state.mode == "prepare-reject":
            self.send_json(409, {"accepted": False})
        elif operation == "prepare" and state.mode == "malformed-number":
            self.send_json(200, {"accepted": True, "quoteNumber": "AIOW-NOT-A-NUMBER", "leadId": LEAD_ID})
        elif operation == "prepare" and state.mode == "prepare-extra":
            self.send_json(200, {"accepted": True, "quoteNumber": QUOTE_NUMBER, "leadId": LEAD_ID, "unexpected": True})
        elif operation == "commit" and state.mode == "commit-reject":
            self.send_json(409, {"accepted": False})
        elif operation == "commit" and state.mode == "commit-extra":
            self.send_json(200, {"accepted": True, "unexpected": True})
        elif operation == "prepare":
            self.send_json(200, {"accepted": True, "quoteNumber": QUOTE_NUMBER, "leadId": LEAD_ID})
        else:
            self.send_json(200, {"accepted": True})

    def log_message(self, format, *args):
        pass


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=int(os.environ.get("AIOW_MOCK_PORT", "4322")))
    parser.add_argument("--log", default=os.environ.get("AIOW_MOCK_LOG", "/tmp/aiow-quote-mock.jsonl"))
    parser.add_argument("--mode", choices=("accepted", "prepare-reject", "commit-reject", "malformed-number", "prepare-extra", "commit-extra", "delay"), default=os.environ.get("AIOW_MOCK_MODE", "accepted"))
    parser.add_argument("--delay", type=float, default=float(os.environ.get("AIOW_MOCK_DELAY", "11")))
    args = parser.parse_args()
    server = QuoteServer((args.host, args.port), Handler)
    server.state = State(args.mode, args.log, args.delay)
    print(json.dumps({"ready": True, "host": args.host, "port": args.port, "mode": args.mode, "log": args.log}), flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
