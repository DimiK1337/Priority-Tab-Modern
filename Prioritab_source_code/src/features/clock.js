//Prioritab_source_code/src/features/clock.js

const MONTH_LONG_NAMES = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
];

const MONTH_SHORT_NAMES = MONTH_LONG_NAMES.map(month => month.slice(0, 3));

const WEEKDAY_LONG_NAMES = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const pad2 = value => String(value).padStart(2, "0");

const formatDate = (date, format) => {
    const day = date.getDate();
    const monthIndex = date.getMonth();
    const month = monthIndex + 1;
    const year = date.getFullYear()

    const replacements = {
        YYYY: year,
        MMMM: MONTH_LONG_NAMES[monthIndex],
        MMM: MONTH_SHORT_NAMES[monthIndex],
        MM: pad2(month),
        DD: pad2(day),
        D: day
    };

    return format.replace(/YYYY|MMMM|MMM|MM|DD|D/g, token => replacements[token]);
};

const formatTime = (date, format) => {
    const hours24 = date.getHours();
    const hours12 = hours24 % 12 || 12;

    const replacements = {
        HH: pad2(hours24),
        H: hours24,
        h: hours12,
        mm: pad2(date.getMinutes()),
        ss: pad2(date.getSeconds()),
        A: hours24 < 12 ? "AM" : "PM"
    };

    return format.replace(/HH|H|h|mm|ss|A/g, token => replacements[token]);
};

const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const isLeapYear = year => new Date(year, 1, 29).getMonth() === 1;

function setElementText (selector, text) {
    const element = document.querySelector(selector);
    if (!element) return;
    element.textContent = text;
}

const getTime = () => setElementText("#clockbox", formatTime(new Date(), PRIORITAB_STATE.timeFormat));

const getDate = () => {
    const now = new Date();
    const dayOfWeek = WEEKDAY_LONG_NAMES[now.getDay()];
    const prettyDate = formatDate(now, PRIORITAB_STATE.dateFormat);
    setElementText("#daybox", dayOfWeek);
    setElementText("#datebox", prettyDate);
};

const countdownMonthYear = () => {
    const now = new Date();

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const progressMonthMS = now - monthStart;
    const totalMonthMS = getDaysInMonth(now) * PRIORITAB_DEFAULTS.totalDayMS;
    const monthProgressPCT = (progressMonthMS / totalMonthMS) * 100;
    const prettyMonthPCT = Math.round(monthProgressPCT);

    const yearStart = new Date(now.getFullYear(), 0, 1);
    const progressYearMS = now - yearStart;

    const totalYearMS = (isLeapYear(now.getFullYear()) ? 366 : 365) * PRIORITAB_DEFAULTS.totalDayMS;

    const yearProgressPCT = (progressYearMS / totalYearMS) * 100;
    const prettyYearPCT = Math.floor(yearProgressPCT);

    setElementText("#countdown-month-amount", `${prettyMonthPCT}%`);
    setElementText("#countdown-year-amount", `${prettyYearPCT}%`);

    setTimeout(countdownMonthYear, 1000);
};
