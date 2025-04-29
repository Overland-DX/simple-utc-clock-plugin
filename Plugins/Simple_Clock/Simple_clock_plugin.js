(() => { /*

Simple Clock v1.10.1
For FM-DX-Webserver v1.3.5 or later.
This is open source code. Feel free to do whatever you want with it.


Step 1:
If you only want UTC time to be displayed, you don't need to change anything in the setting.

Step 2:
If you want to display only local server time, use "local" in DISPLAY_MODE. If you want to display both UTC time and Server time, use "auto" in DISPLAY_MODE.
For local server time to be displayed correctly, you must also select your time zone in LOCAL_TIMEZONE.
And if your area uses daylight saving time, you must set USE_DST to "true"
*/
let DISPLAY_MODE = "utc";  // "auto" = Users can switch, "local" = Only local Server time, "utc" = Only UTC time. Default is "utc"
let LOCAL_TIMEZONE = "Etc/GMT-1";  // Set the desired timezone. For example: "Europe/London" for UK, or "Etc/GMT-1" for zone UTC+01:00.
let USE_DST = true;  // Important if you use GMT as a zone that uses daylight saving time. Valid usage: true or false
/*
Note!
If you are unsure which time zone to use, you can find some tips/info here: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones



Step 3: Customize the Simple Clock (Optional)
*/
const DEFAULT_CLOCK_SIZE_SCALE = 3;  // Set the default value for the clock size. Between 0 and 7 are allowed.
const MAX_CLOCK_ZOOM_LEVEL = 7; // Set the maximum step that the user can zoom in and out. Between 1 and 7 are allowed
const DEFAULT_FONT_INDEX = 0; // Change from 0 to 4: 0 = standard, 1 = font1, 2 = font2, 3 = font3, 4 = font4
const DEFAULT_COLOR_NAME = "Theme Color"; // Choose name from COLOR_PRESETS – e.g.: "Turquoise", "Pink", "Theme Color"
const ALLOW_USER_CLOCK_FONT_CHANGE = false; // true = user can change font
const ALLOW_USER_CLOCK_COLOR_CHANGE = false; // true = user can change color
const ALLOW_USER_CLOCK_SIZE_CHANGE = false; // Set to true if users should be able to change clock size. Default is false.
const HIDE_TIME_FORMAT_DROPDOWN = true; // Set to false to show the clock format dropdown in sidesettings. Default is true.
let PLUGIN_POSITION = "after"; // "after" or "before" other plugins in the rigth area on the topbar.
let TOOLTIP_MODE = "normal"; // Choose "limited" tooltip or "normal" tooltip. "limited" shows only time mode while "normal" shows time mode + dynamic data. Default is "normal".
const HIDE_CLOCK_ON_MOBILE = false; // Set to true; if you want to hide clock from be displayed on the mobile. Default is false.
const HIDE_TIME_MODE = false; // Set to true to hide the UTC (icon/text) which is displayed above the clock. Default is false.
let SHOW_SECONDS = true; // Show clock seconds. true = shows seconds, false = hides seconds.
const DEFAULT_TIME_FORMAT = "24h dd MMM yyyy"; // Set the default clock format. Default is preset to "24h dd MMM yyyy"
/*
************************************************************************************************************************
* 												Available time formats:												   *
************************************************************************************************************************
*1   "24h dd.MM.yyyy":   Shows 24 hour clock and date day.month.year, for example: (14:40:30 | 03.05.2025)			  1*
*2   "24h dd MMM yyyy":  Shows 24 hour clock and date day month year, for example: (14:40:30 | 03 May 2025)			  2*
*3   "12h dd.MM.yyyy":   Shows 12 hour clock and date day.month.year, for example: (PM 02:40:30 | 03.05.2025)		  3*
*4   "24h MM.dd.yyyy":   Shows 24 hour clock and date month.day.year, for example: (14:40:30 | 05.03.2025)			  4*
*5   "24h MMM dd yyyy":  Shows 24 hour clock and date monthvday year, for example: (14:40:30 | May 03 2025)			  5*
*6   "12h MM.dd.yyyy":   Shows 12 hour clock and date month.day.year, for example: (PM 02:40:30 | 05.03.2025)		  6*
*7   "24h yyyy.MM.dd":   Shows 24 hour clock and date year.month.day, for example: (14:40:30 | 2025.05.03)			  7*
*8   "24h yyyy MMM dd":  Shows 24 hour clock and date year month day, for example: (14:40:30 | 2025 May 03)			  8*
*9   "12h yyyy.MM.dd":   Shows 24 hour clock and date year.month.day, for example: (PM 02:40:30 | 2025.05.03)		  9*
*10  "24h Time Only":    Shows only 24 hour clock and no date, for example: (14:40:30)								 10*
************************************************************************************************************************
*/

// The API_SERVER_ADDRESS and TIME_SERVER_RESPONSE settings are only need to be changed if you are going to use your own time-server API.
let API_SERVER_ADDRESS = "time.fmdx.no"; // URL to timeserver, do not include http:// or https://. You can use any server API as long as it follows ISO 8601 format.
let TIME_SERVER_RESPONSE = "utc_time";  // Change the time server response string.
// For example, if the time server's api looks like this "utc_time": "2025-03-02T15:02:20Z", then you should use "utc_time"










// Below is the main code. Please do not change anything unless you know what you are doing.
const CURRENT_VERSION = "1.10.1";

const COLOR_PRESETS = {
    "Theme Color": "auto",
    "Turquoise": "#1abc9c",
    "Sky Blue": "#3498db",
    "Amethyst": "#9b59b6",
    "Red": "#e74c3c",
    "Sunflower": "#f1c40f",
    "Emerald": "#2ecc71",
    "Orange": "#e67e22",
    "Light Gray": "#ecf0f1",
    "Dark Slate": "#34495e",
    "Pink": "#fd79a8",
    "Cyan": "#00cec9",
    "Deep Pink": "#e84393",
    "Pumpkin": "#d35400",
    "Concrete": "#7f8c8d"
};

function migrateOldKeys() {
    const migrations = {
        "SIMPLE_CLOCK_FONT_SIZE_SCALE": "sc-font-size",
        "SIMPLE_CLOCK_USE_UTC": "sc-use-utc",
        "SIMPLE_CLOCK_CLOCK_FORMAT": "sc-format",
        "SIMPLE_CLOCK_HIDE_CLOCK": "sc-hide",
        "SIMPLE_CLOCK_PLUGIN_VERSION": "sc-version",
        "CLOCK_FONT_INDEX": "sc-font-index",
        "CLOCK_COLOR_INDEX": "sc-color-index",
        "WIDGET_WIDTH_SCALE": "sc-widget-width",
    };

    for (const [oldKey, newKey] of Object.entries(migrations)) {
        const oldValue = localStorage.getItem(oldKey);
        if (oldValue !== null) {
            console.log(`Migrating ${oldKey} → ${newKey}`);
            localStorage.setItem(newKey, oldValue);
            localStorage.removeItem(oldKey);
        }
    }
}

migrateOldKeys();

if (ALLOW_USER_CLOCK_SIZE_CHANGE) {
    let SIMPLE_CLOCK_FONT_SIZE_SCALE = parseInt(localStorage.getItem("sc-font-size"));
    if (isNaN(SIMPLE_CLOCK_FONT_SIZE_SCALE) || SIMPLE_CLOCK_FONT_SIZE_SCALE < 0 || SIMPLE_CLOCK_FONT_SIZE_SCALE > 7) {
        SIMPLE_CLOCK_FONT_SIZE_SCALE = DEFAULT_CLOCK_SIZE_SCALE;
        localStorage.setItem("sc-font-size", DEFAULT_CLOCK_SIZE_SCALE);
    }
}

if (!localStorage.getItem("sc-version") || 
    localStorage.getItem("sc-version") !== CURRENT_VERSION) {   
    console.log("Ingen eller gammel versjon oppdaget – rydder opp lokal lagring...");
    const OBSOLETE_KEYS = ["sc-format", "sc-font-size", "sc-use-utc", "sc-hide"];
    OBSOLETE_KEYS.forEach(key => localStorage.removeItem(key));
    localStorage.setItem("sc-version", CURRENT_VERSION);
}

let SIMPLE_CLOCK_FONT_SIZE_SCALE = parseInt(localStorage.getItem("sc-font-size"));

if (isNaN(SIMPLE_CLOCK_FONT_SIZE_SCALE) || SIMPLE_CLOCK_FONT_SIZE_SCALE < 0 || SIMPLE_CLOCK_FONT_SIZE_SCALE > 7) {
    SIMPLE_CLOCK_FONT_SIZE_SCALE = DEFAULT_CLOCK_SIZE_SCALE;
    localStorage.setItem("sc-font-size", DEFAULT_CLOCK_SIZE_SCALE);
}

if (!ALLOW_USER_CLOCK_SIZE_CHANGE) {
    SIMPLE_CLOCK_FONT_SIZE_SCALE = DEFAULT_CLOCK_SIZE_SCALE;
    localStorage.setItem("sc-font-size", DEFAULT_CLOCK_SIZE_SCALE);
}

let WIDGET_WIDTH_SCALE = SIMPLE_CLOCK_FONT_SIZE_SCALE;
if (isNaN(WIDGET_WIDTH_SCALE) || WIDGET_WIDTH_SCALE < 0 || WIDGET_WIDTH_SCALE > 7) {
    WIDGET_WIDTH_SCALE = SIMPLE_CLOCK_FONT_SIZE_SCALE;
    localStorage.setItem("sc-widget-width", WIDGET_WIDTH_SCALE);
}

let SIMPLE_CLOCK_USE_UTC = DISPLAY_MODE === "utc" ? true : DISPLAY_MODE === "local" ? false : (localStorage.getItem("sc-use-utc") === "true");
let serverTimeZone_show = LOCAL_TIMEZONE || "Etc/GMT+0";
let serverTime = new Date();
let lastSync = Date.now();
let TIME_SERVER_FAILED = false;
let TIME_SERVER;

if (API_SERVER_ADDRESS.trim() === "") {
    TIME_SERVER = `${window.location.origin}/api`;
} else {
    let protocol = window.location.protocol === 'https:' ? 'https' : 'http';
    TIME_SERVER = `${protocol}://${API_SERVER_ADDRESS}`;
}
console.log("Using time server:", TIME_SERVER);

const FONT_STYLES = ["standard", "font1", "font2", "font3", "font4"];

const COLOR_MODES = Object.values(COLOR_PRESETS);

let currentFontIndex = parseInt(localStorage.getItem("sc-font-index"));
if (isNaN(currentFontIndex) || !ALLOW_USER_CLOCK_FONT_CHANGE) {
    currentFontIndex = DEFAULT_FONT_INDEX;
    localStorage.setItem("sc-font-index", currentFontIndex);
}


let savedColorIndex = parseInt(localStorage.getItem("sc-color-index"));
let defaultIndex = Object.keys(COLOR_PRESETS).indexOf(DEFAULT_COLOR_NAME);
if (isNaN(savedColorIndex) || !ALLOW_USER_CLOCK_COLOR_CHANGE) {
    savedColorIndex = defaultIndex;
    localStorage.setItem("sc-color-index", savedColorIndex);
}
let currentColorIndex = savedColorIndex;

const TIME_FORMATS = {
    "24h dd.MM.yyyy": { time: "HH:mm:ss", date: "dd.MM.yyyy" }, 
    "24h dd MMM yyyy": { time: "HH:mm:ss", date: "dd MMM yyyy" }, 
    "12h dd.MM.yyyy": { time: "hh:mm a", date: "dd.MM.yyyy" },  
    "24h MM.dd.yyyy": { time: "HH:mm:ss", date: "MM.dd.yyyy" }, 
    "24h MMM dd yyyy": { time: "HH:mm:ss", date: "MMM dd yyyy" }, 
    "12h MM.dd.yyyy": { time: "hh:mm a", date: "MM.dd.yyyy" }, 
    "24h yyyy.MM.dd": { time: "HH:mm:ss", date: "yyyy.MM.dd" }, 
    "24h yyyy MMM dd": { time: "HH:mm:ss", date: "yyyy MMM dd" }, 
    "12h yyyy.MM.dd": { time: "hh:mm a", date: "yyyy.MM.dd" },
	"24h Time Only": { time: "HH:mm:ss"}
};

let SERVER_SYNC = 'unknown'; 

async function fetchServerTime() {
    try {
        let data = await $.getJSON(TIME_SERVER, { _: new Date().getTime() });
        if (data && data[TIME_SERVER_RESPONSE] && !isNaN(new Date(data[TIME_SERVER_RESPONSE]).getTime())) {
            serverTime = new Date(data[TIME_SERVER_RESPONSE]);
            lastSync = Date.now();
            SERVER_SYNC = 'server';
            console.log("✅ Synced with server time:", serverTime.toISOString());
        } else {
            throw new Error("Invalid response format");
        }
    } catch (error) {
        console.warn("⚠️ Server time fetch failed, using client time:", error);
        serverTime = new Date();
        lastSync = Date.now();
        SERVER_SYNC = 'client';
        updateClock();
    }
}

const PLUGIN_INFO = {
    version: CURRENT_VERSION,
};

function applyClockStyles() {
    const widget = $('#sc-custom-clock-widget');

    let fontClass = FONT_STYLES[currentFontIndex];
    widget.removeClass(FONT_STYLES.join(" "));
    if (fontClass !== "standard") widget.addClass(fontClass);

    let colorMode = COLOR_MODES[currentColorIndex];
    let finalColor = colorMode === "auto" ? "" : colorMode;

    ['.sc-clock-time', '.sc-clock-date', '.sc-clock-mode', '.sc-clock-am-pm', '.sc-synk-status'].forEach(selector => {
        widget.find(selector).css("color", finalColor);
    });
}

function showZoomText(text) {
    const clock = $('#sc-custom-clock-widget');
    if (!clock.length) return;

    const offset = clock.offset();
    const width = clock.outerWidth();

    const msg = $('<div>')
        .text(text)
        .css({
            position: 'absolute',
            top: (offset.top - 26) + 'px',
            left: offset.left + width / 2 + 'px',
            transform: 'translateX(-50%)',
            backgroundColor: 'var(--color-2)',
            border: '2px solid var(--color-3)',
            color: 'white',
            padding: '4px 10px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 9999,
            opacity: 0,
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
        })
        .appendTo('body')
        .animate({ opacity: 1 }, 150)
        .delay(800)
        .fadeOut(300, function () { $(this).remove(); });
}

function toggleFontStyle() {
    currentFontIndex = (currentFontIndex + 1) % FONT_STYLES.length;
    localStorage.setItem("sc-font-index", currentFontIndex);
    applyClockStyles();

    const fontName = FONT_STYLES[currentFontIndex].replace("font", "Font ") || "Standard";
    const displayName = fontName === "standard" ? "Standard Font" : `Font: ${fontName}`;
    showZoomText(displayName);
}

function toggleColorMode() {
    currentColorIndex = (currentColorIndex + 1) % COLOR_MODES.length;
    localStorage.setItem("sc-color-index", currentColorIndex);
    applyClockStyles();

    const currentColor = COLOR_MODES[currentColorIndex];
    const displayName = Object.keys(COLOR_PRESETS).find(key => COLOR_PRESETS[key] === currentColor) || currentColor;
    showZoomText(`Color: ${displayName}`);
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

function AdditionalDropdownClockFormat() {
    if (!localStorage.getItem("sc-format")) {
        localStorage.setItem("sc-format", DEFAULT_TIME_FORMAT);
    }
    $("#sc-clock-format-container").remove();
    const panelFull = $('.panel-full.flex-center.no-bg.m-0').first();

    if (HIDE_TIME_FORMAT_DROPDOWN) return;

    if (panelFull.length) {
        panelFull.after(`
            <div id="sc-clock-format-container" class="form-group">
                <label for="clock-format" class="form-label">
                    <i class="fa-solid m-right-10"></i>Simple Clock Format
                </label>
                <div class="dropdown">
                    <input type="text" id="sc-clock-format-input" class="form-control" placeholder="Select format" readonly />
                    <div id="sc-clock-format-options" class="options">
                        ${Object.keys(TIME_FORMATS).map(format => `<div class="option" data-value="${format}">${format}</div>`).join('')}
                    </div>
                </div>
            </div>
        `);

        const style = document.createElement('style');
        style.innerHTML = `
            #sc-clock-format-container label {
                display: block;
                text-align: center;
                width: 100%;
            }
        `;
        document.head.appendChild(style);
    }

    let savedFormat = localStorage.getItem("sc-format");

    $("#sc-clock-format-input").val(savedFormat);

    $("#sc-clock-format-input").click(function() {
        $("#sc-clock-format-options").toggleClass("opened");
    });

    $("#sc-clock-format-options .option").click(function() {
        let selectedFormat = $(this).data("value");

        localStorage.setItem("sc-format", selectedFormat);
        $("#sc-clock-format-input").val(selectedFormat);
        updateClock();

        $("#sc-clock-format-options").removeClass("opened");
    });
}

function addHideClockCheckbox() {
    const imperialUnitsCheckbox = document.getElementById("imperial-units");

    if (!imperialUnitsCheckbox) {
        console.warn("Imperial units checkbox not found – kan ikke legge til 'Hide Clock'.");
        return;
    }

    const id = "hide-clock";
    const label = "Hide Simple Clock";

    const wrapper = document.createElement("div");
    wrapper.className = "form-group";
    wrapper.innerHTML = `
        <div class="switch flex-container flex-phone flex-phone-column flex-phone-center">
            <input type="checkbox" tabindex="0" id="${id}" aria-label="${label}" />
            <label for="${id}"></label>
            <span class="text-smaller text-uppercase text-bold color-4 p-10">${label.toUpperCase()}</span>
        </div>
    `;

    imperialUnitsCheckbox.closest('.form-group').insertAdjacentElement("afterend", wrapper);

    const saved = localStorage.getItem("sc-hide") === "true";
    document.getElementById(id).checked = saved;

    document.getElementById(id).addEventListener("change", function () {
        localStorage.setItem("sc-hide", this.checked);
        toggleClockVisibility();
    });

    toggleClockVisibility();
}

function toggleClockVisibility() {
    let isHidden = localStorage.getItem("sc-hide") === "true";
    let isMobile = $(window).width() <= 768;
    let shouldHideClock = isHidden || (HIDE_CLOCK_ON_MOBILE && isMobile);
    $("#sc-custom-clock-widget").toggle(!shouldHideClock);
    if (HIDE_CLOCK_ON_MOBILE && isMobile) {
        $("#sc-clock-format-container").hide();
        $(".form-group.checkbox:has(#sc-hide-clock)").hide();
    } else {
        $("#sc-clock-format-container").toggle(!isHidden);
        $(".form-group.checkbox:has(#sc-hide-clock)").show();
    }
}

function updateFontSize() {
    let timeFontSize = Math.max(14, 16 + SIMPLE_CLOCK_FONT_SIZE_SCALE * 2);
    let dateFontSize = Math.max(10, 8 + SIMPLE_CLOCK_FONT_SIZE_SCALE * 1.5);
    let baseWidth = SHOW_SECONDS ? 70 : 60;
    let widthPerZoom = SHOW_SECONDS ? 8 : 6;
    let widgetWidth = baseWidth + SIMPLE_CLOCK_FONT_SIZE_SCALE * widthPerZoom;

    $('#sc-custom-clock-widget .sc-clock-time').css("font-size", timeFontSize + "px");
    $('#sc-custom-clock-widget .sc-clock-date').css("font-size", dateFontSize + "px");
    $('#sc-custom-clock-widget').css("width", widgetWidth + "px");

    let isMobile = window.innerWidth <= 768;
    let mobileAdjustment = isMobile ? -2 : 0;

    let baseTopOffset = (SIMPLE_CLOCK_FONT_SIZE_SCALE * 1.2) - 2;
    let topOffset = Math.max(-baseTopOffset, -14) + mobileAdjustment;

    ['.sc-clock-mode', '.sc-clock-am-pm', '.sc-synk-status'].forEach(selector => {
        let el = $('#sc-custom-clock-widget ' + selector)[0];
        if (el) {
            el.style.setProperty('top', topOffset + 'px', 'important');
        }
    });
}

function updateClock() {
    let now = new Date(serverTime.getTime() + (Date.now() - lastSync));
    let selectedFormat = localStorage.getItem("sc-format") || Object.keys(TIME_FORMATS)[0];
    let format = TIME_FORMATS[selectedFormat];
    let clockWidget = $('#sc-custom-clock-widget');
    let is12HourFormat = format.time.includes('a');
    let fullTime = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: SHOW_SECONDS ? '2-digit' : undefined,
        hour12: true,
        timeZone: SIMPLE_CLOCK_USE_UTC ? "UTC" : LOCAL_TIMEZONE
    }).format(now);
    let [time, amPmText] = fullTime.split(' ');
    if (!is12HourFormat) {
        time = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: SHOW_SECONDS ? '2-digit' : undefined,
            hour12: false,
            timeZone: SIMPLE_CLOCK_USE_UTC ? "UTC" : LOCAL_TIMEZONE
        }).format(now);
        amPmText = "";
    }
    let amPmElement = clockWidget.find('.sc-clock-am-pm');
    if (is12HourFormat) {
        amPmElement.text(amPmText).show();
    } else {
        amPmElement.hide();
    }

    let dateString = '';
    if (format.date) {
        let dateFormatter = new Intl.DateTimeFormat('en-US', {
            day: '2-digit',
            month: format.date.includes('MMM') ? 'short' : '2-digit',
            year: 'numeric',
            timeZone: SIMPLE_CLOCK_USE_UTC ? "UTC" : LOCAL_TIMEZONE
        });
        let dateParts = dateFormatter.formatToParts(now);
        let day = dateParts.find(part => part.type === 'day').value;
        let month = dateParts.find(part => part.type === 'month').value;
        let year = dateParts.find(part => part.type === 'year').value;

        if (selectedFormat.includes("dd.MM.yyyy")) {
            dateString = `${day}.${month}.${year}`;
        } else if (selectedFormat.includes("dd MMM yyyy")) {
            dateString = `${day} ${month} ${year}`;
        } else if (selectedFormat.includes("MM.dd.yyyy")) {
            dateString = `${month}.${day}.${year}`;
        } else if (selectedFormat.includes("MMM dd yyyy")) {
            dateString = `${month} ${day} ${year}`;
        } else if (selectedFormat.includes("yyyy.MM.dd")) {
            dateString = `${year}.${month}.${day}`;
        } else if (selectedFormat.includes("yyyy MMM dd")) {
            dateString = `${year} ${month} ${day}`;
        }
    }

    let timeMode = SIMPLE_CLOCK_USE_UTC ? "UTC" : "";
    let SyncStatusValue = (SERVER_SYNC === 'client') ? '⚠️' : '';

    let syncStatusElement = clockWidget.find('.sc-synk-status');
    syncStatusElement.html(SyncStatusValue).show();
	
