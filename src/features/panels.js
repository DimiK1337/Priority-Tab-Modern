//Prioritab_source_code/src/features/panels.js

// TODO: Get rid of this, since the update shit is useless (since I removed it)
function flashUpdateFooter(updateFooter) {
    const { show, hide } = window.PrioritabDom;

    if (!updateFooter) return;
    show(updateFooter);

    setTimeout(() => hide(updateFooter), 500);
    setTimeout(() => show(updateFooter), 1000);
}

function initPanels() {
    const { qs, on, hide, show, isVisible } = window.PrioritabDom;

    document.addEventListener("click", (event) => {
        const customizeCorner = qs("#customize-corner");
        const customizeSelectors = qs("#customize-selectors");
        const customizeButton = qs("#customize-button");

        if (!customizeCorner.contains(event.target) && isVisible(customizeSelectors)) {
            hide(customizeSelectors);
            show(customizeButton, "inline");
        }

        const listClassSuffixes = ["left", "mid", "right"];

        for (const suffix of listClassSuffixes) {
            const list = qs(`#list-${suffix}`);

            if (!list.contains(event.target)) {
                const editPriorities = qs(".edit-priorities", list);
                const editPrioritiesLink = qs(".edit-priorities-link", list);

                if (!isVisible(editPriorities)) continue;
                hide(editPriorities);
                show(editPrioritiesLink);
            }
        }
    });

    on(qs("#customize-button"), "click", (event) => {
        event.stopPropagation();

        hide(qs("#customize-button"));
        show(qs("#customize-selectors"));
    });

    on(qs("#hide-customize-selectors"), "click", (event) => {
        event.stopPropagation();

        hide(qs("#customize-selectors"));
        show(qs("#customize-button"), "inline");
    });

    browser.storage.sync.get(
        PRIORITAB_DEFAULTS.storageKeys.update20151231,
        function (result) {
            if (!result[PRIORITAB_DEFAULTS.storageKeys.update20151231]) {
                flashUpdateFooter(qs("#update-footer"));

                browser.storage.sync.set({
                    [PRIORITAB_DEFAULTS.storageKeys.update20151231]: true
                });
            }
        }
    );

    on(qs("#update-hide"), "click", () => {
        hide(qs("#update-footer"));

        browser.storage.sync.set({
            [PRIORITAB_DEFAULTS.storageKeys.update20151231]: true
        });
    });

    on(qs("#uninstall-extension-button"), "click", () => {
        browser.management.uninstallSelf({ showConfirmDialog: true });
    });
}
