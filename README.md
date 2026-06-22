//README.md
# Priority Tab Modern 🌙

A modernized Firefox new-tab productivity page inspired by the original **Prioritab** extension.

Priority Tab Modern keeps a small set of priorities visible every time you open a new tab. It has three task columns — **Today**, **This Week**, and **This Month** — plus a clock, progress counters, visual customization, keyboard controls, clickable task URLs, and an optional fluid animation background.

> **Status:** Listed on AMO for Firefox desktop. Tested on Firefox desktop. Chrome/Chromium support is planned next; additional platform testing is pending.

---

## Why this exists

The original Prioritab idea is excellent: your new tab page should remind you what matters.

This modified version keeps that idea while modernizing the codebase and adding new features:

| Area            | Modernization                                                     |
| --------------- | ----------------------------------------------------------------- |
| Todo behavior   | Reworked from jQuery-heavy logic to native JavaScript             |
| Drag and drop   | Replaced jQuery UI sortable with native drag/drop                 |
| Inline editing  | Replaced jQuery inline-edit plugin                                |
| Pub/sub         | Replaced pub/sub dependency with direct functions                 |
| Colors          | Replaced jQuery color picker with native `<input type="color">`   |
| Time formatting | Removed Moment.js and replaced it with native JavaScript          |
| Background      | Added optional Fluid-JS animation and image handling              |
| Code structure  | Split the priority/task system into feature modules               |

---

## Project origin and attribution

This project is based on / inspired by the original Prioritab project:

| Project   | Link                                                 | Notes                               |
| --------- | ---------------------------------------------------- | ----------------------------------- |
| Prioritab | https://github.com/allenjhyang/prioritab/tree/master | Original new-tab priority dashboard |

This modified version should not be presented as the original project. Attribution to the original author should remain clear in the README, AMO listing, and notice files.

---

## Features ✨

### Priority lists

| Feature                                          | Status |
| ------------------------------------------------ | -----: |
| Three task columns: Today, This Week, This Month |     ✅ |
| Add tasks                                        |     ✅ |
| Edit tasks by double-clicking                    |     ✅ |
| Delete tasks                                     |     ✅ |
| Mark tasks as done                               |     ✅ |
| Clear completed tasks per column                 |     ✅ |
| Clear all tasks per column                       |     ✅ |
| Drag and drop within a column                    |     ✅ |
| Drag and drop across columns                     |     ✅ |
| Persist order after refresh                      |     ✅ |
| Persist checked/done state                       |     ✅ |
| Detect URLs in tasks and make them clickable     |     ✅ |

### Keyboard controls ⌨️

| Key            | Behavior                                                       |
| -------------- | -------------------------------------------------------------- |
| `ArrowUp`      | Move focused task up; wraps to bottom                          |
| `ArrowDown`    | Move focused task down; wraps to top                           |
| `ArrowLeft`    | Move focused task to previous column; wraps from left to right |
| `ArrowRight`   | Move focused task to next column; wraps from right to left     |
| `Enter`        | Save inline todo edit                                          |
| `Escape`       | Cancel inline todo edit / close new-task input area            |

### Time and progress

| Feature                             | Status |
| ----------------------------------- | -----: |
| Current time                        |     ✅ |
| Current weekday/date                |     ✅ |
| Day progress counter                |     ✅ |
| Month progress counter              |     ✅ |
| Year progress counter               |     ✅ |
| Optional workday-based day progress |     ✅ |
| Configurable workday start/end      |     ✅ |
| Configurable date/time formats      |     ✅ |

### Customization 🎨

| Feature                                      | Status  |
| -------------------------------------------- | ------: |
| Background color picker                      |      ✅ |
| Main font color picker                       |      ✅ |
| Secondary font color picker                  |      ✅ |
| Restore default colors                       |      ✅ |
| Background image upload                      |      ✅ |
| Center/remove background image               |      ✅ |
| Fluid animation background                   |      ✅ |
| Toggle fluid animation                       |      ✅ |
| Show background image behind fluid animation |      ✅ |
| OpenDyslexic font support                    | Planned |

---

## Browser support

| Browser           | Status              |
| ----------------- | ------------------- |
| Firefox desktop   | Supported / tested  |
| Firefox Android   | Not planned for now |
| Chrome / Chromium | Planned next        |
| Other browsers    | Unknown             |

The current public target is Firefox desktop. Chrome/Chromium support is the next planned distribution milestone.

---

## Local installation in Firefox 🦊

This project uses `manifest.base.json` as the source of truth. A usable `manifest.json` is generated into `build/`.

1. Build a local development version:

   ```bash
   ./scripts/build.sh listed
   ```

