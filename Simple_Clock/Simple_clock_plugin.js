(() => {
// Simple Clock v1.05.0
// For FM-DX-Webserver v1.3.5 or later.
// This is open source code. Feel free to do whatever you want with it.


// Configuration
let DISPLAY_MODE = "auto";  // "auto" = Users can switch, "local" = Only local time, "utc" = Only UTC. Default is "auto"
const DEFAULT_CLOCK_SIZE_SCALE = 3;  // Set the default value for the clock size. Between 1 and 5 are allowed.
const ALLOW_USER_CLOCK_SIZE_CHANGE = true; // Set to false if users should not be able to change clock size. Default is true.
let PLUGIN_POSITION = "after"; // "after" or "before" other plugins in the rigth area on topbar.
const HIDE_CLOCK_ON_MOBILE = false; // Set to true; if you want to hide clock from be displayed on the mobile. Default is false.
const HIDE_TIME_MODE = false; // Set to true to hide the UTC/Local which is displayed above the clock. Default is false.


// Time settings: 
let LOCAL_TIMEZONE = "Europe/London";  // Set the desired timezone. For example: "Europe/London" or "Etc/GMT-1" for zone UTC+01:00.
let USE_DST = true;  // Important if you use GMT as a zone that uses daylight saving time. Valid usage: true or false
let API_SERVER_ADDRESS = "time.fmdx.no"; // URL to timeserver, do not include http:// or https://. You can use any server API as long as it follows ISO 8601 format.
let TIME_SERVER_RESPONSE = "utc_time";  // Change the time server response string.
// For example, if the time server's api looks like this "utc_time": "2025-03-02T15:02:20Z", then you should use "utc_time"




// Below is the main code. Please do not change anything unless you know what you are doing.
const CURRENT_VERSION = "1.05.0";

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
let serverTimeZone_show = LOCAL_TIMEZONE;
let serverTime = new Date();
let lastSync = Date.now();
let TIME_SERVER_FAILED = false;
let timeProtocol = window.location.protocol === 'https:' ? 'https' : 'http';
let TIME_SERVER = `${timeProtocol}://${API_SERVER_ADDRESS}`;

const TIME_FORMATS = {
    "24h dd.MM.yyyy": { time: "HH:mm:ss", date: "dd.MM.yyyy" }, 
    "24h dd MMM yyyy": { time: "HH:mm:ss", date: "dd MMM yyyy" }, 
    "12h dd.MM.yyyy": { time: "hh:mm a", date: "dd.MM.yyyy" },  
    "24h MM/dd/yyyy": { time: "HH:mm:ss", date: "MM.dd.yyyy" }, 
    "24h MMM dd yyyy": { time: "HH:mm:ss", date: "MMM dd yyyy" }, 
    "12h MM/dd/yyyy": { time: "hh:mm a", date: "MM/dd/yyyy" }, 
    "24h Time only": { time: "HH:mm:ss"}, 
    "12h Time only": { time: "h:mm a"} 
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

function AdditionalCheckboxesHideClock() {
    const checkboxes = $('.modal-panel-content .form-group.checkbox');
    if (checkboxes.length) {
        checkboxes.last().after(`
            <div class='form-group checkbox'>
                <input type='checkbox' id='hide-clock'>
                <label for='hide-clock'>
                    <i class='fa-solid fa-toggle-off m-right-10'></i> Hide Simple Clock
                </label>
            </div>
        `);
    }
    let isClockHidden = localStorage.getItem("SIMPLE_CLOCK_HIDE_CLOCK") === "true";
    $("#hide-clock").prop("checked", isClockHidden).change(function() {
        localStorage.setItem("SIMPLE_CLOCK_HIDE_CLOCK", $(this).is(":checked"));
        toggleClockVisibility();
    });
}

function AdditionalDropdownClockFormat() {
    $("#clock-format-container").remove();
    const panelFull = $('.panel-full.flex-center.no-bg.m-0').first();
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
    }

    $("#clock-format-input").click(function() {
        const options = $("#clock-format-options");
        options.toggleClass("opened");
    });

    $("#clock-format-options .option").click(function() {
        let selectedFormat = $(this).data("value");
        if ($(this).attr("id") === "hide-clock-option") {
            let isHidden = localStorage.getItem("SIMPLE_CLOCK_HIDE_CLOCK") === "true";
            localStorage.setItem("SIMPLE_CLOCK_HIDE_CLOCK", isHidden ? "false" : "true");
            toggleClockVisibility();
            $(this).text(isHidden ? "Hide Clock" : "Show Clock");
        } else {
            localStorage.setItem("SIMPLE_CLOCK_CLOCK_FORMAT", selectedFormat);
            $("#clock-format-input").val($(this).text());
            updateClock();
        }
        $("#clock-format-options").removeClass("opened");
    });
    let savedFormat = localStorage.getItem("SIMPLE_CLOCK_CLOCK_FORMAT") || Object.keys(TIME_FORMATS)[0];
    $("#clock-format-input").val(savedFormat);
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
        second: '2-digit',
        hour12: true,
        timeZone: SIMPLE_CLOCK_USE_UTC ? "UTC" : LOCAL_TIMEZONE
    }).format(now);
    let [time, amPmText] = fullTime.split(' ');
    if (!is12HourFormat) {
        time = new Intl.DateTimeFormat('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
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
    let day = now.getDate().toString().padStart(2, '0');
    let monthIndex = now.getMonth();
    let year = now.getFullYear();

    let monthShort = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(now).replace('.', ''); // Fjerner punktum
    let monthNumeric = (monthIndex + 1).toString().padStart(2, '0');

    let dateString = '';

    if (format.date) {
        if (selectedFormat.includes("dd.MM.yyyy")) {
            dateString = `${day}.${monthNumeric}.${year}`;
        } else if (selectedFormat.includes("dd MMM yyyy")) {
            dateString = `${day} ${monthShort} ${year}`;
        } else if (selectedFormat.includes("MM/dd/yyyy")) {
            dateString = `${monthNumeric}.${day}.${year}`;
        } else if (selectedFormat.includes("MMM dd yyyy")) {
            dateString = `${monthShort} ${day} ${year}`;
        }
    }
    let timeMode = SIMPLE_CLOCK_USE_UTC ? "UTC" : "Local";
    let SyncStatusValue = (SERVER_SYNC === 'client') ? '⚠️' : ''; 

    let syncStatusElement = clockWidget.find('.synk-status');
    syncStatusElement.html(SyncStatusValue).show();  

    if (!clockWidget.length) {
        let panelContainer = $(".dashboard-panel .panel-100-real .dashboard-panel-plugin-content");
        let widgetHtml = `
            <div id='custom-clock-widget' class='flex-container flex-center hide-phone hover-brighten br-15'
                style='position: relative; height: 50px; width: 125px; padding: 2px; text-align: center; display: flex; flex-direction: column; gap: 0px !important; user-select: none;'
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
		let tooltipText = DynTekst_show + "\n" + DynTekst_show2;
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
        "Click to change time mode"
    ];

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
    let tooltipText = DynTekst_show + "\n" + DynTekst_show2;
    $('#custom-clock-widget').attr('data-tooltip-content', tooltipText);
}

function updateDynText() {
    clearTimeout(updateDynTextTimeout);
    function getCurrentMode() {
        return SIMPLE_CLOCK_USE_UTC ? "UTC" : "Local";
    }

    function cycleMessages() {
        let currentMode = getCurrentMode();
        let displayModeMessage = "";
        if (DISPLAY_MODE === "utc") {
            displayModeMessage = "Displays UTC Time (Locked)";
        } else if (DISPLAY_MODE === "local") {
            displayModeMessage = "Displays Server Time (Locked)";
        } else {
            displayModeMessage = `Displays ${currentMode} time.`;
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
    AdditionalCheckboxesHideClock();
    AdditionalDropdownClockFormat();
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
