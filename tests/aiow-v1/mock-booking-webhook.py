from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import os

LOG_PATH = os.environ.get("AIOW_MOCK_LOG", "/tmp/aiow-booking-mock.jsonl")

class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        length = int(self.headers.get("content-length", "0"))
        payload = json.loads(self.rfile.read(length))
        assert self.headers.get("idempotency-key")
        assert payload.get("requestId") and payload.get("consentAccepted") is True
        with open(LOG_PATH, "a", encoding="utf-8") as log:
            log.write(json.dumps({"key": self.headers.get("idempotency-key"), "requestId": payload["requestId"]}) + "\n")
        self.send_response(204)
        self.end_headers()
    def log_message(self, format, *args):
        pass

HTTPServer(("127.0.0.1", 4322), Handler).serve_forever()
