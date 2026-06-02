@echo off
:: Wrapper .bat pour lancer VibeCord-install.ps1 facilement (double-clic)
title VibeCord — Installation
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0VibeCord-install.ps1"
if %errorlevel% neq 0 pause
