//Prioritab_source_code/src/features/fluid-bg.js

function initFluidBackground() {
    const canvas = document.getElementById("fluid-bg");

    if (!canvas) {
        console.error('No #fluid-bg canvas found');
        return;
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();

    PRIORITAB_STATE.fluid = new Fluid(canvas);
    /* PRIORITAB_STATE.fluid.mapBehaviors({
        //sim_resolution: 128,
        //dye_resolution: 512,
        paused: false,
        multi_color: true,
        dissipation: 0.985,
        velocity: 0.99,
        pressure: 0.8,
        pressure_iteration: 20,
        curl: 25,
        emitter_size: 0.35,
        transparent: true
    }); */
    PRIORITAB_STATE.fluid.activate();

    console.log("fluid", PRIORITAB_STATE.fluid);

    window.addEventListener("resize", resizeCanvas);
}

function bindFluidToCursor() {
    if (
        !PRIORITAB_STATE.fluid ||
        !PRIORITAB_STATE.fluid.pointers ||
        !PRIORITAB_STATE.fluid.pointers[0]
    ) {
        console.error("Fluid pointer state is not available");
        return;
    }

    const pointer = PRIORITAB_STATE.fluid.pointers[0];

    let lastX = null;
    let lastY = null;

    window.addEventListener("mousemove", function (e) {
        if (lastX === null || lastY === null) {
            lastX = e.clientX;
            lastY = e.clientY;
        }

        pointer.down = true;
        pointer.moved = true;
        pointer.dx = (e.clientX - lastX) * 5.0;
        pointer.dy = (e.clientY - lastY) * 5.0;
        pointer.x = e.clientX;
        pointer.y = e.clientY;

        lastX = e.clientX;
        lastY = e.clientY;
    });

    window.addEventListener("mouseleave", function () {
        pointer.down = false;
        pointer.moved = false;
        lastX = null;
        lastY = null;
    });
}