#!/usr/bin/env python3
"""Real HTTP proof for the production-built AIOW quote route.

Run after `bun run build` from the repository root. The script starts and
stops isolated `next start` and localhost adapter processes; it never calls
external infrastructure.
"""

import contextlib
import hashlib
import http.client
import json
import os
from pathlib import Path
import signal
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request

ROOT = Path(__file__).resolve().parents[2]
MOCK = ROOT / "tests/aiow-v1/mock-quote-webhook.py"
BASE_PORT = int(os.environ.get("AIOW_QUOTE_PROOF_PORT", "4610"))
WEBHOOK_SECRET = "proof-webhook-secret-0123456789abcdef"


def payload(note="HTTP proof"):
    return {
        "configuration": {"segment": "business", "serviceRoute": "standard", "people": 10, "contextSlug": "accountants", "smartDesign": {"modules": []}},
        "contact": {"name": "HTTP Proof", "email": "proof@example.com", "phone": "+31 20 123 4567", "company": "Proof BV", "postcode": "", "kvk": "12345678", "startDate": "", "note": note},
        "consent": {"accepted": True, "version": "aiow-quote-v1"},
        "source": {"route": "/", "locale": "nl"},
        "website": "",
    }


def request(port, key, body=None, forwarded="198.51.100.10"):
    encoded = json.dumps(body if body is not None else payload()).encode()
    req = urllib.request.Request(
        f"http://127.0.0.1:{port}/api/quote",
        data=encoded,
        method="POST",
        headers={
            "content-type": "application/json",
            "idempotency-key": key,
            "x-vercel-forwarded-for": forwarded,
            "x-vercel-ip-country": "NL",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            return response.status, dict(response.headers.items()), response.read()
    except urllib.error.HTTPError as error:
        return error.code, dict(error.headers.items()), error.read()


def chunked_request(port, key):
    connection = http.client.HTTPConnection("127.0.0.1", port, timeout=20)
    encoded = json.dumps(payload("x" * 20_000)).encode()
    chunks = (encoded[index:index + 1024] for index in range(0, len(encoded), 1024))
    connection.request("POST", "/api/quote", body=chunks, headers={
        "content-type": "application/json",
        "idempotency-key": key,
        "x-vercel-forwarded-for": "198.51.100.90",
        "x-vercel-ip-country": "NL",
    }, encode_chunked=True)
    response = connection.getresponse()
    result = response.status, dict(response.getheaders()), response.read()
    connection.close()
    return result


def lower(headers):
    return {key.lower(): value for key, value in headers.items()}


def stop(process):
    if process.poll() is not None:
        return
    os.killpg(process.pid, signal.SIGTERM)
    try:
        process.wait(timeout=8)
    except subprocess.TimeoutExpired:
        os.killpg(process.pid, signal.SIGKILL)
        process.wait(timeout=3)


def wait_server(port, process, log_file):
    deadline = time.time() + 30
    while time.time() < deadline:
        if process.poll() is not None:
            log_file.flush()
            raise RuntimeError(f"next start exited {process.returncode}; see {log_file.name}")
        try:
            with urllib.request.urlopen(f"http://127.0.0.1:{port}/privacy", timeout=1) as response:
                if response.status == 200:
                    return
        except Exception:
            time.sleep(0.15)
    raise RuntimeError(f"next start did not become ready; see {log_file.name}")


@contextlib.contextmanager
def case_server(name, offset, mode=None):
    port = BASE_PORT + offset
    adapter_port = BASE_PORT + 100 + offset
    temp_dir = Path(tempfile.mkdtemp(prefix=f"aiow-quote-{name}-"))
    adapter_log = temp_dir / "adapter.jsonl"
    processes = []
    adapter_output = (temp_dir / "adapter.out").open("w+")
    next_output = (temp_dir / "next.out").open("w+")
    try:
        if mode:
            adapter = subprocess.Popen(
                [sys.executable, str(MOCK), "--port", str(adapter_port), "--mode", mode, "--log", str(adapter_log), "--secret", WEBHOOK_SECRET],
                cwd=ROOT, stdout=adapter_output, stderr=subprocess.STDOUT, start_new_session=True,
            )
            processes.append(adapter)
            deadline = time.time() + 10
            while time.time() < deadline:
                adapter_output.flush()
                adapter_output.seek(0)
                if '"ready": true' in adapter_output.read().lower():
                    break
                if adapter.poll() is not None:
                    raise RuntimeError(f"adapter exited {adapter.returncode}")
                time.sleep(0.05)
            else:
                raise RuntimeError("adapter did not become ready")
        env = os.environ.copy()
        if mode:
            env["AIOW_QUOTE_WEBHOOK_URL"] = f"http://127.0.0.1:{adapter_port}/quote"
            env["AIOW_QUOTE_WEBHOOK_SECRET"] = WEBHOOK_SECRET
            env["AIOW_QUOTE_ADAPTER_TEST_MODE"] = "1"
        else:
            env.pop("AIOW_QUOTE_WEBHOOK_URL", None)
            env.pop("AIOW_QUOTE_WEBHOOK_SECRET", None)
            env.pop("AIOW_QUOTE_ADAPTER_TEST_MODE", None)
        next_process = subprocess.Popen(
            ["bun", "x", "next", "start", "-p", str(port)], cwd=ROOT, env=env,
            stdout=next_output, stderr=subprocess.STDOUT, start_new_session=True,
        )
        processes.append(next_process)
        wait_server(port, next_process, next_output)
        yield port, adapter_log
    finally:
        for process in reversed(processes):
            stop(process)
        adapter_output.close()
        next_output.close()


def events(path):
    if not path.exists():
        return []
    return [json.loads(line) for line in path.read_text().splitlines() if line]


def assert_json_error(result, status):
    actual, headers, body = result
    assert actual == status, (actual, body)
    assert not lower(headers).get("content-type", "").startswith("application/pdf")
    parsed = json.loads(body)
    assert parsed["ok"] is False and parsed["requestId"]
    return parsed


def main():
    if not (ROOT / ".next/BUILD_ID").exists():
        raise SystemExit("Missing production build. Run `bun run build` first.")

    with case_server("no-adapter", 0) as (port, log):
        assert_json_error(request(port, "proof-no-adapter-0001"), 503)
        assert events(log) == []

    with case_server("accepted", 1, "accepted") as (port, log):
        status, headers, body = request(port, "proof-accepted-0001")
        headers = lower(headers)
        assert status == 200 and body.startswith(b"%PDF-")
        assert headers["content-type"].startswith("application/pdf")
        assert headers["content-disposition"] == 'attachment; filename="' + headers["x-aiow-quote-number"] + '.pdf"'
        assert headers["x-aiow-request-id"] and headers["cache-control"] == "no-store"
        accepted_events = events(log)
        assert [event["operation"] for event in accepted_events] == ["prepare", "commit"]
        assert all(event["valid"] for event in accepted_events)
        assert accepted_events[0]["requestId"] == accepted_events[1]["requestId"] == headers["x-aiow-request-id"]
        assert accepted_events[0]["idempotencyKey"] == accepted_events[1]["idempotencyKey"] == "proof-accepted-0001"
        commit = accepted_events[1]
        assert commit["pdfSha256"] == hashlib.sha256(body).hexdigest()
        assert commit["mailCount"] == 2 and commit["context"] == "accountants" and commit["country"] == "NL"

    for offset, mode in ((2, "prepare-reject"), (3, "malformed-number"), (4, "commit-reject"), (7, "prepare-extra"), (8, "commit-extra")):
        with case_server(mode, offset, mode) as (port, log):
            result = request(port, f"proof-{mode}-0001")
            assert_json_error(result, 502)
            mode_events = events(log)
            expected = ["prepare"] if mode not in ("commit-reject", "commit-extra") else ["prepare", "commit"]
            assert [event["operation"] for event in mode_events] == expected
            assert all(event["valid"] for event in mode_events)

    with case_server("chunked", 5, "accepted") as (port, log):
        assert_json_error(chunked_request(port, "proof-chunked-0001"), 413)
        assert events(log) == []

    with case_server("burst", 6, "accepted") as (port, log):
        results = [request(port, f"proof-burst-{index:04d}", forwarded="198.51.100.77") for index in range(1, 7)]
        assert [result[0] for result in results[:5]] == [200] * 5
        sixth = assert_json_error(results[5], 429)
        assert "Te veel" in sixth["error"]
        burst_events = events(log)
        assert len(burst_events) == 10 and all(event["valid"] for event in burst_events)

    print("QUOTE_HTTP_PROOF_PASS no-adapter=503 accepted=PDF+2phase prepare-reject=502 malformed=502 commit-reject=502 extra-shapes=502 chunked=413 burst-sixth=429")


if __name__ == "__main__":
    main()
