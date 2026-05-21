//src/features/background-image.js

function setBodyBackgroundImage(imageValue) {
    document.body.style.backgroundImage = imageValue ? `url("${imageValue}")` : "none";
}

function setBodyBackgroundPosition(positionValue) {
    document.body.style.backgroundPosition = positionValue;
}

function notifyFluidBackgroundImageChanged(hasBackgroundImage) {
    if (typeof handleUserBackgroundImageChanged === "function") {
        handleUserBackgroundImageChanged(hasBackgroundImage);
    }
}

function initBackgroundImage() {
    const bodyEl = document.querySelector("body");
    const bgImageInput = document.querySelector("#bg_img_file_input");
    const uploadButton = document.querySelector("#uploadButton");
    const centerButton = document.querySelector("#centerImgBackground");
    const removeButton = document.querySelector("#removeBackgroundImg");

    if (bgImageInput) {
        bgImageInput.style.display = "none";
    }

    if (uploadButton && bgImageInput) {
        uploadButton.addEventListener("click", function () {
            bgImageInput.click();
        });
    }

    if (bgImageInput) {
        bgImageInput.addEventListener("change", function () {
            const file = bgImageInput.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onloadend = function () {
                browser.storage.local.set({
                    [PRIORITAB_DEFAULTS.storageKeys.userBackgroundImage]: reader.result
                }, function () {
                    setBodyBackgroundImage(reader.result);

                    // Important:
                    // Uploading an image means the bg-image toggle is now available.
                    // If fluid is enabled, this will check the checkbox and save true.
                    notifyFluidBackgroundImageChanged(true);
                });
            };
            reader.readAsDataURL(file);
        });
    }

    browser.storage.local.get(
        [PRIORITAB_DEFAULTS.storageKeys.userBackgroundImage],
        function (result) {
            const savedImage = result[PRIORITAB_DEFAULTS.storageKeys.userBackgroundImage];
            if (savedImage) {
                bodyEl.style.backgroundImage = `url("${savedImage}")`;
            }
        }
    );

    if (localStorage.setCentered === "center") {
        setBodyBackgroundPosition("center center");
    }

    if (centerButton) {
        centerButton.addEventListener("click", function () {
            if (localStorage.setCentered === "center") {
                setBodyBackgroundPosition("unset");
                localStorage.setCentered = "unset";
            } else {
                setBodyBackgroundPosition("center center");
                localStorage.setCentered = "center";
            }
        });
    }

    if (removeButton) {
        removeButton.addEventListener("click", function () {
            setBodyBackgroundImage(null);

            browser.storage.local.set({
                [PRIORITAB_DEFAULTS.storageKeys.userBackgroundImage]: null
            }, function () {
                notifyFluidBackgroundImageChanged(false);
            });
        });
    }
}