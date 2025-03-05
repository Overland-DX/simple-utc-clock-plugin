// Simple Clock Plugin v1.04.1
// For FM-DX-Webserver v1.3.5 or later.
// This is open source code. Feel free to do whatever you want with it.


// Configuration
let DISPLAY_MODE = "auto";  // "auto" = Users can switch, "local" = Only local time, "utc" = Only UTC
const DEFAULT_FONT_SIZE_SCALE = 3;  // Set the default value for the clock size. Between 1 and 5 are allowed.
let PLUGIN_POSITION = "after"; // "after" or "before" other plugins in the rigth area on topbar.
const HIDE_CLOCK_ON_MOBILE = false; // Set to false; if you want the clock to be displayed on the mobile.

// Time settings: 
let LOCAL_TIMEZONE = "Europe/Oslo";  // Set the desired timezone. For example: "Europe/London" or "Etc/GMT-1" for zone UTC+01:00.
let USE_DST = true;  // Important if you use GMT as a zone that uses daylight saving time.
let TIME_SERVER = "https://time.fmdx.no/time.php";  // URL to timeserver. You can use any server API as long as it follows ISO 8601 format.
// If your server address starts with "http://" you need to use "http://time.fmdx.no/time.php"
// If it starts with "https://" you must use "https://time.fmdx.no/time.php"
let TIME_SERVER_RESPONSE = "utc_time";  // Change the time server response string.
// For example, if the time server's api looks like this "utc_time": "2025-03-02T15:02:20Z", then you should use "utc_time"




// Below is a main code. Please do not change anything unless you know what you are doing.
const CURRENT_VERSION = "1.04.1";
const SAVED_VERSION = localStorage.getItem("PLUGIN_VERSION");

if (SAVED_VERSION !== CURRENT_VERSION) {
    console.log("New version detected. Cleaning up outdated settings...");
    const OBSOLETE_KEYS = ["OLD_SETTING_1", "OLD_SETTING_2"]; 
    OBSOLETE_KEYS.forEach(key => localStorage.removeItem(key));
    localStorage.setItem("PLUGIN_VERSION", CURRENT_VERSION);
}

// Sette standardverdier for klokkestørrelse, men la brukeren overstyre
if (!localStorage.getItem("FONT_SIZE_SCALE")) localStorage.setItem("FONT_SIZE_SCALE", DEFAULT_FONT_SIZE_SCALE);

// Hente brukervalgte verdier
let FONT_SIZE_SCALE = parseInt(localStorage.getItem("FONT_SIZE_SCALE"));

// Sikre at verdien er gyldig
if (isNaN(FONT_SIZE_SCALE) || FONT_SIZE_SCALE < 1 || FONT_SIZE_SCALE > 5) {
    FONT_SIZE_SCALE = DEFAULT_FONT_SIZE_SCALE;
    localStorage.setItem("FONT_SIZE_SCALE", DEFAULT_FONT_SIZE_SCALE);
}

// Widget-bredde følger klokkestørrelse
let WIDGET_WIDTH_SCALE = FONT_SIZE_SCALE;

if (isNaN(WIDGET_WIDTH_SCALE) || WIDGET_WIDTH_SCALE < 1 || WIDGET_WIDTH_SCALE > 5) {
    WIDGET_WIDTH_SCALE = DEFAULT_WIDGET_WIDTH_SCALE;
    localStorage.setItem("WIDGET_WIDTH_SCALE", DEFAULT_WIDGET_WIDTH_SCALE);
}

// Håndtering av tid
let USE_UTC = DISPLAY_MODE === "utc" ? true : DISPLAY_MODE === "local" ? false : (localStorage.getItem("USE_UTC") === "true");
let serverTimeZone_show = LOCAL_TIMEZONE;
let serverTime = new Date();
let lastSync = Date.now();
let TIME_SERVER_FAILED = false;

const TIME_FORMATS = {
    "24h D.M.Y": { time: "HH:mm:ss", date: "dd.MM.yyyy" },  
    "12h D.M.Y": { time: "hh:mm a", date: "dd.MM.yyyy" },  
    "24h M.D.Y": { time: "HH:mm:ss", date: "MM.dd.yyyy" }, 
    "12h M.D.Y": { time: "hh:mm a", date: "MM/dd/yyyy" }, 
    "24h Time only": { time: "HH:mm:ss"}, 
    "12h Time only": { time: "h:mm a"} 
};