if (!clockWidget.length) {
    let panelContainer = $(".dashboard-panel .panel-100-real .dashboard-panel-plugin-content");

let widgetHtml = `
    <div id='sc-custom-clock-widget' class='flex-container flex-center hide-phone hover-brighten br-15'
        style='position: relative; height: 50px; width: 125px; padding: 0px; text-align: center; display: flex; flex-direction: column; gap: 2px !important; user-select: none;'
        data-tooltip-disabled='true'>

        <!-- Mode -->
        ${HIDE_TIME_MODE ? '' : `<span class='color-4 m-0 sc-clock-mode'
            style='position: absolute; top: -10px; left: 78%; transform: translateX(-50%); font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 5px;'>
            ${timeMode}
        </span>`}

        <span class='color-4 m-0 sc-synk-status'
            style='position: absolute; top: 4px; left: 96%; transform: translateX(-50%); font-size: 6px; font-weight: bold; padding: 2px 6px; border-radius: 5px;'>
            ${SyncStatusValue}
        </span>
        <span class='color-4 m-0 sc-clock-am-pm'
            style='position: absolute; top: -5px; left: 14%; transform: translateX(-50%); font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 5px; display: none;'>
        </span>
        
        <!-- Clock content -->
        <span class='color-4 m-0 sc-clock-time' style='font-size: 22px; font-weight: bold; line-height: 1;'>${time}</span>
        <span class='color-4 m-0 sc-clock-date' style='font-size: 12px; line-height: 0.7;'>${dateString}</span>

${(ALLOW_USER_CLOCK_FONT_CHANGE || ALLOW_USER_CLOCK_COLOR_CHANGE) ? `
    <div class='sc-clock-controls'
        style='display: none; position: absolute; bottom: -13px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: row; align-items: center; gap: 8px; z-index: 20;'>
        ${ALLOW_USER_CLOCK_FONT_CHANGE ? `<span class='sc-font-toggle' style='cursor: pointer;'>🅰️</span>` : ''}
        ${ALLOW_USER_CLOCK_COLOR_CHANGE ? `<span class='sc-color-toggle' style='cursor: pointer;'>🎨</span>` : ''}
    </div>
` : ''}
    </div>`;

if (PLUGIN_POSITION === "before") {
    panelContainer.before(widgetHtml);
} else {
    panelContainer.after(widgetHtml);
}

$('.sc-clock-controls').hide();
} else {
    if (dateString) {
        clockWidget.find('.sc-clock-date').text(dateString);
    } else {
        clockWidget.find('.sc-clock-date').text("");
    }
    clockWidget.find('.sc-clock-time').text(time);
    clockWidget.find('.sc-clock-mode').text(timeMode);
    let tooltipText = DynTekst_show;
    if (TOOLTIP_MODE === "normal") {
        tooltipText += "\n" + DynTekst_show2;
    }

    clockWidget.attr('data-tooltip-content', tooltipText);
}



    $('#sc-custom-clock-widget').css("width", (SIMPLE_CLOCK_FONT_SIZE_SCALE * 10 + 10) + "px");
    if (HIDE_CLOCK_ON_MOBILE && $(window).width() <= 768) {
        clockWidget.hide();
    } else {
        clockWidget.show();
    }

    $("<style>")
        .prop("type", "text/css")
        .html(`
            @media (max-width: 768px) {
                #sc-custom-clock-widget {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    gap: 0px !important;
                    flex-direction: column;
                }
                    .sc-clock-time, .sc-clock-date {
                    line-height: 0.7 !important;
                    margin: 2px 0 !important;
                    padding: 0 !important;
                }
            }
        `)
        .appendTo("head");
    if (HIDE_CLOCK_ON_MOBILE) {
        $("<style>")
        .prop("type", "text/css")
        .html(`
            @media (max-width: 768px) {
                #sc-custom-clock-widget {
                    display: none !important;
                }
            }
        `)
        .appendTo("head");
    }
    toggleClockVisibility();
    updateFontSize();
}

