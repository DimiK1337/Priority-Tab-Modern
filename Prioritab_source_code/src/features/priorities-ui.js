//Prioritab_source_code/src/features/priorities-ui.js

function initPrioritiesUi() {
    browser.storage.sync.get([
        PRIORITAB_DEFAULTS.storageKeys.userWorkdayStart, 
        PRIORITAB_DEFAULTS.storageKeys.userWorkdayEnd
    ], function (retrieved) {
        const workdayStart = retrieved[PRIORITAB_DEFAULTS.storageKeys.userWorkdayStart] ?? PRIORITAB_DEFAULTS.workday.start;
        const workdayEnd = retrieved[PRIORITAB_DEFAULTS.storageKeys.userWorkdayEnd] ?? PRIORITAB_DEFAULTS.workday.end;
        $("#workday-start-timeinput")[0].value = workdayStart;
        $("#workday-end-timeinput")[0].value = workdayEnd;
    });

    $(".edit-priorities-link").click(function () {
        $(".edit-priorities").each(function () {
            $(this).hide();
            $(this).siblings(".edit-priorities-link").fadeIn();
        });

        $(this).hide();

        const prioritiesList = $(this).siblings(".edit-priorities")[0];
        $(prioritiesList).fadeIn();
        $(prioritiesList).find("input.todo").focus();
    });

    $(".hide-edit").click(function () {
        $(this).parent().hide();
        $(this).parent().siblings(".edit-priorities-link").show();
    });



    $(".customize-selector-label").click(function () {
        $(this).siblings(".color-selector-label").css("visibility", "hidden");
        $(this).show();
        $(this).css("font-weight", "bold");
    });

    $("#restore-default-colors").click(function () {
        setColorProperty("main-bg-color", "background-color", PRIORITAB_DEFAULTS.colors.bg);
        browser.storage.sync.set({
            [PRIORITAB_DEFAULTS.storageKeys.userBackgroundColor]:
                PRIORITAB_DEFAULTS.colors.bg
        });

        setColorProperty( ["main-font-color", "main-border-color"], "color", PRIORITAB_DEFAULTS.colors.font);
        browser.storage.sync.set({
            [PRIORITAB_DEFAULTS.storageKeys.userFontColor]:
                PRIORITAB_DEFAULTS.colors.font
        });

        setColorProperty( ["shadow-color", "shadow-border-color"], "color", PRIORITAB_DEFAULTS.colors.shadow);
        browser.storage.sync.set({
            [PRIORITAB_DEFAULTS.storageKeys.userShadowColor]:
                PRIORITAB_DEFAULTS.colors.shadow
        });
    });

    $("#workday-checkbox").click(function () {
        checkDayCountdown();
    });

    $("#workday-time-save").click(function () {
        const workdayStart = $("#workday-start-timeinput")[0].value;
        const workdayEnd = $("#workday-end-timeinput")[0].value;

        browser.storage.sync.set({
            [PRIORITAB_DEFAULTS.storageKeys.userWorkdayStart]: workdayStart,
            [PRIORITAB_DEFAULTS.storageKeys.userWorkdayEnd]: workdayEnd
        });

        checkDayCountdown();
    });

    $("#date-time-format-save").click(function () {
        PRIORITAB_STATE.dateFormat = $("#date-format-input option:selected").text();
        PRIORITAB_STATE.timeFormat = $("#time-format-input option:selected").text();

        browser.storage.sync.set({
            [PRIORITAB_DEFAULTS.storageKeys.userTimeFormat]:
                PRIORITAB_STATE.timeFormat
        });

        browser.storage.sync.set({
            [PRIORITAB_DEFAULTS.storageKeys.userDateFormat]:
                PRIORITAB_STATE.dateFormat
        });

        getDate();
        getTime();
    });
}