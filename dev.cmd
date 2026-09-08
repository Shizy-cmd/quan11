@echo off
rem Start the local dev server using the bundled vite (bypasses a broken npm/npx).
call "%~dp0node_modules\.bin\vite.cmd" dev
