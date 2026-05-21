# Priority Tab Modern 🌙

A modernized Firefox new-tab productivity page inspired by the original **Prioritab** extension.

Priority Tab Modern keeps a small set of priorities visible every time you open a new tab. It has three task columns — **Today**, **This Week**, and **This Month** — plus a clock, progress counters, visual customization, keyboard controls, and an optional fluid animation background.

> **Status:** Listed AMO release submitted and awaiting review. The extension has been tested on Firefox desktop; additional platform testing is planned.

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
| Colors          | Replaced jQuery color picker with native `<input type="color">` |
| Time formatting | Removed Moment.js and replaced it with native JavaScript          |
| Background      | Added optional Fluid-JS animation and image handling              |

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

### Keyboard controls ⌨️

| Key            | Behavior                                                       |
| -------------- | -------------------------------------------------------------- |
| `ArrowUp`    | Move focused task up; wraps to bottom                          |
| `ArrowDown`  | Move focused task down; wraps to top                           |
| `ArrowLeft`  | Move focused task to previous column; wraps from left to right |
| `ArrowRight` | Move focused task to next column; wraps from right to left     |
| `Enter`      | Save inline todo edit                                          |
| `Escape`     | Cancel inline todo edit / close new-task input area            |

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

| Feature                                      | Status |
| -------------------------------------------- | -----: |
| Background color picker                      |     ✅ |
| Main font color picker                       |     ✅ |
| Secondary font color picker                  |     ✅ |
| Restore default colors                       |     ✅ |
| Background image upload                      |     ✅ |
| Center/remove background image               |     ✅ |
| Fluid animation background                   |     ✅ |
| Toggle fluid animation                       |     ✅ |
| Show background image behind fluid animation |     ✅ |
| OpenDyslexic font support                    |     ✅ |

---

## Browser support

| Browser           | Status              |
| ----------------- | ------------------- |
| Firefox desktop   | Tested              |
| Firefox Android   | Not planned for now |
| Chrome / Chromium | Not tested yet      |
| Other browsers    | Unknown             |

The current goal is to prepare the extension for Firefox desktop and eventual AMO submission.

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
├── lib/
├── scripts/
├── src/
├── third_party_licenses/
├── manifest.base.json
├── manifest.json
├── priority_tab_modern.html
├── priority_tab_modern.css
├── README.md
├── LICENSE_PRIORITY_TAB_MODERN.md
├── PRIVACY_PRIORITY_TAB_MODERN.md
└── THIRD_PARTY_NOTICES.md
```

### Important files

| File                                 | Purpose                                         |
| ------------------------------------ | ----------------------------------------------- |
| `priority_tab_modern.html`         | Main new-tab page markup                        |
| `priority_tab_modern.css`          | Global styling and layout                       |
| `src/app.js`                       | Startup orchestration                           |
| `src/config/defaults.js`           | Default settings and storage keys               |
| `src/features/clock.js`            | Clock/date/month/year progress                  |
| `src/features/countdown.js`        | Day/workday countdown logic                     |
| `src/features/theme.js`            | Color customization                             |
| `src/features/background-image.js` | Background image upload/removal                 |
| `src/features/fluid-bg.js`         | Fluid animation settings and behavior           |
| `lib/sortaeditalist.js`            | Todo-list behavior; should be modularized later |

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

| Dependency / legacy behavior | Replacement              |
| ---------------------------- | ------------------------ |
| jQuery todo logic            | Native JavaScript        |
| jQuery UI sortable           | Native drag/drop         |
| jQuery inline-edit plugin    | Native inline editing    |
| pubsub plugin                | Direct function calls    |
| colpick color picker         | Native color inputs      |
| Moment.js                    | Native date/time helpers |

---

## Privacy

Priority Tab Modern does not collect, transmit, sell, or share personal data.

The extension runs locally in the browser and stores user data using browser extension storage. This can include todo items, todo order, completed state, color settings, date/time preferences, workday settings, fluid animation settings, and optional uploaded background image data.

No analytics, tracking, external servers, or third-party network requests are used by the extension.

If browser sync is enabled, the browser may sync extension storage according to the user's browser account and browser settings. That syncing is handled by the browser, not by this extension.

See `PRIVACY.md` for the standalone privacy policy.

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

See `LICENSE.md` for the full license text.

---

## Third-party attributions 📚

This is a working attribution list. Before bundling/submission, copy relevant license files into the repository where possible.

| Dependency                   | Link                                                                             | Use                                     |
| ---------------------------- | -------------------------------------------------------------------------------- | --------------------------------------- |
| Prioritab                    | https://github.com/allenjhyang/prioritab/tree/master                             | Original inspiration/base project       |
| Fluid-JS                     | https://github.com/malik-tillman/Fluid-JS                                        | WebGL fluid background animation        |
| Font Awesome                 | https://github.com/FortAwesome/Font-Awesome                                      | Icons, including trash/cog icons        |
| OpenDyslexic source          | https://forge.hackers.town/antijingoist/opendyslexic                             | Optional dyslexia-friendly font support |
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

### Before AMO submission

| Task                          | Notes                                                 |
| ----------------------------- | ----------------------------------------------------- |
| Clean unused libraries        | Completed                                             |
| Copy third-party licenses     | As many as possible before bundling                   |
| Add AMO reviewer notes        | Explain storage, no tracking, bundled libraries/fonts |
| Run `web-ext lint`          | Catch AMO validation issues early                     |
| Build final extension package | Use `web-ext build`                                 |
| Prepare AMO listing           | Description, screenshots, reviewer notes, categories  |

### Later features

| Feature                                                        | Priority                                        |
| -------------------------------------------------------------- | ----------------------------------------------- |
| JSON export/import for todos                                   | Later, after AMO                                |
| Split `sortaeditalist.js` into modules                       | High, but after AMO prep or as a cleanup sprint |
| Add OpenDyslexic toggle in settings                            | Medium                                          |
| Preserve relative row position during horizontal task movement | Low/medium                                      |
| Improve customization panel styling                            | Medium                                          |
| Chrome/Chromium support                                        | Later                                           |

---
