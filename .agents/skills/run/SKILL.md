---
name: run
description: Start a local HTTP server with the presentation and open it in the web browser.
---

# Skill: Run Presentation Server

Use this skill when the user wants to run or view their presentation. It guides you to find an available web server program on their machine, start the server in the background, and open the presentation in their default web browser.

## Instructions

### Step 1: Detect Available Web Servers
Check for the presence of common command-line web servers:
1. **Python 3:** Check with `python3 --version`. If present, you can run:
   ```bash
   python3 -m http.server 8000
   ```
2. **Node.js (npx):** Check with `node -v` and `npx --version`. If present, you can run:
   ```bash
   npx http-server -p 8000
   ```
3. **Fallback:** If neither is available, ask the user to start a local static server of their choice on port 8000.

### Step 2: Start the Server in the Background
Propose the appropriate server command using your terminal tool, ensuring it runs in the background.

### Step 3: Open the Web Browser
Once the server is running, use the platform-specific open command to open `http://localhost:8000` in the user's browser:
- **Linux:**
  ```bash
  xdg-open http://localhost:8000
  ```
- **macOS:**
  ```bash
  open http://localhost:8000
  ```
- **Windows (WSL / Git Bash):**
  ```bash
  cmd.exe /c start http://localhost:8000
  ```
- **Windows (PowerShell / Command Prompt):**
  ```cmd
  start http://localhost:8000
  ```

Provide confirmation to the user that the server has been launched and the browser opened.