let updateDynTextTimeout;
let DynTekst_show = "";
let updateDynText2Timeout;
let DynTekst_show2 = ""; 

function updateDynText2() {

    let syncStatusText = SERVER_SYNC === 'server' ? "Synchronizes time from server." :
                         SERVER_SYNC === 'client' ? "⚠️Problems synch. time from server!\nUses time from user's device instead" :
                         "Time synchronization status unknown."; 

    let texts = [
        "TimeZone: " + serverTimeZone_show,
        syncStatusText,
        "Simple Clock v" + PLUGIN_INFO.version,
    ];
	if (DISPLAY_MODE === "auto") {
		let isMobile = window.innerWidth <= 768;
		if (isMobile) {
			texts.push("Tap to toggle UTC and Server time");
		} else {
			texts.push("Click to switch UTC and Server time");
		}
	}
	if (ALLOW_USER_CLOCK_SIZE_CHANGE === true) {
		let isMobile = window.innerWidth <= 768;
		if (isMobile) {
			texts.push("Swipe left or right to resize");
		} else {
			texts.push("Use the mouse wheel to change size.");
		}
	}

    let index = 0;
    function cycleExtraMessages() {
        DynTekst_show2 = texts[index];
        index = (index + 1) % texts.length;

        updateDynText2Timeout = setTimeout(cycleExtraMessages, 5000);
        updateTooltip();
    }

    clearTimeout(updateDynText2Timeout);
    cycleExtraMessages();
}

