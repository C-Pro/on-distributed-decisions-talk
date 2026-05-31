# Presentation Framework Rules & Guidelines for Agents

This workspace contains an interactive, web-based presentation framework. When modifying this codebase or adding new slides, you must follow the strict structural rules described below.

---

## 1. Initializing a New Presentation

To start a new presentation, reset the workspace templates, and configure the project details (title and description), follow the dedicated guidelines in the workspace skill:
[.agents/skills/init/SKILL.md](.agents/skills/init/SKILL.md)

---

## 2. Static framework and UGC separation

When adding or modifying user slides, all changes should be limited to the `pages` directory.
Files in the root (index.html, presentation.js, presentation.css, etc.) are part of the framework that is not meant to be changed during normal flow of creating a presentation.
We use the **HTML Dependency Manifest Pattern** to dynamically fetch slide contents and execute required JavaScript and CSS safely.

* **No Global Changes:** Page-specific styles, logic, or content changes must **NOT** be made in global files outside of the `pages/` directory (e.g., do not modify `presentation.css` or `presentation.js` for slide-specific styling or logic).
* **Manifest Reference:** To add a new slide or configure slide dependencies, follow the step-by-step instructions in the dedicated agent skill:
  [.agents/skills/add-page/SKILL.md](.agents/skills/add-page/SKILL.md)

---

## 3. Running the Presentation

To start the local HTTP server and open the presentation in the browser, follow the dedicated guidelines in the workspace skill:
[.agents/skills/run/SKILL.md](.agents/skills/run/SKILL.md)
