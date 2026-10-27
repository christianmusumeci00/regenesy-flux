"""Server locale per Regenesy Flux: come `python3 -m http.server`, ma senza cache,
così ogni modifica ai file si vede subito ricaricando la pagina.

Uso:  python3 serve.py [porta]   (porta predefinita 8780)
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8780
    handler = partial(NoCacheHandler, directory=str(Path(__file__).resolve().parent))
    print(f"Regenesy Flux su http://localhost:{port}")
    ThreadingHTTPServer(("", port), handler).serve_forever()
