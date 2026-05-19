//Prioritab_source_code/src/app.js

window.onload = function () {
    setDateTimeFormat();

    browser.storage.sync.get(
        PRIORITAB_DEFAULTS.storageKeys.userUseWorkday,
        function (result) {
            if (
                result[PRIORITAB_DEFAULTS.storageKeys.userUseWorkday] === "true"
            ) {
                countdownWorkday();
                $("#workday-checkbox").prop("checked", true);
            } else {
                countdownDay();
            }
        }
    );

    countdownMonthYear();

    setInterval(getTime, 1000);
    setInterval(countdownDay, 900000);

    setColors();
    initBackgroundImage();
    initPanels();
    initPrioritiesUi();

    createColorPickerInstance(
        "#background-color-selector",
        PRIORITAB_DEFAULTS.colors.bg,
        "main-bg-color",
        PRIORITAB_DEFAULTS.storageKeys.userBackgroundColor,
        true
    );

    createColorPickerInstance(
        "#font-color-selector",
        PRIORITAB_DEFAULTS.colors.font,
        ["main-font-color", "main-border-color"],
        PRIORITAB_DEFAULTS.storageKeys.userFontColor
    );

    createColorPickerInstance(
        "#shadow-color-selector",
        PRIORITAB_DEFAULTS.colors.shadow,
        ["shadow-color", "shadow-border-color"],
        PRIORITAB_DEFAULTS.storageKeys.userShadowColor
    );

    initFluidBackground();
    bindFluidToCursor();
};