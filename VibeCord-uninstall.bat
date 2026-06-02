@echo off
:: Wrapper .bat pour lancer vibecord-uninstall.ps1 facilement (double-clic)
title VibeCord — Désinstallation
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0vibecord-uninstall.ps1"
if %errorlevel% neq 0 pause
