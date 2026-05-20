//Prioritab_source_code/src/features/theme.js

function setColorProperty(classes, propToChange, newValue) {
    const selectors = Array.isArray(classes)
        ? classes.map(className => `.${className}`).join(", ")
        : `.${classes}`;

    const style = document.createElement("style");
    style.textContent = `${selectors} { ${propToChange}: ${newValue}; }`;
    document.head.appendChild(style);
}

function setColors() {
    browser.storage.sync.get(
        PRIORITAB_DEFAULTS.storageKeys.userBackgroundColor,
        function (result) {
            const bgColor = result[PRIORITAB_DEFAULTS.storageKeys.userBackgroundColor] ?? PRIORITAB_DEFAULTS.colors.bg;
            setColorProperty("main-bg-color", "background-color", bgColor);
        }
    );

    browser.storage.sync.get(
        PRIORITAB_DEFAULTS.storageKeys.userFontColor,
        function (result) {
            const fontColor = result[PRIORITAB_DEFAULTS.storageKeys.userFontColor] ?? PRIORITAB_DEFAULTS.colors.font;
            setColorProperty(
                ["main-font-color", "main-border-color"],
                "color",
                fontColor
            );
        }
    );

    browser.storage.sync.get(
        PRIORITAB_DEFAULTS.storageKeys.userShadowColor,
        function (result) {
            const shadowColor = result[PRIORITAB_DEFAULTS.storageKeys.userShadowColor] ?? PRIORITAB_DEFAULTS.colors.shadow;
            setColorProperty(
                ["shadow-color", "shadow-border-color"],
                "color",
                shadowColor
            );
        }
    );
}

function setDateTimeFormat() {
    browser.storage.sync.get(
        { [PRIORITAB_DEFAULTS.storageKeys.userDateFormat]: "MMM D, YYYY" },
        function (result) {
            PRIORITAB_STATE.dateFormat = result[PRIORITAB_DEFAULTS.storageKeys.userDateFormat];
            getDate();
            const dateFormatInput = document.querySelector("#date-format-input");
            dateFormatInput.value = PRIORITAB_STATE.dateFormat;
        }
    );

    browser.storage.sync.get(
        { [PRIORITAB_DEFAULTS.storageKeys.userTimeFormat]: "h:mm:ss A" },
        function (result) {
            PRIORITAB_STATE.timeFormat = result[PRIORITAB_DEFAULTS.storageKeys.userTimeFormat];
            getTime();
            const timeFormatInput = document.querySelector("#time-format-input");
            timeFormatInput.value = PRIORITAB_STATE.timeFormat;
        }
    );
}

function createColorPickerInstance(
    inputID,
    defaultColor,
    cssClasses,
    storageSyncKey,
    isBackgroundColor = false
) {
    const inputSelector = inputID.startsWith("#") ? inputID : `#${inputID}`;
    const input = document.querySelector(inputSelector);
    if (!input) {
        console.error(`Color input not found: ${inputSelector}`);
        return null;
    }

    const propType = isBackgroundColor ? "background-color" : "color";

    browser.storage.sync.get(
        { [storageSyncKey]: defaultColor },
        function (result) {
            const savedColor = result[storageSyncKey] ?? defaultColor;

            input.value = savedColor;
            setColorProperty(cssClasses, propType, savedColor);
        }
    );

    input.addEventListener("input", function () {
        const nextColor = input.value;

        setColorProperty(cssClasses, propType, nextColor);

        browser.storage.sync.set({
            [storageSyncKey]: nextColor
        });
    });

    input.addEventListener("change", function () {
        browser.storage.sync.set({
            [storageSyncKey]: input.value
        });
    });

    return input;
}
