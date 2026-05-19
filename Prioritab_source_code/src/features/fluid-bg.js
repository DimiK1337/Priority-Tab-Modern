// Prioritab_source_code/src/features/fluid-bg.js

let fluidResizeBound = false;
let fluidCursorBound = false;
let fluidInputEnabled = false;
let fluidInstanceCreated = false;

const FLUID_LOG_PREFIX = "[Prioritab Fluid]";
const DEBUG = false;

const fluidMouseState = {
    lastX: null,
    lastY: null,
    movementLogCount: 0
};

function fluidLog(message, data = undefined) {
    if (!DEBUG) return;

    if (data === undefined) {
        console.log(FLUID_LOG_PREFIX, message);
        return;
    }

    console.log(FLUID_LOG_PREFIX, message, data);
}

function getFluidEnabledKey() {
    return PRIORITAB_DEFAULTS.storageKeys.userFluidAnimationEnabled;
}

function getFluidBackgroundImageKey() {
    return PRIORITAB_DEFAULTS.storageKeys.userFluidShowBackgroundImage;
}

function getFluidCanvas() {
    return document.getElementById("fluid-bg");
}

function getFluidPointer() {
    return PRIORITAB_STATE.fluid?.pointers?.[0] ?? null;
}

function getFluidAnimationCheckbox() {
    return document.querySelector("#fluid-animation-checkbox");
}

function getFluidBackgroundImageCheckbox() {
    return document.querySelector("#fluid-show-background-image-checkbox");
}

function resetFluidMouseState(reason = "unknown") {
    fluidMouseState.lastX = null;
    fluidMouseState.lastY = null;
    fluidMouseState.movementLogCount = 0;

    fluidLog("resetFluidMouseState", { reason });
}

function setFluidCanvasVisible(isVisible) {
    const canvas = getFluidCanvas();

    if (!canvas) {
        fluidLog("setFluidCanvasVisible: no canvas found", { isVisible });
        return;
    }

    canvas.style.visibility = isVisible ? "visible" : "hidden";

    fluidLog("setFluidCanvasVisible", {
        isVisible,
        visibility: canvas.style.visibility
    });
}

