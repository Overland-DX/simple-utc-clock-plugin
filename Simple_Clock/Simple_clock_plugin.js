(() => { /*

Simple Clock v1.05.4
For FM-DX-Webserver v1.3.5 or later.
This is open source code. Feel free to do whatever you want with it.


Step 1:
If you only want UTC time to be displayed, you don't need to change anything in the setting.

Step 2:
If you want to display only local server time, use "local" in DISPLAY_MODE. If you want to display both UTC time and Server time, use "auto" in DISPLAY_MODE.
For local server time to be displayed correctly, you must also select your time zone in LOCAL_TIMEZONE.
And if your area uses daylight saving time, you must set USE_DST to "true"
*/
let DISPLAY_MODE = "auto";  // "auto" = Users can switch, "local" = Only local Server time, "utc" = Only UTC time. Default is "utc"
let LOCAL_TIMEZONE = "Etc/GMT-1";  // Set the desired timezone. For example: "Europe/London" for UK, or "Etc/GMT-1" for zone UTC+01:00.
let USE_DST = true;  // Important if you use GMT as a zone that uses daylight saving time. Valid usage: true or false
/*
Note!
If you are unsure which time zone to use, you can find some tips/info here: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones



Step 3: Customize the Simple Clock (Optional)
*/
const DEFAULT_CLOCK_SIZE_SCALE = 3;  // Set the default value for the clock size. Between 1 and 5 are allowed.
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

/*
Step 4: What can the user do? (Optional)
*/
const ALLOW_USER_CLOCK_SIZE_CHANGE = true; // Set to true if users should be able to change clock size. Default is false.
const HIDE_TIME_FORMAT_DROPDOWN = false; // Set to false to show the clock format dropdown in sidesettings. Default is true.








// Below is the main code. Please do not change anything unless you know what you are doing.
const CURRENT_VERSION = "1.05.4";

if (ALLOW_USER_CLOCK_SIZE_CHANGE) {
    let SIMPLE_CLOCK_FONT_SIZE_SCALE = parseInt(localStorage.getItem("SIMPLE_CLOCK_FONT_SIZE_SCALE"));
    if (isNaN(SIMPLE_CLOCK_FONT_SIZE_SCALE) || SIMPLE_CLOCK_FONT_SIZE_SCALE < 1 || SIMPLE_CLOCK_FONT_SIZE_SCALE > 5) {
        SIMPLE_CLOCK_FONT_SIZE_SCALE = DEFAULT_CLOCK_SIZE_SCALE;
        localStorage.setItem("SIMPLE_CLOCK_FONT_SIZE_SCALE", DEFAULT_CLOCK_SIZE_SCALE);
    }
}

if (!localStorage.getItem("SIMPLE_CLOCK_PLUGIN_VERSION") || 
    localStorage.getItem("SIMPLE_CLOCK_PLUGIN_VERSION") !== CURRENT_VERSION) {   
    console.log("Ingen eller gammel versjon oppdaget – rydder opp lokal lagring...");
    const OBSOLETE_KEYS = ["SIMPLE_CLOCK_CLOCK_FORMAT", "SIMPLE_CLOCK_FONT_SIZE_SCALE", "SIMPLE_CLOCK_USE_UTC", "SIMPLE_CLOCK_HIDE_CLOCK"];
    OBSOLETE_KEYS.forEach(key => localStorage.removeItem(key));
    localStorage.setItem("SIMPLE_CLOCK_PLUGIN_VERSION", CURRENT_VERSION);
}

let SIMPLE_CLOCK_FONT_SIZE_SCALE = parseInt(localStorage.getItem("SIMPLE_CLOCK_FONT_SIZE_SCALE"));

if (isNaN(SIMPLE_CLOCK_FONT_SIZE_SCALE) || SIMPLE_CLOCK_FONT_SIZE_SCALE < 1 || SIMPLE_CLOCK_FONT_SIZE_SCALE > 5) {
    SIMPLE_CLOCK_FONT_SIZE_SCALE = DEFAULT_CLOCK_SIZE_SCALE;
    localStorage.setItem("SIMPLE_CLOCK_FONT_SIZE_SCALE", DEFAULT_CLOCK_SIZE_SCALE);
}

if (!ALLOW_USER_CLOCK_SIZE_CHANGE) {
    SIMPLE_CLOCK_FONT_SIZE_SCALE = DEFAULT_CLOCK_SIZE_SCALE;
    localStorage.setItem("SIMPLE_CLOCK_FONT_SIZE_SCALE", DEFAULT_CLOCK_SIZE_SCALE);
}

let WIDGET_WIDTH_SCALE = SIMPLE_CLOCK_FONT_SIZE_SCALE;
if (isNaN(WIDGET_WIDTH_SCALE) || WIDGET_WIDTH_SCALE < 1 || WIDGET_WIDTH_SCALE > 5) {
    WIDGET_WIDTH_SCALE = SIMPLE_CLOCK_FONT_SIZE_SCALE;
    localStorage.setItem("WIDGET_WIDTH_SCALE", WIDGET_WIDTH_SCALE);
}

let SIMPLE_CLOCK_USE_UTC = DISPLAY_MODE === "utc" ? true : DISPLAY_MODE === "local" ? false : (localStorage.getItem("SIMPLE_CLOCK_USE_UTC") === "true");
let serverTimeZone_show = LOCAL_TIMEZONE || "Etc/GMT+0";
let serverTime = new Date();
let lastSync = Date.now();
let TIME_SERVER_FAILED = false;
let timeProtocol = window.location.protocol === 'https:' ? 'https' : 'http';
let TIME_SERVER = `${timeProtocol}://${API_SERVER_ADDRESS}`;


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






function AdditionalDropdownClockFormat() {
    if (!localStorage.getItem("SIMPLE_CLOCK_CLOCK_FORMAT")) {
        localStorage.setItem("SIMPLE_CLOCK_CLOCK_FORMAT", DEFAULT_TIME_FORMAT);
    }
    $("#clock-format-container").remove();
    const panelFull = $('.panel-full.flex-center.no-bg.m-0').first();

    if (HIDE_TIME_FORMAT_DROPDOWN) return;

    if (panelFull.length) {
        panelFull.after(`
            <div id="clock-format-container" class="form-group">
                <label for="clock-format" class="form-label">
                    <i class="fa-solid m-right-10"></i>Simple Clock Format
                </label>
                <div class="dropdown">
                    <input type="text" id="clock-format-input" class="form-control" placeholder="Select format" readonly />
                    <div id="clock-format-options" class="options">
                        ${Object.keys(TIME_FORMATS).map(format => `<div class="option" data-value="${format}">${format}</div>`).join('')}
                    </div>
                </div>
            </div>
        `);

        // Legg til CSS inline via JavaScript
        const style = document.createElement('style');
        style.innerHTML = `
            #clock-format-container label {
                display: block;
                text-align: center;
                width: 100%;
            }
        `;
        document.head.appendChild(style);
    }

    let savedFormat = localStorage.getItem("SIMPLE_CLOCK_CLOCK_FORMAT");

    $("#clock-format-input").val(savedFormat);

    $("#clock-format-input").click(function() {
        $("#clock-format-options").toggleClass("opened");
    });

    $("#clock-format-options .option").click(function() {
        let selectedFormat = $(this).data("value");

        localStorage.setItem("SIMPLE_CLOCK_CLOCK_FORMAT", selectedFormat);
        $("#clock-format-input").val(selectedFormat);
        updateClock();

        $("#clock-format-options").removeClass("opened");
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

    // Sett knappen rett etter "Imperial units"
    imperialUnitsCheckbox.closest('.form-group').insertAdjacentElement("afterend", wrapper);

    const saved = localStorage.getItem("SIMPLE_CLOCK_HIDE_CLOCK") === "true";
    document.getElementById(id).checked = saved;

    document.getElementById(id).addEventListener("change", function () {
        localStorage.setItem("SIMPLE_CLOCK_HIDE_CLOCK", this.checked);
        toggleClockVisibility();
    });

    toggleClockVisibility();
}

function toggleClockVisibility() {
    let isHidden = localStorage.getItem("SIMPLE_CLOCK_HIDE_CLOCK") === "true";
    let isMobile = $(window).width() <= 768;
    let shouldHideClock = isHidden || (HIDE_CLOCK_ON_MOBILE && isMobile);
    $("#custom-clock-widget").toggle(!shouldHideClock);
    if (HIDE_CLOCK_ON_MOBILE && isMobile) {
        $("#clock-format-container").hide();
        $(".form-group.checkbox:has(#hide-clock)").hide();
    } else {
        $("#clock-format-container").toggle(!isHidden);
        $(".form-group.checkbox:has(#hide-clock)").show();
    }
}

function updateFontSize() {
    let fontSizeFactor = SIMPLE_CLOCK_FONT_SIZE_SCALE * 2 + 16;
    let fontSizeFactorDate = SIMPLE_CLOCK_FONT_SIZE_SCALE + 10; 
    let widgetWidth = SIMPLE_CLOCK_FONT_SIZE_SCALE * 6 + 90;
    let timeFontSize = Math.min(Math.max(fontSizeFactor, 18), 30);
    let dateFontSize = Math.min(Math.max(fontSizeFactorDate, 8), 14);
    let topOffset = Math.min(Math.max((SIMPLE_CLOCK_FONT_SIZE_SCALE * -1) - 1, -10), 2);
    $('#custom-clock-widget .clock-time').css("font-size", timeFontSize + "px");
    $('#custom-clock-widget .clock-date').css("font-size", dateFontSize + "px");
    $('#custom-clock-widget').css("width", widgetWidth + "px");
    $('#custom-clock-widget .clock-mode, #custom-clock-widget .clock-am-pm').css("top", topOffset + "px");
}

function updateClock() {
    let now = new Date(serverTime.getTime() + (Date.now() - lastSync));
    let selectedFormat = localStorage.getItem("SIMPLE_CLOCK_CLOCK_FORMAT") || Object.keys(TIME_FORMATS)[0];
    let format = TIME_FORMATS[selectedFormat];
    let clockWidget = $('#custom-clock-widget');
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
    let amPmElement = clockWidget.find('.clock-am-pm');
    if (is12HourFormat) {
        amPmElement.text(amPmText).show();
    } else {
        amPmElement.hide();
    }

    // Sjekk om formatet inneholder dato før vi prøver å formattere den
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

    let syncStatusElement = clockWidget.find('.synk-status');
    syncStatusElement.html(SyncStatusValue).show();

    if (!clockWidget.length) {
        let panelContainer = $(".dashboard-panel .panel-100-real .dashboard-panel-plugin-content");
        let widgetHtml = `
            <div id='custom-clock-widget' class='flex-container flex-center hide-phone hover-brighten br-15'
                style='position: relative; height: 50px; width: 125px; padding: 0px; text-align: center; display: flex; flex-direction: column; gap: 0px !important; user-select: none;'
                data-tooltip-disabled='true'>
                <!-- Only show timeMode if HIDE_TIME_MODE is false -->
                ${HIDE_TIME_MODE ? '' : `<span class='color-4 m-0 clock-mode'
                    style='position: absolute; top: -10px; left: 78%; transform: translateX(-50%); font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 5px;'>
                    ${timeMode}
                </span>`}
                <span class='color-4 m-0 synk-status'
                    style='position: absolute; top: 4px; left: 96%; transform: translateX(-50%); font-size: 6px; font-weight: bold; padding: 2px 6px; border-radius: 5px;'>
                    ${SyncStatusValue}
                </span>
                <span class='color-4 m-0 clock-am-pm'
                    style='position: absolute; top: -5px; left: 14%; transform: translateX(-50%); font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 5px; display: none;'>
                </span>
                <span class='color-4 m-0 clock-time' style='font-size: 22px; font-weight: bold; line-height: 1;'>${time}</span>
                <span class='color-4 m-0 clock-date' style='font-size: 12px; line-height: 0.7;'>${dateString}</span>
            </div>`;

        if (PLUGIN_POSITION === "before") {
            panelContainer.before(widgetHtml);
        } else {
            panelContainer.after(widgetHtml);
        }
    } else {
        if (dateString) {
            clockWidget.find('.clock-date').text(dateString);
        } else {
            clockWidget.find('.clock-date').text("");
        }
        clockWidget.find('.clock-time').text(time);
        clockWidget.find('.clock-mode').text(timeMode);
        let tooltipText = DynTekst_show;
        if (TOOLTIP_MODE === "normal") {
            tooltipText += "\n" + DynTekst_show2;
        }

        clockWidget.attr('data-tooltip-content', tooltipText);
    }

    $("<style>")
        .prop("type", "text/css")
        .html(`
        #custom-clock-widget[data-tooltip-disabled='true']:hover:after {
            content: attr(data-tooltip-content) !important;
            position: absolute !important;
            top: 100% !important;
            left: 50% !important;
            transform: translateX(-50%) !important;
            background-color: var(--color-2) !important;
            border: 2px solid var(--color-3) !important;
            color: var(--color-text) !important;
            text-align: center !important;
            font-size: 14px !important;
            border-radius: 15px !important;
            padding: 10px 20px !important;
            z-index: 1000 !important;
            opacity: 1 !important;
            margin-top: 8px !important;
            width: auto !important;
            min-width: 270px !important;
            max-width: 500px !important;
            box-sizing: border-box !important;
            word-wrap: break-word !important;
            white-space: pre-line !important;
            display: block !important;
        }

        .no-tooltip {
            pointer-events: none !important;
        }

        .no-tooltip * {
            pointer-events: all !important;
        }
        `)
        .appendTo("head");

    $('#custom-clock-widget').css("width", (SIMPLE_CLOCK_FONT_SIZE_SCALE * 10 + 10) + "px");
    if (HIDE_CLOCK_ON_MOBILE && $(window).width() <= 768) {
        clockWidget.hide();
    } else {
        clockWidget.show();
    }

    $("<style>")
        .prop("type", "text/css")
        .html(`
            @media (max-width: 768px) {
                #custom-clock-widget {
                    position: absolute;
                    left: 50%;
                    transform: translateX(-50%);
                    gap: 0px !important;
                    flex-direction: column;
                }
                    .clock-time, .clock-date {
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
                #custom-clock-widget {
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
        texts.push("Click to change UTC/Server time mode");
    }
    if (ALLOW_USER_CLOCK_SIZE_CHANGE === true) {
        texts.push("Use the mouse wheel to change size.");
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
    $('#custom-clock-widget').attr('data-tooltip-content', tooltipText);
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
    localStorage.setItem("SIMPLE_CLOCK_USE_UTC", SIMPLE_CLOCK_USE_UTC.toString());
    console.log(`Toggled time format: Now using ${SIMPLE_CLOCK_USE_UTC ? "UTC" : "Local"} time`);
    updateClock();
	updateDynText();
}

$(document).ready(() => {
    console.log(`DOM loaded, starting clock (${SIMPLE_CLOCK_USE_UTC ? 'UTC' : 'Local time'})...`);
    serverTime = new Date();
    lastSync = Date.now();
    fetchServerTime();
    updateClock();
    updateDynText();
    updateDynText2();
    setInterval(updateClock, 1000);
    setInterval(fetchServerTime, 5 * 60 * 1000);
    $(document).on('click', '#custom-clock-widget', toggleTimeFormat);
//    AdditionalCheckboxesHideClock();
    AdditionalDropdownClockFormat();
	setTimeout(addHideClockCheckbox, 200);
    toggleClockVisibility();

    if (ALLOW_USER_CLOCK_SIZE_CHANGE) {
        $('#custom-clock-widget').on('wheel', function(event) {
            event.preventDefault();
            
            if (event.originalEvent.deltaY > 0) {
                SIMPLE_CLOCK_FONT_SIZE_SCALE = Math.max(SIMPLE_CLOCK_FONT_SIZE_SCALE - 1, 1);
            } else {
                SIMPLE_CLOCK_FONT_SIZE_SCALE = Math.min(SIMPLE_CLOCK_FONT_SIZE_SCALE + 1, 5);
            }

            localStorage.setItem("SIMPLE_CLOCK_FONT_SIZE_SCALE", SIMPLE_CLOCK_FONT_SIZE_SCALE);
            updateFontSize();
        });
    }
});

})();
