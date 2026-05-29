@echo off
REM Mo firewall cho Next.js dev server (cho phep dien thoai cung WiFi truy cap).
REM Chay file nay 1 lan duy nhat voi quyen Administrator.

net session >nul 2>&1
if %errorLevel% NEQ 0 (
  echo.
  echo [LOI] File nay phai chay voi quyen Administrator.
  echo Right-click file -^> "Run as administrator".
  echo.
  pause
  exit /b 1
)

echo Dang mo port 3000 (web) va 3001 (admin)...
powershell -NoProfile -Command "New-NetFirewallRule -DisplayName 'Next.js Dev 3000' -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null"
powershell -NoProfile -Command "New-NetFirewallRule -DisplayName 'Next.js Dev 3001' -Direction Inbound -LocalPort 3001 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue | Out-Null"

echo.
echo [OK] Da mo port 3000 + 3001.
echo Bay gio quay lai PowerShell binh thuong, chay: npm run dev
echo Tren dien thoai (cung WiFi), mo: http://192.168.1.42:3000
echo.
pause
