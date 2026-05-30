# Presentation Framework Rules & Guidelines for Agents

This workspace contains an interactive, web-based presentation framework. When modifying this codebase or adding new slides, you must follow the strict structural rules described below.

---

## 1. Main HTML File Constraints (`index.html`)

* **Title Updates only:** You may update the presentation title by editing the `<title>` tag in [index.html](index.html).
* **Static Content Guard:** **Do NOT modify any other parts of [index.html](index.html)**. The body shell, the theme toggler, and the main container must remain strictly static. All slide-specific logic and UI must live inside individual page modules under the `pages/` directory.

---

## 2. Slide Loading & Script Dependency Rules

We use the **HTML Dependency Manifest Pattern** to dynamically fetch slide contents and execute required JavaScript safely.

To add a new slide or configure slide dependencies, follow the step-by-step instructions in the dedicated agent skill:
[.agents/skills/add-page/SKILL.md](.agents/skills/add-page/SKILL.md)

---

## 3. Initializing a New Presentation

To start a new presentation, reset the workspace templates, and configure the project details (title and description), follow the dedicated guidelines in the workspace skill:
[.agents/skills/init/SKILL.md](.agents/skills/init/SKILL.md)

---

## 4. Running the Presentation

To start the local HTTP server and open the presentation in the browser, follow the dedicated guidelines in the workspace skill:
[.agents/skills/run/SKILL.md](.agents/skills/run/SKILL.md)
