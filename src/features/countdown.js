//src/features/countdown.js
function checkDayCountdown() {
    const workdayCheckbox = document.querySelector("#workday-checkbox");
    if (workdayCheckbox.checked) {
        browser.storage.sync.set({[PRIORITAB_DEFAULTS.storageKeys.userUseWorkday]: "true"});
        countdownWorkday();
    } else {
        browser.storage.sync.set({[PRIORITAB_DEFAULTS.storageKeys.userUseWorkday]: "false"});
        countdownDay();
    }
}

function setElementText(selector, text) {
    const element = document.querySelector(selector);
    if (!element) return;
    element.textContent = text;
}

const createTodayTimeDate = (now, hour, minute) => new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute);

function countdownDay() {
    const now = new Date();
    const todayStart = createTodayTimeDate(now, 0, 0);

    const progressMS = now - todayStart;
    const progressPCT = (progressMS / PRIORITAB_DEFAULTS.totalDayMS) * 100;
    const prettyPCT = Math.round(progressPCT);

    setElementText("#countdown-day .countdown-label", "...of the day");
    setElementText("#countdown-day-amount", `${prettyPCT}%`);
}

function countdownWorkday() {
    browser.storage.sync.get([
        PRIORITAB_DEFAULTS.storageKeys.userWorkdayStart,
        PRIORITAB_DEFAULTS.storageKeys.userWorkdayEnd
    ], function (retrieved) {
        const workdayStartString =
            retrieved[PRIORITAB_DEFAULTS.storageKeys.userWorkdayStart] ??
            PRIORITAB_DEFAULTS.workday.start;

        const workdayEndString =
            retrieved[PRIORITAB_DEFAULTS.storageKeys.userWorkdayEnd] ??
            PRIORITAB_DEFAULTS.workday.end;

        const [workdayStartHour, workdayStartMin] = workdayStartString.split(":").map((value) => parseInt(value, 10));
        const [workdayEndHour, workdayEndMin] = workdayEndString.split(":").map((value) => parseInt(value, 10));
        const now = new Date();

        const workdayStart = createTodayTimeDate(now,workdayStartHour,workdayStartMin);
        const workdayEnd = createTodayTimeDate(now, workdayEndHour, workdayEndMin);

        let progressPCT = 0;

        if (now < workdayStart) {
            progressPCT = 0;
        } else if (now > workdayEnd) {
            progressPCT = 100;
        } else {
            const progressMS = now - workdayStart;
            const totalWorkdayMS = workdayEnd - workdayStart;
            progressPCT = (progressMS / totalWorkdayMS) * 100;
        }

        const prettyPCT = Math.round(progressPCT);

        setElementText("#countdown-day .countdown-label", "...of the workday");
        setElementText("#countdown-day-amount", `${prettyPCT}%`);
    });
}