2. Open Firefox and go to:

   ```text
   about:debugging#/runtime/this-firefox
   ```

3. Click **Load Temporary Add-on...**

4. Select:

   ```text
   build/manifest.json
   ```

5. Open a new tab.

Temporary add-ons are removed when Firefox restarts, so this method is for development/testing only.

---

## Project structure

```text
.
├── assets/
│   ├── fonts/
│   └── logo/
├── demo/
│   └── screenshots/
├── scripts/
├── src/
│   ├── app.js
│   ├── config/
│   │   └── defaults.js
│   ├── features/
│   │   ├── background-image.js
│   │   ├── clock.js
│   │   ├── countdown.js
│   │   ├── fluid-bg.js
│   │   ├── panels.js
│   │   ├── priorities-ui.js
│   │   ├── theme.js
│   │   └── priorities/
│   │       ├── actions.js
│   │       ├── constants.js
│   │       ├── context.js
│   │       ├── dragging.js
│   │       ├── editing.js
│   │       ├── events.js
│   │       ├── index.js
│   │       ├── loader.js
│   │       ├── render.js
│   │       ├── state.js
│   │       └── storage.js
│   └── utils/
│       └── dom.js
├── third_party_licenses/
├── manifest.base.json
├── priority_tab_modern.html
├── priority_tab_modern.css
├── README.md
├── LICENSE_PRIORITY_TAB_MODERN.md
├── PRIVACY_PRIORITY_TAB_MODERN.md
└── THIRD_PARTY_NOTICES.md
```

`manifest.json` is generated into `build/` by the build script and is not expected to exist at the repository root.

### Important files

| File                                      | Purpose                                                        |
| ----------------------------------------- | -------------------------------------------------------------- |
| `priority_tab_modern.html`                | Main new-tab page markup                                       |
| `priority_tab_modern.css`                 | Global styling and layout                                      |
| `manifest.base.json`                      | Source-of-truth manifest used by the build script              |
| `src/app.js`                              | Startup orchestration for the extension                        |
| `src/utils/dom.js`                        | Shared DOM helpers under `window.Prioritab.dom`                |
| `src/config/defaults.js`                  | Default settings and storage keys                              |
| `src/features/clock.js`                   | Clock/date display                                             |
| `src/features/countdown.js`               | Day/workday/month/year progress logic                          |
| `src/features/theme.js`                   | Color customization                                            |
| `src/features/background-image.js`        | Background image upload/removal                                |
| `src/features/panels.js`                  | Settings/customization panel behavior                          |
| `src/features/priorities-ui.js`           | Priority panel UI toggles and controls                         |
| `src/features/fluid-bg.js`                | Fluid animation settings and behavior                          |
| `src/features/priorities/index.js`        | Entry point for the priority/task feature                      |
| `src/features/priorities/loader.js`       | Loads saved todos and renders initial task lists               |
| `src/features/priorities/actions.js`      | Add, remove, clear, move, and regenerate todo actions          |
| `src/features/priorities/events.js`       | Event binding for priority/task interactions                   |
| `src/features/priorities/render.js`       | Todo card rendering, checkbox/text/delete elements, URL links  |
| `src/features/priorities/storage.js`      | Storage helpers for todo text, order, counters, and done state |
| `src/features/priorities/state.js`        | In-memory priority/task state helpers                          |
| `src/features/priorities/context.js`      | DOM references for priority columns, forms, and buttons        |
| `src/features/priorities/editing.js`      | Inline todo editing behavior                                   |
| `src/features/priorities/dragging.js`     | Native drag/drop sorting behavior                              |
| `src/features/priorities/constants.js`    | Priority list names, storage keys, and shared constants        |

---

## Priority feature module flow

The priority/task system is initialized from `src/app.js`:

```js
window.Prioritab.priorities.index.init();
```

The feature initializer then wires together the priority modules:

```text
index.js
├── context.js   → finds priority-related DOM elements
├── actions.js   → creates todo operations
├── editing.js   → creates inline-edit handlers
├── dragging.js  → creates drag/drop handlers
├── loader.js    → loads saved todos from storage
└── events.js    → binds UI events to actions/editing/dragging
```

The data flow is intentionally simple:

```text
storage.js → loader.js → render.js
actions.js → storage.js + state.js + render.js
events.js  → actions.js / editing.js / dragging.js
```

This replaces the older monolithic `sortaeditalist.js` behavior with smaller modules.

---

## Storage

The extension uses browser extension storage.

