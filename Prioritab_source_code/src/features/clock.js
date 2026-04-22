//Prioritab_source_code/src/features/clock.js

function getTime() {
    const prettyTime = moment().format(PRIORITAB_STATE.timeFormat);
    document.getElementById("clockbox").innerHTML = prettyTime;
}

function getDate() {
    const dayOfWeek = moment().format("dddd");
    const prettyDate = moment().format(PRIORITAB_STATE.dateFormat);

    document.getElementById("daybox").innerHTML = dayOfWeek;
    document.getElementById("datebox").innerHTML = prettyDate;
}

function countdownMonthYear() {
    const now = new Date();

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const progressMonthMS = now - monthStart;
    const totalMonthMS = moment().daysInMonth() * PRIORITAB_DEFAULTS.totalDayMS;
    const monthProgressPCT = progressMonthMS / totalMonthMS * 100;
    const prettyMonthPCT = Math.round(monthProgressPCT);

    const yearStart = new Date(now.getFullYear(), 0, 1);
    const progressYearMS = now - yearStart;

    const isLeapYear = moment().isLeapYear();
    const totalYearMS = (isLeapYear ? 366 : 365) * PRIORITAB_DEFAULTS.totalDayMS;
    const yearProgressPCT = progressYearMS / totalYearMS * 100;
    const prettyYearPCT = Math.floor(yearProgressPCT);

    document.getElementById("countdown-month-amount").innerHTML = `${prettyMonthPCT}%`;
    document.getElementById("countdown-year-amount").innerHTML = `${prettyYearPCT}%`;

    setTimeout(countdownMonthYear, 1000);
}