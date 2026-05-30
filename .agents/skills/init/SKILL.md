---
name: init
description: Initialize a new presentation by prompting for title/description, cleaning up default templates, and entering a loop to add new slides.
---

# Skill: Initialize Presentation

Use this skill when the user wants to start a fresh presentation project. It guides you through setting the presentation metadata, cleaning up the template pages, and building out the slides iteratively.

## Instructions

### Step 1: Prompt for Presentation Details
Ask the user directly for:
1. The **Title** of the presentation.
2. A brief **Description** or subtitle.

### Step 2: Update the Core Metadata & Title slide
1. Open [index.html](../../../index.html) and update the `<title>` tag with the user's presentation title. Do not modify any other part of the file.
2. Open [pages/01-intro.html](../../../pages/01-intro.html). Update the main `<h1>` tag with the presentation title and the `<p>` tag with the description.

### Step 3: Clean Up Template Slides
1. Edit [presentation.js](../../../presentation.js) to reset the `slides` configuration array. Keep only the first slide:
   ```javascript
   const slides = [
       'pages/01-intro.html'
   ];
   ```
2. Delete the old template slide files from disk (e.g. `pages/02-interactive.html`, `pages/02-interactive.js`, `pages/03-conclusion.html`). *Note: Use file-deletion commands if permitted, otherwise ask the user to delete them.*

### Step 4: Iterative Slide Creation Loop
After completing the cleanup:
1. Ask the user: *"Would you like to add a slide now or finish the setup?"*
2. If the user wants to add a slide:
   - Ask for the new slide's title and content/logic requirements.
   - Run the [add-page](../add-page/SKILL.md) skill to create and register the new slide.
   - Repeat Step 4.
3. If the user wants to finish:
   - Provide a final confirmation that the presentation has been initialized and show the current list of slides.
