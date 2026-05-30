# Interactive Presentation Framework

A lightweight, vanilla HTML/CSS/JS presentation framework designed for full-screen interactive talks. Slides are modular HTML fragments loaded dynamically with zero layout flicker and smart script dependency preloading.

---

## 🚀 Usage (Agent-Powered)

This framework is built to be "agent-friendly." You don't need to manually configure files to build your slide deck.

1. **Clone this repository** to your local machine.
2. **Open the project** with your agentic AI coding assistant of choice (e.g. Calude / Codex / Antigravity).
3. **Run the initialization skill:** Ask the agent to run the `init` skill (e.g., by writing `/init` or asking it to *"initialize the presentation"*).
4. The agent will guide you through:
   - Setting your presentation title and description.
   - Automatically updating metadata and resetting template pages.
   - Adding pages iteratively in a user-guided creation loop.

---

## ⚡ Running the Presentation

Because this framework uses the browser's native `fetch()` API to load slides dynamically, **it cannot be run directly via the `file://` protocol** (opening `index.html` by double-clicking it) due to browser CORS security restrictions. 

You must host the project folder using a local web server. Here are the options to start the presentation:

### Option A: Using the Agent-Powered `/run` Skill (Recommended)
If you are currently using an agent assistant, simply instruct it to run the `run` skill (e.g., by writing `/run` or asking it to *"start the presentation server"*). The agent will automatically find a suitable server on your system, launch it in the background, and open your browser to [http://localhost:8000](http://localhost:8000).

### Option B: Using Python (Typically pre-installed on Linux/macOS)
```bash
python3 -m http.server 8000
```
*Access at: [http://localhost:8000](http://localhost:8000)*

### Option C: Using Node.js / npm
```bash
npx http-server -p 8000
```
*Access at: [http://localhost:8000](http://localhost:8000)*

---

## 🛠️ Project Structure

- `index.html` - Static shell containing the main slide container and global styling/scripts.
- `presentation.js` - Engine managing navigation, hash routing, and dynamic slide fetching.
- `presentation.css` - Theme styling (with automatic dark/light mode preference detection and a manual toggle button).
- `pages/` - Directory containing slide HTML files and their page-specific script modules.

---

## ⌨️ Controls

- **Page Down:** Next slide.
- **Page Up:** Previous slide.
