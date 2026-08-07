import http.server
import socketserver
import os
import sys
import subprocess
import time

PORT = 8000
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'frontend')

os.chdir(DIRECTORY)
handler = http.server.SimpleHTTPRequestHandler

try:
    httpd = socketserver.TCPServer(('', PORT), handler)
    print(f'Server started on http://localhost:{PORT}')
    sys.stdout.flush()
    
    # Run playwright tests
    result = subprocess.run(
        [sys.executable, '-m', 'playwright', 'test', '--reporter=list'],
        cwd=os.path.dirname(os.path.abspath(__file__)),
        capture_output=False
    )
    
    httpd.shutdown()
    sys.exit(result.returncode)
except OSError as e:
    print(f'Port {PORT} already in use, trying to use it...')
    # Port already in use, just run tests
    result = subprocess.run(
        [sys.executable, '-m', 'playwright', 'test', '--reporter=list'],
        cwd=os.path.dirname(os.path.abspath(__file__)),
        capture_output=False
    )
    sys.exit(result.returncode)