| Data                      | Storage purpose                             |
| ------------------------- | ------------------------------------------- |
| Todo text                 | Persist tasks                               |
| Todo order                | Preserve task ordering and column placement |
| Done/checked state        | Preserve completed tasks                    |
| Color settings            | Persist theme customization                 |
| Workday settings          | Persist custom workday progress             |
| Date/time format settings | Persist display format                      |
| Fluid animation settings  | Persist animation preferences               |
| Background image data     | Persist optional uploaded background image  |

No remote backend is currently used.

---

## Major modernization completed 🛠️

| Dependency / legacy behavior | Replacement                  |
| ---------------------------- | ---------------------------- |
| jQuery todo logic            | Native JavaScript modules    |
| jQuery UI sortable           | Native drag/drop             |
| jQuery inline-edit plugin    | Native inline editing        |
| pubsub plugin                | Direct function calls        |
| colpick color picker         | Native color inputs          |
| Moment.js                    | Native date/time helpers     |
| Monolithic todo script       | Modular priority feature     |

---

## Privacy

Priority Tab Modern does not collect, transmit, sell, or share personal data.

The extension runs locally in the browser and stores user data using browser extension storage. This can include todo items, todo order, completed state, color settings, date/time preferences, workday settings, fluid animation settings, and optional uploaded background image data.

No analytics, tracking, external servers, or third-party network requests are used by the extension.

If browser sync is enabled, the browser may sync extension storage according to the user's browser account and browser settings. That syncing is handled by the browser, not by this extension.

See `PRIVACY_PRIORITY_TAB_MODERN.md` for the standalone privacy policy.

---

## License

Priority Tab Modern is released under a custom source-available license.

In short:

| Allowed                                                  | Not allowed                                     |
| -------------------------------------------------------- | ----------------------------------------------- |
| View the source code                                     | Redistribute this software or modified versions |
| Fork or modify for personal, private, non-commercial use | Sell, license, rent, or commercialize it        |
| Use GitHub's normal fork mechanism                       | Remove copyright/license notices                |
| Study the code                                           | Imply this project is the original Prioritab    |

This software is provided "as is", without warranty of any kind.

Third-party components, fonts, and libraries included in this project remain subject to their own licenses.

See `LICENSE_PRIORITY_TAB_MODERN.md` for the full license text.

---

## Third-party attributions 📚

Third-party license files and notices should be kept in `third_party_licenses/` and `THIRD_PARTY_NOTICES.md`.

| Dependency                   | Link                                                                             | Use                                     |
| ---------------------------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| Prioritab                    | https://github.com/allenjhyang/prioritab/tree/master                             | Original inspiration/base project       |
| Fluid-JS                     | https://github.com/malik-tillman/Fluid-JS                                        | WebGL fluid background animation        |
| Font Awesome                 | https://github.com/FortAwesome/Font-Awesome                                      | Icons, including trash/cog icons        |
| OpenDyslexic source          | https://forge.hackers.town/antijingoist/opendyslexic                             | Planned optional dyslexia-friendly font |
| OpenDyslexic attribution FAQ | https://forge.hackers.town/antijingoist/opendyslexic/src/branch/main/OFL-FAQ.txt | Attribution/license guidance            |
| Open Sans source             | https://github.com/googlefonts/opensans                                          | Bundled font                            |
| Open Sans OFL                | https://github.com/googlefonts/opensans/blob/main/OFL.txt                        | Font license                            |

---

## Demo assets

Demo screenshots may use third-party images that are not part of the extension build.

| Asset                           | Source                                                                              | Attribution              | Use                   |
| ------------------------------- | ----------------------------------------------------------------------------------- | ------------------------ | --------------------- |
| Futuristic neon city background | https://unsplash.com/photos/a-futuristic-city-at-night-with-neon-lights-dA0-qxdbyyY | Photo by Nat on Unsplash | Demo screenshots only |

The demo background image is intended for screenshots and promotional/demo material. It should be stored outside the extension build, for example under `demo/screenshots/backgrounds/`.

---

## Future work

### Next milestone

| Task                    | Notes                                                  |
| ----------------------- | ------------------------------------------------------ |
| Chrome/Chromium support | Planned next to expand distribution beyond Firefox AMO |
| Browser-specific builds | Generate Firefox and Chrome manifests/build folders    |
| Chrome local testing    | Test with Chrome/Chromium unpacked extension workflow  |

### Later features

| Feature                                                        | Priority                                        |
| -------------------------------------------------------------- | ----------------------------------------------- |
| JSON export/import for todos and settings                      | High after Chrome support                       |
| Add options page for import/export and advanced settings       | Later, when data-management features justify it |
| OpenDyslexic font support                                      | Medium                                          |
| Preserve relative row position during horizontal task movement | Low/medium                                      |
| Improve customization panel styling                            | Medium                                          |
| Firefox Android investigation                                  | Nice idea, not planned for now                  |

---
