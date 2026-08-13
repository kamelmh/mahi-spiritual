"""MAHI AstroDashboard - Local Server & API Engine"""
import http.server
import socketserver
import os
import webbrowser
import threading
import sys
import socket
import json
from urllib.parse import urlparse, parse_qs

# Add AstrologyWorkspace directory to Python path for family_astrology package
ASTROLOGY_WORKSPACE = r"C:\Users\Admin\AstrologyWorkspace"
if ASTROLOGY_WORKSPACE not in sys.path:
    sys.path.insert(0, ASTROLOGY_WORKSPACE)

PORT = 9090
DIRECTORY = r"C:\Users\Admin\AstroDashboard"

os.chdir(DIRECTORY)

class ReuseAddrServer(socketserver.TCPServer):
    allow_reuse_address = True
    allow_reuse_port = True

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def log_message(self, format, *args):
        pass

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith('/api/astrology/'):
            self.handle_astrology_api(parsed)
            return
        super().do_GET()

    def handle_astrology_api(self, parsed):
        params = parse_qs(parsed.query)
        endpoint = parsed.path.replace('/api/astrology/', '').strip('/')

        try:
            from family_astrology.engine import calculate_family_charts
            from family_astrology.transits import get_current_transits, analyze_transits_for_member
            from family_astrology.dasha import calculate_dasha_sequence

            response_data = {}

            if endpoint == 'chart':
                member = params.get('name', [None])[0]
                charts = calculate_family_charts()
                if member:
                    if member in charts:
                        response_data = charts[member]
                    else:
                        self.send_json_response({"error": f"Member '{member}' not found"}, status=404)
                        return
                else:
                    response_data = charts

            elif endpoint == 'transits':
                member = params.get('name', [None])[0]
                current_t = get_current_transits()
                if member:
                    charts = calculate_family_charts()
                    if member in charts:
                        response_data = analyze_transits_for_member(charts[member], current_t)
                    else:
                        self.send_json_response({"error": f"Member '{member}' not found"}, status=404)
                        return
                else:
                    response_data = {"current_transits": current_t}

            elif endpoint == 'dasha':
                member = params.get('name', ['Kamel'])[0]
                charts = calculate_family_charts()
                if member in charts:
                    chart = charts[member]
                    moon = chart["planets"].get("Moon", {})
                    if "nakshatra" in moon:
                        deg_in_nak = moon.get("degree_in_nakshatra", moon.get("degree", 0) % 13.333)
                        birth_b = chart.get("birth", {})
                        from datetime import datetime
                        birth_dt = datetime(birth_b.get("year", 1996), birth_b.get("month", 3), birth_b.get("day", 6), birth_b.get("hour", 14), birth_b.get("minute", 0))
                        dashas = calculate_dasha_sequence(moon["nakshatra"], deg_in_nak, birth_dt)
                        # sanitize datetime objects for JSON serialization
                        for d in dashas:
                            d.pop("start_date", None)
                            d.pop("end_date", None)
                        response_data = {"member": member, "moon_nakshatra": moon["nakshatra"], "dashas": dashas}
                    else:
                        response_data = {"error": "Moon position unavailable for dasha calculation"}
            elif endpoint == 'divisional':
                member = params.get('name', ['Kamel'])[0]
                charts = calculate_family_charts()
                if member in charts:
                    c = charts[member]
                    d1_planets = {}
                    d9_planets = {}
                    d10_planets = {}
                    for p_name, p_data in c.get("planets", {}).items():
                        if "error" not in p_data:
                            d1_planets[p_name] = {"sign": p_data.get("sign"), "degree": p_data.get("degree"), "nakshatra": p_data.get("nakshatra")}
                            if "d9" in p_data:
                                d9_planets[p_name] = p_data["d9"]
                            if "d10" in p_data:
                                d10_planets[p_name] = p_data["d10"]
                    response_data = {
                        "member": member,
                        "D1": {"name": "Natal (D-1)", "planets": d1_planets},
                        "D9": {"name": "Navamsha (D-9)", "planets": d9_planets},
                        "D10": {"name": "Dashamsha (D-10)", "planets": d10_planets}
                    }
                else:
                    self.send_json_response({"error": f"Member '{member}' not found"}, status=404)
                    return

            else:
                self.send_json_response({"error": "Unknown API endpoint"}, status=404)
                return

            self.send_json_response(response_data)

        except Exception as e:
            self.send_json_response({"error": str(e)}, status=500)

    def send_json_response(self, data, status=200):
        body = json.dumps(data, indent=2, default=str).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(body)

def open_browser():
    import time
    time.sleep(1.5)
    webbrowser.open(f"http://localhost:{PORT}")

if __name__ == '__main__':
    print(f"MAHI AstroDashboard starting on http://localhost:{PORT}")
    print("Press Ctrl+C to stop.")

    threading.Thread(target=open_browser, daemon=True).start()

    with ReuseAddrServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")
            sys.exit(0)