fetchServerTime().then(() => {
    updateDynText2();
});

function updateTooltip() {
    let tooltipText = DynTekst_show;
    if (TOOLTIP_MODE === "normal") {
        tooltipText += "\n" + DynTekst_show2;
    }

    $('#sc-custom-clock-widget').attr('data-tooltip-content', tooltipText);

    const tooltip = $('#sc-clock-tooltip');
    if (tooltip.is(':visible')) {
        tooltip.text(tooltipText);
    }
}

function updateDynText() {
    clearTimeout(updateDynTextTimeout);
    function getCurrentMode() {
        return SIMPLE_CLOCK_USE_UTC ? "UTC" : "Server";
    }

    function cycleMessages() {
        let currentMode = getCurrentMode();
        let displayModeMessage = "";
        if (DISPLAY_MODE === "utc") {
            displayModeMessage = "Displays UTC Time (Locked)";
        } else if (DISPLAY_MODE === "local") {
            displayModeMessage = "Displays Server Time (Locked)";
        } else {
            displayModeMessage = `Displays ${currentMode} Time.`;
        }

        DynTekst_show = displayModeMessage;
        updateTooltip();
        updateDynTextTimeout = setTimeout(cycleMessages, 5000);
    }
    cycleMessages();
}

function toggleTimeFormat() {
    if (DISPLAY_MODE !== "auto") return;
    SIMPLE_CLOCK_USE_UTC = !SIMPLE_CLOCK_USE_UTC;
    localStorage.setItem("sc-use-utc", SIMPLE_CLOCK_USE_UTC.toString());
    console.log(`Toggled time format: Now using ${SIMPLE_CLOCK_USE_UTC ? "UTC" : "Local"} time`);
    updateClock();
	updateDynText();
}

