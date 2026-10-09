@echo off
title PlanGuard Enterprise - FastAPI + Uvicorn + Gemini 2.5 Flash
echo ===================================================================
echo   Launching PlanGuard Enterprise Architectural Engine...
echo   Backend:  FastAPI + Uvicorn ASGI Server
echo   Brain:    Sub-millimeter Deterministic Raytracer + Gemini 2.5 Flash
echo   Docs:     http://127.0.0.1:3000/docs
echo   UI:       http://127.0.0.1:3000/
echo ===================================================================
cd /d "%~dp0"

if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" (
    "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" run.py
) else (
    python run.py || py run.py
)

pause
