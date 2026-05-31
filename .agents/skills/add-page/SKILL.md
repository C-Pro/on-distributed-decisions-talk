---
name: add-page
description: Add a new slide to the presentation, incorporating optional scripts using the HTML Dependency Manifest Pattern.
---

# Skill: Add Page to Presentation

Use this skill whenever you need to add a new slide page to the presentation. Follow these exact steps to ensure structural consistency and prevent script loading issues.

## Instructions

### Step 0: Ask questions

If the user did not provide you with the slide page description right away ask them about slide title and contents.

### Step 1: Create the HTML Fragment
Create a new HTML file under the [pages/](../../../pages/) directory (e.g. `pages/04-newslide.html`). The slide content should be wrapped in a `.slide` container:

```html
<!-- Declare script and style dependencies if needed (Step 2 & Step 3) -->
<link rel="preload" href="pages/04-newslide.js" as="script">
<link rel="preload" href="pages/04-newslide.css" as="style">

<div class="slide" data-init="initNewSlide">
    <div class="content-wrapper">
        <h1>New Slide Title</h1>
        <p>Your content goes here...</p>
    </div>
</div>
```

### Step 2: Create Page-Specific JavaScript (Optional)
If your slide contains interactive features (e.g., forms, buttons, canvas, animations):
1. Create a script file in the same directory: `pages/04-newslide.js`.
2. Add all event handlers or variables to the global `window` scope so HTML elements can call them (e.g., `window.initNewSlide`).
3. Add the `<link rel="preload" href="pages/04-newslide.js" as="script">` tag at the top of your slide HTML fragment.
   > [!IMPORTANT]
   > The `href` MUST reference the project root (e.g., `"pages/04-newslide.js"`), not relative to the folder (do not use `"./04-newslide.js"`).

### Step 3: Create Page-Specific CSS (Optional)
If your slide requires custom styling:
1. Create a stylesheet file in the same directory: `pages/04-newslide.css`.
2. Add the `<link rel="preload" href="pages/04-newslide.css" as="style">` tag at the top of your slide HTML fragment.
   > [!IMPORTANT]
   > The `href` MUST reference the project root (e.g., `"pages/04-newslide.css"`), not relative to the folder (do not use `"./04-newslide.css"`).

### Step 4: Register Slide in Configuration
Open [pages/index.js](../../../pages/index.js) and append your new slide file path to the `slides` configuration array:

```javascript
export const slides = [
    'pages/01-intro.html',
    'pages/02-interactive.html',
    'pages/03-conclusion.html',
    'pages/04-newslide.html' // <-- Add here
];
```
