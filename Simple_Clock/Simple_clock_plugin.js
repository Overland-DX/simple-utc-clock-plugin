// 🔧 Admin Configuration
let DISPLAY_MODE = "auto";  // "auto" = Users can switch, "local" = Only local time, "utc" = Only UTC
let LOCAL_TIMEZONE = "Europe/Oslo";  // 🌍 Set the desired timezone
let USE_DST = true;  // ⏳ Should daylight saving time be used?
// TimeServer setting: 
// If your server address starts with "http://" you need to use "http://time.fmdx.no/time.php"
// If it starts with "https://" you must use "https://time.fmdx.no/php"
let TIME_SERVER = "https://time.fmdx.no/time.php";  // 🌐 Server to fetch time from (ISO 8601 format)
let TIME_SERVER_RESPONSE = "utc_time";

let serverTime = new Date();
let lastSync = Date.now();
let TIME_SERVER_FAILED = false;
let USE_UTC = DISPLAY_MODE === "utc" ? true : DISPLAY_MODE === "local" ? false : (localStorage.getItem("USE_UTC") === "true");

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
    $("#custom-clock-widget").toggle(localStorage.getItem("HIDE_CLOCK") !== "true");
}

function updateClock() {
    let now = new Date(serverTime.getTime() + (Date.now() - lastSync));
    let time = USE_UTC ? now.toISOString().substring(11, 19) : new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: LOCAL_TIMEZONE
    }).format(now);
    let dateString = USE_UTC ? now.toISOString().substring(0, 10).split('-').reverse().join('.') + ' UTC' : new Intl.DateTimeFormat('en-GB', {
        day: '2-digit', month: '2-digit', year: 'numeric', timeZone: LOCAL_TIMEZONE
    }).format(now).replace(/\//g, '.') + ' Loc';
    
    let clockWidget = $('#custom-clock-widget');
    if (!clockWidget.length) {
        $(".dashboard-panel .panel-100-real .dashboard-panel-plugin-content").css({
            'display': 'flex',
            'align-items': 'center',
            'justify-content': 'flex-start',
            'gap': '2px'
        }).prepend(`
            <div id='custom-clock-widget' class='flex-container flex-center tooltip hide-phone hover-brighten br-15' 
                style='height: 50px; width: 115px; padding: 2px; margin-right: 0px; text-align: center; display: flex; flex-direction: column; gap: 2px; user-select: none;'
                data-tooltip='${DISPLAY_MODE === "auto" ? "Click to toggle UTC & local server time" : `${USE_UTC ? 'UTC Time' : 'Local Time'} (Locked)`}'
                data-tooltip-placement='bottom'>
                <span class='color-4 m-0 clock-time' style='font-size: 22px; font-weight: bold; line-height: 22px;'>${time}</span>
                <span class='color-4 m-0 clock-date' style='font-size: 14px; line-height: 14px;'>${dateString}</span>
            </div>
        `);
    } else {
        clockWidget.find('.clock-time').text(time);
        clockWidget.find('.clock-date').text(dateString + (TIME_SERVER_FAILED ? " *" : ""));
        clockWidget.attr('data-tooltip', DISPLAY_MODE === "auto" ? "Click to toggle UTC & local server time" : `${USE_UTC ? 'UTC Time' : 'Local Time'} (Locked)`);
    }
    $(window).width() <= 768 ? clockWidget.hide() : clockWidget.show();
    toggleClockVisibility();
}

function toggleTimeFormat() {
    if (DISPLAY_MODE !== "auto") return;
    USE_UTC = !USE_UTC;
    localStorage.setItem("USE_UTC", USE_UTC.toString());
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
    toggleClockVisibility();
});