async function fetchServerTime() {
    try {
        let data = await $.getJSON(TIME_SERVER, { _: new Date().getTime() });
        if (data[TIME_SERVER_RESPONSE]) {
            serverTime = new Date(data[TIME_SERVER_RESPONSE]);
            lastSync = Date.now();
            TIME_SERVER_FAILED = false;
            console.log("✅ Synced with server time:", serverTime.toISOString());
        } else {
            throw new Error("Invalid response format");
        }
    } catch (error) {
        console.warn("⚠️ Server time fetch failed, using client time:", error);
        serverTime = new Date();
        lastSync = Date.now();
        TIME_SERVER_FAILED = true;
        updateClock();
    }
}

// Plugin-informasjon og statusvariabler
const PLUGIN_INFO = {
    version: CURRENT_VERSION,
    syncStatus: TIME_SERVER_FAILED ? "Synchronizes time from user device." : "Synchronizes time from server API."
};

function AdditionalCheckboxesHideClock() {
    const checkboxes = $('.modal-panel-content .form-group.checkbox');
    if (checkboxes.length) {
        checkboxes.last().after(`
            <div class='form-group checkbox'>
                <input type='checkbox' id='hide-clock'>
                <label for='hide-clock'>
                    <i class='fa-solid fa-toggle-off m-right-10'></i> Hide Clock
                </label>
            </div>
        `);
    }

    let isClockHidden = localStorage.getItem("HIDE_CLOCK") === "true";
    $("#hide-clock").prop("checked", isClockHidden).change(function() {
        localStorage.setItem("HIDE_CLOCK", $(this).is(":checked"));
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
                    <i class="fa-solid m-right-10"></i>Clock Format
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
            let isHidden = localStorage.getItem("HIDE_CLOCK") === "true";
            localStorage.setItem("HIDE_CLOCK", isHidden ? "false" : "true");
            toggleClockVisibility();
            $(this).text(isHidden ? "Hide Clock" : "Show Clock");
        } else {
            localStorage.setItem("CLOCK_FORMAT", selectedFormat);
            $("#clock-format-input").val($(this).text());
            updateClock();
        }

        $("#clock-format-options").removeClass("opened");
    });

    let savedFormat = localStorage.getItem("CLOCK_FORMAT") || Object.keys(TIME_FORMATS)[0];
    $("#clock-format-input").val(savedFormat);
}

function toggleClockVisibility() {
    let isHidden = localStorage.getItem("HIDE_CLOCK") === "true";
    let isMobile = $(window).width() <= 768;
    let shouldHideClock = isHidden || (HIDE_CLOCK_ON_MOBILE && isMobile);

    $("#custom-clock-widget").toggle(!isHidden);
    $("#clock-format-container").toggle(!isHidden);
    $(".form-group.checkbox:has(#hide-clock)").toggle(!shouldHideClock);
}

function updateFontSize() {
    let fontSizeFactor = FONT_SIZE_SCALE * 2 + 16;
    let fontSizeFactorDate = FONT_SIZE_SCALE + 10; 
    let widgetWidth = FONT_SIZE_SCALE * 10 + 70;
    let timeFontSize = Math.min(Math.max(fontSizeFactor, 18), 30);
    let dateFontSize = Math.min(Math.max(fontSizeFactorDate, 9), 14);
    let topOffset = Math.min(Math.max((FONT_SIZE_SCALE * -1) - 1, -5), 2);

    $('#custom-clock-widget .clock-time').css("font-size", timeFontSize + "px");
    $('#custom-clock-widget .clock-date').css("font-size", dateFontSize + "px");
    $('#custom-clock-widget').css("width", widgetWidth + "px");
    $('#custom-clock-widget .clock-mode, #custom-clock-widget .clock-am-pm').css("top", topOffset + "px");
}

