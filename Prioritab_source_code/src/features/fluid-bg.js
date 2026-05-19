// Prioritab_source_code/src/features/fluid-bg.js

let fluidResizeBound = false;
let fluidCursorBound = false;
let fluidInputEnabled = false;
let fluidInstanceCreated = false;

const FLUID_LOG_PREFIX = "[Prioritab Fluid]";



const fluidMouseState = {
    lastX: null,
    lastY: null,
    movementLogCount: 0
};

const DEBUG = false;
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

function getFluidCanvas() {
    return document.getElementById("fluid-bg");
}

function getFluidPointer() {
    return PRIORITAB_STATE.fluid?.pointers?.[0] ?? null;
}

function getFluidAnimationCheckbox() {
    return document.querySelector("#fluid-animation-checkbox");
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
        console.error(FLUID_LOG_PREFIX, "createFluidInstanceIfNeeded: No #fluid-bg canvas found");
        return;
    }

    fluidLog("createFluidInstanceIfNeeded: creating Fluid", {
        reason,
        canvas
    });

    resizeFluidCanvas();

    PRIORITAB_STATE.fluid = new Fluid(canvas);

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

function syncCheckboxFromStoredValue(storedValue) {
    const checkbox = getFluidAnimationCheckbox();
    const animationEnabled = storedValue ?? true;

    fluidLog("syncCheckboxFromStoredValue", {
        storedValue,
        animationEnabled,
        checkboxFound: Boolean(checkbox)
    });

    if (checkbox) {
        checkbox.checked = animationEnabled;
    }

    return animationEnabled;
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

function loadFluidEnabledState() {
    const enabledKey = getFluidEnabledKey();

    fluidLog("loadFluidEnabledState: reading storage", {
        enabledKey
    });

    browser.storage.sync.get(enabledKey, function (result) {
        const storedValue = result[enabledKey];
        const animationEnabled = syncCheckboxFromStoredValue(storedValue);

        fluidLog("loadFluidEnabledState: storage read complete", {
            enabledKey,
            storedValue,
            animationEnabled,
            fullResult: result
        });

        setFluidAnimationEnabled(animationEnabled, "initial storage load");
    });
}

function initFluidBackground() {
    fluidLog("initFluidBackground: start");

    // Prevent visual flash before storage read finishes.
    setFluidCanvasVisible(false);

    // The checkbox is the only thing allowed to write the enabled key.
    bindFluidCheckbox();

    // Storage read only applies initial state. It does not write the key.
    loadFluidEnabledState();

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