$(document).ready(() => {
    console.log(`DOM loaded, starting clock (${SIMPLE_CLOCK_USE_UTC ? 'UTC' : 'Local time'})...`);

    $("<style>")
        .prop("type", "text/css")
        .html(`
            @font-face {
                font-family: 'SCFont1';
                src: url('/SC-FONTS/font1.ttf') format('truetype');
            }
            @font-face {
                font-family: 'SCFont2';
                src: url('/SC-FONTS/font2.ttf') format('truetype');
            }
            @font-face {
                font-family: 'SCFont3';
                src: url('/SC-FONTS/font3.ttf') format('truetype');
            }
			@font-face {
                font-family: 'SCFont4';
                src: url('/SC-FONTS/font4.ttf') format('truetype');
            }

            .font1 { font-family: 'SCFont1'; }
            .font2 { font-family: 'SCFont2', serif; }
            .font3 { font-family: 'SCFont3', cursive; }
			.font4 { font-family: 'SCFont4'; }
        `)
        .appendTo("head");
		
	if (ALLOW_USER_CLOCK_FONT_CHANGE) {
    $(document).on("click", ".sc-font-toggle", toggleFontStyle);
}
if (ALLOW_USER_CLOCK_COLOR_CHANGE) {
    $(document).on("click", ".sc-color-toggle", toggleColorMode);
}
	
    serverTime = new Date();
    lastSync = Date.now();
    fetchServerTime();
    updateClock();
    updateDynText();
    updateDynText2();
    setInterval(updateClock, 1000);
    setInterval(fetchServerTime, 5 * 60 * 1000);
    $(document).on('click', '#sc-custom-clock-widget', function (e) {
    if ($(e.target).closest('.sc-font-toggle, .sc-color-toggle').length === 0) {
        toggleTimeFormat();
    }
});

    AdditionalDropdownClockFormat();
    setTimeout(addHideClockCheckbox, 200);
    toggleClockVisibility();

    $('body').append(`
        <div id="sc-clock-tooltip" style="
            position: fixed;
            z-index: 15;
            text-align: center;
            background-color: var(--color-2);
            border: 2px solid var(--color-3);
            color: var(--color-text);
            font-size: 14px;
            border-radius: 15px;
            padding: 10px 20px;
            min-width: 270px;
            max-width: 500px;
            white-space: pre-line;
            pointer-events: none;
            display: none;
        "></div>
    `);
	
	$(document).on("mouseenter", "#sc-custom-clock-widget", function () {
		$('.sc-clock-controls').fadeIn(150);
	});
	$(document).on("mouseleave", "#sc-custom-clock-widget", function () {
		$('.sc-clock-controls').fadeOut(150);
	});


    $(document).on("mouseenter", "#sc-custom-clock-widget", function () {
        const tooltipText = $('#sc-custom-clock-widget').attr('data-tooltip-content');
        const widgetOffset = $('#sc-custom-clock-widget').offset();
        const widgetHeight = $('#sc-custom-clock-widget').outerHeight();

        $('#sc-clock-tooltip').text(tooltipText).css({
            display: 'block',
            left: widgetOffset.left + ($('#sc-custom-clock-widget').outerWidth() / 2) + "px",
            top: widgetOffset.top + widgetHeight + 10 + "px",
            transform: "translateX(-50%)"
        });
    });

    $(document).on("mouseleave", "#sc-custom-clock-widget", function () {
        $('#sc-clock-tooltip').hide();
    });

if (ALLOW_USER_CLOCK_SIZE_CHANGE) {
    $('#sc-custom-clock-widget').on('wheel', function(event) {
        event.preventDefault();

        if (event.originalEvent.deltaY > 0) {
            if (SIMPLE_CLOCK_FONT_SIZE_SCALE > 0) {
                SIMPLE_CLOCK_FONT_SIZE_SCALE--;
                localStorage.setItem("sc-font-size", SIMPLE_CLOCK_FONT_SIZE_SCALE);
                updateFontSize();
                navigator.vibrate?.(30);
            } else {
                showZoomText("Minimum zoom level reached");
                navigator.vibrate?.(60);
            }
        } else {
            if (SIMPLE_CLOCK_FONT_SIZE_SCALE < MAX_CLOCK_ZOOM_LEVEL) {
                SIMPLE_CLOCK_FONT_SIZE_SCALE++;
                localStorage.setItem("sc-font-size", SIMPLE_CLOCK_FONT_SIZE_SCALE);
                updateFontSize();
                navigator.vibrate?.(30);
            } else {
                showZoomText("Maximum zoom level reached");
                navigator.vibrate?.(60);
            }
        }
    });

    let touchStartX = null;

    $('#sc-custom-clock-widget').on('touchstart', function(e) {
        touchStartX = e.originalEvent.touches[0].clientX;
    });

    $('#sc-custom-clock-widget').on('touchmove', function(e) {
        if (touchStartX === null) return;

        let touchEndX = e.originalEvent.touches[0].clientX;
        let deltaX = touchEndX - touchStartX;

        if (Math.abs(deltaX) > 20) {
            if (deltaX > 0) {
                if (SIMPLE_CLOCK_FONT_SIZE_SCALE < MAX_CLOCK_ZOOM_LEVEL) {
                    SIMPLE_CLOCK_FONT_SIZE_SCALE++;
                    navigator.vibrate?.(30);
                } else {
                    showZoomText("Maximum zoom level reached");
                    navigator.vibrate?.(60);
                }
            } else {
                if (SIMPLE_CLOCK_FONT_SIZE_SCALE > 0) {
                    SIMPLE_CLOCK_FONT_SIZE_SCALE--;
                    navigator.vibrate?.(30);
                } else {
                    showZoomText("Minimum zoom level reached");
                    navigator.vibrate?.(60);
                }
            }

            localStorage.setItem("sc-font-size", SIMPLE_CLOCK_FONT_SIZE_SCALE);
            updateFontSize();
            touchStartX = null;
        }
    });

    $('#sc-custom-clock-widget').on('touchend', function() {
        touchStartX = null;
    });
}

applyClockStyles();
updateClock();
});


})();