function updateClock() {
    let now = new Date(serverTime.getTime() + (Date.now() - lastSync));
    let selectedFormat = localStorage.getItem("CLOCK_FORMAT") || Object.keys(TIME_FORMATS)[0];
    let format = TIME_FORMATS[selectedFormat];
    let clockWidget = $('#custom-clock-widget');

    let is12HourFormat = format.time.includes('a');

    let fullTime = new Intl.DateTimeFormat('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: true,  
        timeZone: USE_UTC ? "UTC" : LOCAL_TIMEZONE
    }).format(now);

    let [time, amPmText] = fullTime.split(' ');

    if (!is12HourFormat) {
        time = new Intl.DateTimeFormat('en-GB', { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',  
            hour12: false,  
            timeZone: USE_UTC ? "UTC" : LOCAL_TIMEZONE
        }).format(now);
        amPmText = ""; 
    }

    let amPmElement = clockWidget.find('.clock-am-pm');
    if (is12HourFormat) {
        amPmElement.text(amPmText).show();
    } else {
        amPmElement.hide();
    }

    let dateString = '';
    if (format.date) {
        let dateLocale = selectedFormat.includes("M.D.Y") ? 'en-US' : 'en-GB';  
        dateString = new Intl.DateTimeFormat(dateLocale, { 
            day: '2-digit', 
            month: format.date.includes('MMMM') ? 'long' : '2-digit',  
            year: 'numeric',
            weekday: format.date.includes('eeee') ? 'long' : undefined,  
            timeZone: USE_UTC ? "UTC" : LOCAL_TIMEZONE
        }).format(now);
    }

    let timeMode = USE_UTC ? "UTC" : "Local";

	if (!clockWidget.length) {
		let panelContainer = $(".dashboard-panel .panel-100-real .dashboard-panel-plugin-content");
		let widgetHtml = `
			<div id='custom-clock-widget' class='flex-container flex-center tooltip hide-phone hover-brighten br-15' 
				style='position: relative; height: 54px; width: 125px; padding: 2px; text-align: center; display: flex; flex-direction: column; gap: 2px; user-select: none;'
				data-tooltip='Click to toggle UTC & local server time.<br>Local TimeZone: ${serverTimeZone_show}<br>${PLUGIN_INFO.syncStatus}<br><br>Simple Clock v${PLUGIN_INFO.version}' data-tooltip-placement='bottom'>

				<span class='color-4 m-0 clock-mode' 
					style='position: absolute; top: -5px; left: 78%; transform: translateX(-50%); font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 5px;'>
					${timeMode}
				</span>

				<span class='color-4 m-0 clock-am-pm' 
					style='position: absolute; top: -5px; left: 14%; transform: translateX(-50%); font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 5px; display: none;'>
				</span>

				<span class='color-4 m-0 clock-time' style='font-size: 22px; font-weight: bold; line-height: 1;'>${time}</span>
				<span class='color-4 m-0 clock-date' style='font-size: 13px; line-height: 1;'>${dateString}</span>
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
        
        let timeSyncMarker = TIME_SERVER_FAILED ? '*' : '';
        clockWidget.find('.clock-time').text(time);
        clockWidget.find('.clock-mode').text(timeMode + timeSyncMarker);

		let tooltipText = `Click to toggle UTC & local server time.<br>Local TimeZone: ${serverTimeZone_show}<br>${PLUGIN_INFO.syncStatus}<br><br>Simple Clock v${PLUGIN_INFO.version}`;

		if (DISPLAY_MODE !== "auto") {
			tooltipText = USE_UTC 
			? "You are viewing UTC Time. Click to switch to Local Time."
			: "You are viewing Local Time. Click to switch to UTC Time.";
		}
		clockWidget.attr('data-tooltip', tooltipText);
    }
	$('#custom-clock-widget').css("width", (FONT_SIZE_SCALE * 10 + 10) + "px");
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


function toggleTimeFormat() {
    if (DISPLAY_MODE !== "auto") return;
    USE_UTC = !USE_UTC;
    localStorage.setItem("USE_UTC", USE_UTC.toString());
    console.log(`Toggled time format: Now using ${USE_UTC ? "UTC" : "Local"} time`);
    updateClock();
}

$(document).ready(() => {
    console.log(`DOM loaded, starting clock (${USE_UTC ? 'UTC' : 'Local time'})...`);
    serverTime = new Date();
    lastSync = Date.now();
    fetchServerTime();
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(fetchServerTime, 5 * 60 * 1000);
    $(document).on('click', '#custom-clock-widget', toggleTimeFormat);
    AdditionalCheckboxesHideClock();
    AdditionalDropdownClockFormat();
    toggleClockVisibility();

	$('#custom-clock-widget').on('wheel', function(event) {
		event.preventDefault();

		if (event.originalEvent.deltaY > 0) {
			FONT_SIZE_SCALE = Math.max(FONT_SIZE_SCALE - 1, 1);
		} else {
			FONT_SIZE_SCALE = Math.min(FONT_SIZE_SCALE + 1, 5);
		}
		localStorage.setItem("FONT_SIZE_SCALE", FONT_SIZE_SCALE);
		updateFontSize();
	});
});
