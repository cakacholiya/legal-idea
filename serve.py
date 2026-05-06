#!/usr/bin/env python3
"""Local dev server for the Legal Idea redesigned site."""
import http.server, os, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8080
WEB_DIR = os.path.dirname(os.path.abspath(__file__))

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=WEB_DIR, **kw)
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache")
        super().end_headers()

if __name__ == "__main__":
    with http.server.HTTPServer(("0.0.0.0", PORT), Handler) as s:
        print(f"\n  Legal Idea Redesign: http://localhost:{PORT}\n")
        try: s.serve_forever()
        except KeyboardInterrupt: print("\nStopped.")
