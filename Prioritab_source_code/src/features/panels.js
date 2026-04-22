//Prioritab_source_code/src/features/panels.js
function initPanels() {
    $(document).click(function (event) {
        if (!$(event.target).closest("#customize-corner").length) {
            if ($("#customize-corner").is(":visible")) {
                $("#customize-selectors").hide();
                $("#customize-button").fadeIn();
            }
        }

        const listClassSuffixes = ["left", "mid", "right"];

        for (const suffix of listClassSuffixes) {
            if (!$(event.target).closest(`#list-${suffix}`).length) {
                if ($(`#list-${suffix} .edit-priorities`).is(":visible")) {
                    $(`#list-${suffix} .edit-priorities`).hide();
                    $(`#list-${suffix} .edit-priorities-link`).show();
                }
            }
        }
    });

    $("#info-corner").hover(
        function () {
            $(this).children("#info-button").hide();
            $(this).children("#info").fadeIn();
        },
        function () {
            $(this).children("#info").hide();
            $(this).children("#info-button").fadeIn();
        }
    );

    $("#customize-button").click(function () {
        $("#customize-button").hide();
        $("#customize-selectors").fadeIn();
    });

    $("#hide-customize-selectors").click(function () {
        $("#customize-selectors").hide();
        $("#customize-button").fadeIn();
    });

    browser.storage.sync.get(
        PRIORITAB_DEFAULTS.storageKeys.update20151231,
        function (result) {
            if (!result[PRIORITAB_DEFAULTS.storageKeys.update20151231]) {
                $("#update-footer").fadeIn(500).fadeOut(500).fadeIn(500);

                browser.storage.sync.set({
                    [PRIORITAB_DEFAULTS.storageKeys.update20151231]: true
                });
            }
        }
    );

    $("#update-hide").click(function () {
        $("#update-footer").hide();

        browser.storage.sync.set({
            [PRIORITAB_DEFAULTS.storageKeys.update20151231]: true
        });
    });

    $("#uninstall-extension-button").click(function () {
        browser.management.uninstallSelf({ showConfirmDialog: true });
    });
}