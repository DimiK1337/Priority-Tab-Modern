//Prioritab_source_code/src/features/countdown.js

function checkDayCountdown() {
    if ($( "#workday-checkbox" ).is(":checked")) {
        browser.storage.sync.set({
            [PRIORITAB_DEFAULTS.storageKeys.userUseWorkday]: "true"
        });
        countdownWorkday();
    } else {
        browser.storage.sync.set({
            [PRIORITAB_DEFAULTS.storageKeys.userUseWorkday]: "false"
        });
        countdownDay();
    }
}

function countdownDay() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const progressMS = now - todayStart;
    const progressPCT = (progressMS / PRIORITAB_DEFAULTS.totalDayMS) * 100;
    const prettyPCT = Math.round(progressPCT);

    $("#countdown-day .countdown-label").replaceWith(
        "<div class='countdown-label'>...of the day</div>"
    );

    document.getElementById("countdown-day-amount").innerHTML = `${prettyPCT}%`;
}

function countdownWorkday() {
    browser.storage.sync.get([
        PRIORITAB_DEFAULTS.storageKeys.userWorkdayStart,
        PRIORITAB_DEFAULTS.storageKeys.userWorkdayEnd
    ], function (retrieved) {
        const workdayStartString = retrieved[PRIORITAB_DEFAULTS.storageKeys.userWorkdayStart] ?? PRIORITAB_DEFAULTS.workday.start;

        const workdayEndString = retrieved[PRIORITAB_DEFAULTS.storageKeys.userWorkdayEnd] ?? PRIORITAB_DEFAULTS.workday.end;

        const workdayStartHour = workdayStartString.split(":")[0];
        const workdayStartMin = workdayStartString.split(":")[1];
        const workdayEndHour = workdayEndString.split(":")[0];
        const workdayEndMin = workdayEndString.split(":")[1];
        const now = new Date();
        const workdayStart = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            parseInt(workdayStartHour, 10),
            parseInt(workdayStartMin, 10)
        );

        const workdayEnd = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
            parseInt(workdayEndHour, 10),
            parseInt(workdayEndMin, 10)
        );
        
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

        $("#countdown-day .countdown-label").replaceWith(
            "<div class='countdown-label'>...of the workday</div>"
        );

        document.getElementById("countdown-day-amount").innerHTML = `${prettyPCT}%`;
    });
}