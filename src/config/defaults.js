//src/config/defaults.js

const PRIORITAB_DEFAULTS = {
    totalDayMS: 24 * 60 * 60 * 1000,

    dateFormat: "YYYY-MM-DD",
    timeFormat: "HH:mm:ss A",

    colors: {
        bg: "#222222",
        font: "#ffffff",
        shadow: "rgba(255, 255, 255, 0.3)"
    },

    workday: {
        start: "09:00",
        end: "18:00",
        enabled: "false"
    },

    storageKeys: {
        userBackgroundColor: "user-background-color",
        userFontColor: "user-font-color",
        userShadowColor: "user-shadow-color",
        userDateFormat: "user-date-format",
        userTimeFormat: "user-time-format",
        userUseWorkday: "user-use-workday",
        userWorkdayStart: "user-workday-start",
        userWorkdayEnd: "user-workday-end",
        userBackgroundImage: "user_bg_img",
        userFluidAnimationEnabled: "user-fluid-animation-enabled",
        userFluidShowBackgroundImage: "user-fluid-show-background-image",
        update20151231: "update-20151231"
    }
};

// Temporary shared mutable state.
// Keeping this simple for now while jQuery-era code is being split out.
let PRIORITAB_STATE = {
    dateFormat: PRIORITAB_DEFAULTS.dateFormat,
    timeFormat: PRIORITAB_DEFAULTS.timeFormat,
    fluid: null
};