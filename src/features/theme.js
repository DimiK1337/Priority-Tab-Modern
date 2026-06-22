//src/features/theme.js

const COLOR_CUSTOMIZATION_STYLE_ID = "color-customization";
const colorCustomizationRules = new Map();

function getColorCustomizationStyleElement() {
    const styleEl = document.querySelector(`#${COLOR_CUSTOMIZATION_STYLE_ID}`) ?? document.createElement("style");
    if (!styleEl.id) {
        styleEl.id = COLOR_CUSTOMIZATION_STYLE_ID;
        document.head.appendChild(styleEl);
    }
    return styleEl;
}

function renderColorCustomizationStyles() {
    const styleEl = getColorCustomizationStyleElement();
    const cssRules = Array.from(colorCustomizationRules.values())
        .map( ({ className, propToChange, value }) => `.${className} { ${propToChange}: ${value}; }` )
        .join("\n");
    styleEl.textContent = cssRules;
}

function setColorProperty(classes, propToChange, newValue) {
    const getColorRuleKey = (className, propToChange) => `${className}:${propToChange}`;
    const classList = Array.isArray(classes) ? classes : [classes];
    classList.forEach((className) => {
        colorCustomizationRules.set(
            getColorRuleKey(className, propToChange),
            {
                className,
                propToChange,
                value: newValue
            }
        );
    });
    renderColorCustomizationStyles();
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

function debounce(fn, delay = 500) {
    let timeoutID;

    return function (...args) {
        clearTimeout(timeoutID);

        timeoutID = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
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

    const saveColorDebounced = debounce(function () {
        browser.storage.sync.set({
            [storageSyncKey]: input.value
        });
    }, 500);

    input.addEventListener("input", function () {
        const nextColor = input.value;

        setColorProperty(cssClasses, propType, nextColor);
        saveColorDebounced();
    });
    return input;
}

