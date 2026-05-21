//src/features/priorities-ui.js

function initPrioritiesUi() {
  const { qs, qsa, on, hide, show } = window.PrioritabDom;

  // Tiny helper function to reset a color picker when restoring default colors of the customize color section
  function setColorInputValue(selector, colorValue) {
    const input = qs(selector);
    if (!input) return;
    input.value = colorValue;
  }

  browser.storage.sync.get([
    PRIORITAB_DEFAULTS.storageKeys.userWorkdayStart,
    PRIORITAB_DEFAULTS.storageKeys.userWorkdayEnd
  ], function (retrieved) {
    const workdayStart =
      retrieved[PRIORITAB_DEFAULTS.storageKeys.userWorkdayStart] ??
      PRIORITAB_DEFAULTS.workday.start;

    const workdayEnd =
      retrieved[PRIORITAB_DEFAULTS.storageKeys.userWorkdayEnd] ??
      PRIORITAB_DEFAULTS.workday.end;

    qs('#workday-start-timeinput').value = workdayStart;
    qs('#workday-end-timeinput').value = workdayEnd;
  });

  qsa('.edit-priorities-link').forEach((editLink) => {
    editLink.addEventListener('click', (event) => {
      event.preventDefault();

      qsa('.edit-priorities').forEach((editPanel) => {
        hide(editPanel);

        const siblingEditLink = editPanel.parentElement.querySelector('.edit-priorities-link');
        show(siblingEditLink);
      });

      hide(editLink);

      const listContainer = editLink.parentElement;
      const prioritiesList = listContainer.querySelector('.edit-priorities');

      show(prioritiesList);

      const todoInput = prioritiesList.querySelector('input.todo');
      todoInput.focus();
    });
  });

  qsa('.hide-edit').forEach((hideEditLink) => {
    hideEditLink.addEventListener('click', (event) => {
      event.preventDefault();

      const editPanel = hideEditLink.parentElement;
      hide(editPanel);

      const editLink = editPanel.parentElement.querySelector('.edit-priorities-link');
      show(editLink);
    });
  });

  qsa('.customize-selector-label').forEach((customizeLabel) => {
    customizeLabel.addEventListener('click', () => {
      const parent = customizeLabel.parentElement;

      parent.querySelectorAll('.color-selector-label').forEach((colorLabel) => {
        colorLabel.style.visibility = 'hidden';
      });

      show(customizeLabel);
      customizeLabel.style.fontWeight = 'bold';
    });
  });

  on(qs('#restore-default-colors'), 'click', () => {
    const defaultBgColor = PRIORITAB_DEFAULTS.colors.bg;
    const defaultFontColor = PRIORITAB_DEFAULTS.colors.font;
    const defaultShadowColor = PRIORITAB_DEFAULTS.colors.shadow;

    setColorProperty('main-bg-color', 'background-color', defaultBgColor);
    setColorProperty(['main-font-color', 'main-border-color'], 'color', defaultFontColor);
    setColorProperty(['shadow-color', 'shadow-border-color'], 'color', defaultShadowColor);

    setColorInputValue('#background-color-selector', defaultBgColor);
    setColorInputValue('#font-color-selector', defaultFontColor);
    setColorInputValue('#shadow-color-selector', defaultShadowColor);

    browser.storage.sync.set({
      [PRIORITAB_DEFAULTS.storageKeys.userBackgroundColor]: defaultBgColor,
      [PRIORITAB_DEFAULTS.storageKeys.userFontColor]: defaultFontColor,
      [PRIORITAB_DEFAULTS.storageKeys.userShadowColor]: defaultShadowColor
    });
  });

  on(qs('#workday-checkbox'), 'click', () => {
    checkDayCountdown();
  });

  on(qs('#workday-time-save'), 'click', () => {
    const workdayStart = qs('#workday-start-timeinput').value;
    const workdayEnd = qs('#workday-end-timeinput').value;

    browser.storage.sync.set({
      [PRIORITAB_DEFAULTS.storageKeys.userWorkdayStart]: workdayStart,
      [PRIORITAB_DEFAULTS.storageKeys.userWorkdayEnd]: workdayEnd
    });

    checkDayCountdown();
  });

  on(qs('#date-time-format-save'), 'click', () => {
    const dateFormatInput = qs('#date-format-input');
    const timeFormatInput = qs('#time-format-input');

    PRIORITAB_STATE.dateFormat = dateFormatInput.selectedOptions[0].textContent;
    PRIORITAB_STATE.timeFormat = timeFormatInput.selectedOptions[0].textContent;

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
