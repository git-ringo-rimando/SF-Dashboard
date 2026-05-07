Set oShell = CreateObject("WScript.Shell")
oShell.Run "powershell -WindowStyle Hidden -Command ""cd 'D:\Claude\SF Dashboard'; npm run start -- -H 0.0.0.0""", 0, False
