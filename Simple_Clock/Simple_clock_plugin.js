// Simple Clock Plugin v1.3
// For FM-DX-Webserver v1.3.5 or later.


// Configuration
let DISPLAY_MODE = "auto";  // "auto" = Users can switch, "local" = Only local time, "utc" = Only UTC

// Time settings: 
let LOCAL_TIMEZONE = "Europe/Oslo";  // Set the desired timezone. For examples: "Europe/London" or you can use "Etc/GMT-1" for zone UTC+01:00.
let USE_DST = true;  // Important if you use GMT as a zone that uses daylight saving time.

// If your server address starts with "http://" you need to use "http://time.fmdx.no/time.php"
// If it starts with "https://" you must use "https://time.fmdx.no/time.php"
let TIME_SERVER = "https://time.fmdx.no/time.php";  // URL to timeserver. You can use any server as long as it follows ISO 8601 format.
let TIME_SERVER_RESPONSE = "utc_time"; // Change the time server response string. 
// For example, if the time server's api looks like this "utc_time": "2025-03-02T15:02:20Z", then you should use "utc_time"



// Below is a main code. Please do not change anything unless you know what you are doing.
let serverTimeZone_show = LOCAL_TIMEZONE;
let serverTime = new Date();
let lastSync = Date.now();
let TIME_SERVER_FAILED = false;
let USE_UTC = DISPLAY_MODE === "utc" ? true : DISPLAY_MODE === "local" ? false : (localStorage.getItem("USE_UTC") !== "false");

const TIME_FORMATS = {
    "HH:MM:SS  DD.MM.YYYY": { time: "HH:mm:ss", date: "dd.MM.yyyy" },  // Standard norsk
    "HH:MM AM/PM  MM/DD/YYYY": { time: "hh:mm a", date: "MM/dd/yyyy" }, // Amerikansk format
    "HH:MM:SS  YYYY-MM-DD": { time: "HH:mm:ss", date: "yyyy-MM-dd" },   // ISO-format
    "HH:MM  DD/MM/YYYY": { time: "HH:mm", date: "dd/MM/yyyy" },         // Europeisk format
    "h:mm A  dddd, MMMM Do YYYY": { time: "h:mm a", date: "eeee, MMMM do yyyy" }, // Langt format
	"HH:MM:SS  dddd, MMMM Do YYYY": { time: "HH:mm:ss", date: "eeee, MMMM do yyyy" } // Langt format 2
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

function AdditionalCheckboxesHideClock() {
    const checkboxes = $('.modal-panel-content .form-group.checkbox');
    if (checkboxes.length) {
        checkboxes.last().after(`
            <div class='form-group checkbox'>
                <input type='checkbox' id='hide-clock'>
                <label for='hide-clock' class='tooltip' data-tooltip='Hide Clock from topbar.'>
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

function toggleClockVisibility() {
    let isHidden = localStorage.getItem("HIDE_CLOCK") === "true";
    $("#custom-clock-widget").toggle(!isHidden);
    $("#clock-format").parent().toggle(!isHidden); // ✅ Skjuler formatvalg også
}

function AdditionalDropdownClockFormat() {
    const checkboxes = $('.modal-panel-content .form-group.checkbox');
    if (checkboxes.length) {
        checkboxes.last().after(`
            <div class='form-group'>
                    <i class='fa-solid m-right-10'></i>Clock Format
                </label>
				<br>
                <select id='clock-format' class='form-control'>
                    ${Object.keys(TIME_FORMATS).map(format => `<option value="${format}">${format}</option>`).join('')}
                </select>
            </div>
        `);
        // Legg til ønsket CSS for select-elementet
        $("#clock-format").css({
            "border-radius": "15px",   // Runde kanter
            "width": "220px"           // Bredde på 300px
        });
    }
    // Hent lagret format fra localStorage
    let savedFormat = localStorage.getItem("CLOCK_FORMAT") || Object.keys(TIME_FORMATS)[0];
    $("#clock-format").val(savedFormat);

    // Lagre valgt format når brukeren endrer
    $("#clock-format").change(function() {
        let selectedFormat = $(this).val();
        localStorage.setItem("CLOCK_FORMAT", selectedFormat);
        updateClock();
    });
}


function updateClock() {
    let now = new Date(serverTime.getTime() + (Date.now() - lastSync));
    let selectedFormat = localStorage.getItem("CLOCK_FORMAT") || Object.keys(TIME_FORMATS)[0];
    let format = TIME_FORMATS[selectedFormat];
	let clockWidget = $('#custom-clock-widget');
    let time = new Intl.DateTimeFormat('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: format.time.includes('ss') ? '2-digit' : undefined, 
        hour12: format.time.includes('a'), 
        timeZone: USE_UTC ? "UTC" : LOCAL_TIMEZONE 
    }).format(now);

	let dateString;
	if (selectedFormat === "HH:MM:SS  YYYY-MM-DD") {  
		dateString = now.toISOString().split("T")[0]; 
	} else {
		dateString = new Intl.DateTimeFormat('en-GB', { 
			day: '2-digit', 
			month: '2-digit', 
			year: 'numeric', 
			weekday: format.date.includes('eeee') ? 'long' : undefined, 
			month: format.date.includes('MMMM') ? 'long' : '2-digit',
			timeZone: USE_UTC ? "UTC" : LOCAL_TIMEZONE  
		}).format(now);
	}

    if (!clockWidget.length) {
        $(".dashboard-panel .panel-100-real .dashboard-panel-plugin-content").after(`
            <div id='custom-clock-widget' class='flex-container flex-center tooltip hide-phone hover-brighten br-15' 
                style='height: 50px; width: 125px; padding: 2px; text-align: center; display: flex; flex-direction: column; gap: 2px; user-select: none;'
                data-tooltip='Click to toggle UTC & local server time' data-tooltip-placement='bottom'>
                <span class='color-4 m-0 clock-time' style='font-size: 22px; font-weight: bold; line-height: 1;'>${time}</span>
                <span class='color-4 m-0 clock-date' style='font-size: 13px; line-height: 1;'>${dateString}</span>
            </div>
        `);
    } else {
		clockWidget.find('.clock-time').text(time).css({ "margin": "0", "padding": "0", "line-height": "1" });
		clockWidget.find('.clock-date').text(dateString + ` (${USE_UTC ? "UTC" : "Loc"})` + (TIME_SERVER_FAILED ? " *" : "")).css({ "margin": "0", "padding": "0", "line-height": "1" });
        clockWidget.attr('data-tooltip', DISPLAY_MODE === "auto" 
		? `Click to toggle UTC & local server time.<br>Local TimeZone: ${serverTimeZone_show}<br><br>Simple Clock v1.3 (beta)` 
		: `${USE_UTC ? 'UTC Time' : 'Local Time'} (Locked)`);
    }

    $(window).width() <= 768 ? clockWidget.hide() : clockWidget.show();
    toggleClockVisibility();
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
});