function resizeFluidCanvas() {
    const canvas = getFluidCanvas();

    if (!canvas) {
        fluidLog("resizeFluidCanvas: no canvas found");
        return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    fluidLog("resizeFluidCanvas", {
        width: canvas.width,
        height: canvas.height
    });
}

function hasStoredBodyBackgroundImage(callback) {
    browser.storage.local.get(
        [PRIORITAB_DEFAULTS.storageKeys.userBackgroundImage],
        function (result) {
            const savedImage =
                result[PRIORITAB_DEFAULTS.storageKeys.userBackgroundImage];

            callback(Boolean(savedImage));
        }
    );
}

function showStoredBodyBackgroundImage() {
    browser.storage.local.get(
        [PRIORITAB_DEFAULTS.storageKeys.userBackgroundImage],
        function (result) {
            const savedImage =
                result[PRIORITAB_DEFAULTS.storageKeys.userBackgroundImage];

            if (savedImage) {
                document.body.style.backgroundImage = `url("${savedImage}")`;
            } else {
                document.body.style.backgroundImage = "";
            }

            fluidLog("showStoredBodyBackgroundImage", {
                hasSavedImage: Boolean(savedImage),
                backgroundImage: document.body.style.backgroundImage
            });
        }
    );
}

function hideBodyBackgroundImage() {
    document.body.style.backgroundImage = "none";

    fluidLog("hideBodyBackgroundImage", {
        backgroundImage: document.body.style.backgroundImage
    });
}

function applyFluidBackgroundImagePreference(showBackgroundImageBehindFluid) {
    if (showBackgroundImageBehindFluid) {
        showStoredBodyBackgroundImage();
        return;
    }

    hideBodyBackgroundImage();
}

function syncFluidBackgroundImageCheckbox({
    animationEnabled,
    hasBackgroundImage,
    showBackgroundImageBehindFluid
}) {
    const checkbox = getFluidBackgroundImageCheckbox();

    if (!checkbox) {
        fluidLog("syncFluidBackgroundImageCheckbox: checkbox not found");
        return;
    }

    const canUseToggle = animationEnabled && hasBackgroundImage;

    checkbox.disabled = !canUseToggle;
    checkbox.checked = canUseToggle ? showBackgroundImageBehindFluid : false;

    if (!canUseToggle) {
        browser.storage.sync.set({
            [getFluidBackgroundImageKey()]: false
        });
    }

    fluidLog("syncFluidBackgroundImageCheckbox", {
        animationEnabled,
        hasBackgroundImage,
        showBackgroundImageBehindFluid,
        canUseToggle,
        checked: checkbox.checked,
        disabled: checkbox.disabled
    });
}

function createFluidInstanceIfNeeded(reason = "unknown") {
    if (fluidInstanceCreated && PRIORITAB_STATE.fluid) {
        fluidLog("createFluidInstanceIfNeeded: already created", {
            reason,
            fluid: PRIORITAB_STATE.fluid,
            pointer: getFluidPointer()
        });

        return;
    }

    const canvas = getFluidCanvas();

    if (!canvas) {
        console.error(
            FLUID_LOG_PREFIX,
            "createFluidInstanceIfNeeded: No #fluid-bg canvas found"
        );
        return;
    }

    fluidLog("createFluidInstanceIfNeeded: creating Fluid", {
        reason,
        canvas
    });

    resizeFluidCanvas();

    PRIORITAB_STATE.fluid = new Fluid(canvas);

    // Always transparent. The bg toggle controls body background image visibility.
    PRIORITAB_STATE.fluid.mapBehaviors({
        transparent: true
    });

    PRIORITAB_STATE.fluid.activate();

    fluidInstanceCreated = true;

    if (!fluidResizeBound) {
        window.addEventListener("resize", resizeFluidCanvas);
        fluidResizeBound = true;

        fluidLog("createFluidInstanceIfNeeded: resize listener attached");
    }

    bindFluidToCursor();

    fluidLog("createFluidInstanceIfNeeded: done", {
        fluid: PRIORITAB_STATE.fluid,
        pointer: getFluidPointer()
    });
}

function enableFluidAnimation(reason = "unknown") {
    fluidLog("enableFluidAnimation", { reason });

    createFluidInstanceIfNeeded(reason);

    fluidInputEnabled = true;
    resetFluidMouseState(`enableFluidAnimation: ${reason}`);
    setFluidCanvasVisible(true);

    const backgroundCheckbox = getFluidBackgroundImageCheckbox();
    const showBackgroundImageBehindFluid = backgroundCheckbox?.checked ?? false;

    hasStoredBodyBackgroundImage(function (hasBackgroundImage) {
        syncFluidBackgroundImageCheckbox({
            animationEnabled: true,
            hasBackgroundImage,
            showBackgroundImageBehindFluid
        });

        applyFluidBackgroundImagePreference(
            hasBackgroundImage && showBackgroundImageBehindFluid
        );
    });

    fluidLog("enableFluidAnimation: done", {
        fluidInputEnabled,
        fluidInstanceCreated,
        pointer: getFluidPointer()
    });
}

function disableFluidAnimation(reason = "unknown") {
    fluidLog("disableFluidAnimation", { reason });

    fluidInputEnabled = false;
    resetFluidMouseState(`disableFluidAnimation: ${reason}`);
    setFluidCanvasVisible(false);

    hasStoredBodyBackgroundImage(function (hasBackgroundImage) {
        syncFluidBackgroundImageCheckbox({
            animationEnabled: false,
            hasBackgroundImage,
            showBackgroundImageBehindFluid: false
        });

        showStoredBodyBackgroundImage();
    });

    const pointer = getFluidPointer();

    if (pointer) {
        pointer.down = false;
        pointer.moved = false;
        pointer.dx = 0;
        pointer.dy = 0;
    }

    fluidLog("disableFluidAnimation: done", {
        fluidInputEnabled,
        fluidInstanceCreated,
        pointer
    });
}

function setFluidAnimationEnabled(isEnabled, reason = "unknown") {
    fluidLog("setFluidAnimationEnabled", {
        isEnabled,
        reason
    });

    if (isEnabled) {
        enableFluidAnimation(reason);
        return;
    }

    disableFluidAnimation(reason);
}

function bindFluidCheckbox() {
    const checkbox = getFluidAnimationCheckbox();

    if (!checkbox) {
        fluidLog("bindFluidCheckbox: checkbox not found");
        return;
    }

    fluidLog("bindFluidCheckbox: attaching change listener", {
        initialChecked: checkbox.checked
    });

    checkbox.addEventListener("change", function () {
        const enabledKey = getFluidEnabledKey();
        const animationEnabled = checkbox.checked;

        fluidLog("checkbox change: user toggled fluid animation", {
            enabledKey,
            animationEnabled
        });

        browser.storage.sync.set({
            [enabledKey]: animationEnabled
        }, function () {
            fluidLog("checkbox change: enabled key written", {
                enabledKey,
                animationEnabled
            });
        });

        setFluidAnimationEnabled(animationEnabled, "checkbox change");
    });
}

function bindFluidBackgroundCheckbox() {
    const checkbox = getFluidBackgroundImageCheckbox();

    if (!checkbox) {
        fluidLog("bindFluidBackgroundCheckbox: checkbox not found");
        return;
    }

    fluidLog("bindFluidBackgroundCheckbox: attaching change listener", {
        initialChecked: checkbox.checked
    });

    checkbox.addEventListener("change", function () {
        const animationCheckbox = getFluidAnimationCheckbox();
        const animationEnabled = animationCheckbox?.checked ?? false;

        hasStoredBodyBackgroundImage(function (hasBackgroundImage) {
            if (!animationEnabled || !hasBackgroundImage) {
                checkbox.checked = false;
                checkbox.disabled = true;

                browser.storage.sync.set({
                    [getFluidBackgroundImageKey()]: false
                });

                if (animationEnabled) {
                    hideBodyBackgroundImage();
                } else {
                    showStoredBodyBackgroundImage();
                }

                return;
            }

            const showBackgroundImageBehindFluid = checkbox.checked;

            browser.storage.sync.set({
                [getFluidBackgroundImageKey()]: showBackgroundImageBehindFluid
            }, function () {
                fluidLog("background checkbox change: key written", {
                    backgroundImageKey: getFluidBackgroundImageKey(),
                    showBackgroundImageBehindFluid
                });
            });

            applyFluidBackgroundImagePreference(showBackgroundImageBehindFluid);
        });
    });
}

function loadFluidSettings() {
    const enabledKey = getFluidEnabledKey();
    const backgroundImageKey = getFluidBackgroundImageKey();

    fluidLog("loadFluidSettings: reading storage", {
        enabledKey,
        backgroundImageKey
    });

    browser.storage.sync.get(
        {
            [enabledKey]: true,
            [backgroundImageKey]: false
        },
        function (syncResult) {
            const animationEnabled = syncResult[enabledKey];
            const showBackgroundImageBehindFluid = syncResult[backgroundImageKey];

            const animationCheckbox = getFluidAnimationCheckbox();

            if (animationCheckbox) {
                animationCheckbox.checked = animationEnabled;
            }

            hasStoredBodyBackgroundImage(function (hasBackgroundImage) {
                syncFluidBackgroundImageCheckbox({
                    animationEnabled,
                    hasBackgroundImage,
                    showBackgroundImageBehindFluid
                });

                setFluidAnimationEnabled(animationEnabled, "initial storage load");

                if (animationEnabled) {
                    applyFluidBackgroundImagePreference(
                        hasBackgroundImage && showBackgroundImageBehindFluid
                    );
                } else {
                    showStoredBodyBackgroundImage();
                }
            });
        }
    );
}

function handleUserBackgroundImageChanged(hasBackgroundImage) {
    const animationCheckbox = getFluidAnimationCheckbox();
    const animationEnabled = animationCheckbox?.checked ?? false;

    fluidLog("handleUserBackgroundImageChanged", {
        hasBackgroundImage,
        animationEnabled
    });

    if (!hasBackgroundImage) {
        syncFluidBackgroundImageCheckbox({
            animationEnabled,
            hasBackgroundImage: false,
            showBackgroundImageBehindFluid: false
        });

        browser.storage.sync.set({
            [getFluidBackgroundImageKey()]: false
        });

        if (animationEnabled) {
            hideBodyBackgroundImage();
        }

        return;
    }

    if (!animationEnabled) {
        syncFluidBackgroundImageCheckbox({
            animationEnabled: false,
            hasBackgroundImage: true,
            showBackgroundImageBehindFluid: false
        });

        showStoredBodyBackgroundImage();
        return;
    }

    syncFluidBackgroundImageCheckbox({
        animationEnabled: true,
        hasBackgroundImage: true,
        showBackgroundImageBehindFluid: true
    });

    browser.storage.sync.set({
        [getFluidBackgroundImageKey()]: true
    });

    applyFluidBackgroundImagePreference(true);
}

function initFluidBackground() {
    fluidLog("initFluidBackground: start");

    // Prevent visual flash before storage read finishes.
    setFluidCanvasVisible(false);

    // Checkboxes write their own keys.
    bindFluidCheckbox();
    bindFluidBackgroundCheckbox();

    // Storage read only applies initial state. It does not write keys.
    loadFluidSettings();

    fluidLog("initFluidBackground: done");
}

function bindFluidToCursor() {
    if (fluidCursorBound) {
        fluidLog("bindFluidToCursor: listener already attached");
        return;
    }

    fluidCursorBound = true;

    fluidLog("bindFluidToCursor: attaching mouse listeners");

    window.addEventListener("mousemove", function (event) {
        if (!fluidInputEnabled) {
            fluidMouseState.lastX = null;
            fluidMouseState.lastY = null;
            return;
        }

        const pointer = getFluidPointer();

        if (!pointer) {
            fluidMouseState.lastX = null;
            fluidMouseState.lastY = null;
            return;
        }

        if (fluidMouseState.lastX === null || fluidMouseState.lastY === null) {
            fluidMouseState.lastX = event.clientX;
            fluidMouseState.lastY = event.clientY;
        }

        pointer.down = true;
        pointer.moved = true;
        pointer.dx = (event.clientX - fluidMouseState.lastX) * 5.0;
        pointer.dy = (event.clientY - fluidMouseState.lastY) * 5.0;
        pointer.x = event.clientX;
        pointer.y = event.clientY;

        if (fluidMouseState.movementLogCount < 8) {
            fluidLog("mousemove: updated fluid pointer", {
                movementLogCount: fluidMouseState.movementLogCount,
                fluidInputEnabled,
                pointerDown: pointer.down,
                pointerMoved: pointer.moved,
                pointerX: pointer.x,
                pointerY: pointer.y,
                pointerDx: pointer.dx,
                pointerDy: pointer.dy,
                clientX: event.clientX,
                clientY: event.clientY
            });

            fluidMouseState.movementLogCount += 1;
        }

        fluidMouseState.lastX = event.clientX;
        fluidMouseState.lastY = event.clientY;
    });

    window.addEventListener("mouseleave", function () {
        const pointer = getFluidPointer();

        if (pointer) {
            pointer.down = false;
            pointer.moved = false;
            pointer.dx = 0;
            pointer.dy = 0;
        }

        resetFluidMouseState("mouseleave");

        fluidLog("mouseleave: pointer reset");
    });
}