@echo off
:: Wrapper .bat pour lancer vibecord-install.ps1 facilement (double-clic)
title VibeCord — Installation
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0vibecord-install.ps1"
if %errorlevel% neq 0 pause
