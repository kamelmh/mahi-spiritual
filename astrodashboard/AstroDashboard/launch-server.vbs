Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Admin\AstroDashboard"
WshShell.Run "python -m http.server 8080", 0, False
WScript.Sleep 1500
WshShell.Run "http://localhost:8080", 1, False
