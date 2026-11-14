@echo off
setlocal
pushd "%~dp0learning-platform" || exit /b 1
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Install Node.js 24 LTS and npm, then run this file again.
  popd
  pause
  exit /b 1
)
node scripts/run-role-tests.mjs admin %*
set "TEST_EXIT=%ERRORLEVEL%"
popd
if /I "%MOHOC_TEST_NO_PAUSE%"=="1" exit /b %TEST_EXIT%
for %%A in (%*) do if /I "%%~A"=="--no-pause" exit /b %TEST_EXIT%
pause
exit /b %TEST_EXIT%
