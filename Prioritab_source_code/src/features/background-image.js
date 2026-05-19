//Prioritab_source_code/src/features/background-image.js



//TODO: Clean this up
function initBackgroundImage() {
    const bodyEl = document.querySelector("body");

    $("#bg_img_file_input").hide();

    $("#uploadButton").on("click", function () {
        $("#bg_img_file_input").click();
    });

    $("#bg_img_file_input").change(function () {
        const file = this.files[0];
        const reader = new FileReader();

        reader.onloadend = function () {
            browser.storage.local.set({
                [PRIORITAB_DEFAULTS.storageKeys.userBackgroundImage]: reader.result
            }, function () {
                console.log("Background image saved");
            });

            $("body").css("background-image", `url("${reader.result}")`);
        };

        if (file) {
            reader.readAsDataURL(file);
        }
    });

    browser.storage.local.get(
        [PRIORITAB_DEFAULTS.storageKeys.userBackgroundImage],
        function (result) {
            const savedImage =
                result[PRIORITAB_DEFAULTS.storageKeys.userBackgroundImage];

            if (savedImage) {
                bodyEl.style.backgroundImage = `url("${savedImage}")`;
            }
        }
    );

    if (localStorage.setCentered === "center") {
        $("body").css("background-position", "center center");
    }

    $("#centerImgBackground").on("click", function () {
        if (localStorage.setCentered === "center") {
            $("body").css("background-position", "unset");
            localStorage.setCentered = "unset";
        } else {
            $("body").css("background-position", "center center");
            localStorage.setCentered = "center";
        }
    });

    $("#removeBackgroundImg").on("click", function () {
        document.body.style.backgroundImage = "none";
        browser.storage.local.set({
            [PRIORITAB_DEFAULTS.storageKeys.userBackgroundImage]: null
        });
    });
}