// 🔧 Admin Configuration
let TIME_MODE = "auto";  // "auto" = Users can switch, "local" = Only local time, "utc" = Only UTC
let LOCAL_TIMEZONE = "Europe/Oslo";  // 🌍 Set the desired timezone (e.g., "America/New_York")
let USE_DST = true;  // ⏳ Should daylight saving time be used? true = Yes, false = No

// 🚀 Determine initial UTC value based on admin setting
let USE_UTC = TIME_MODE === "utc" 
    ? true 
    : TIME_MODE === "local" 
    ? false 
    : (localStorage.getItem("USE_UTC") !== null ? localStorage.getItem("USE_UTC") === "true" : true);

// ⏳ Update UI with the selected time mode
function updateClock() {
    let now = new Date();

    let time = USE_UTC
    ? now.toISOString().substring(11, 19) // UTC time HH:MM:SS
    : new Intl.DateTimeFormat('en-GB', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        timeZone: LOCAL_TIMEZONE
    }).format(now);

    let dateString = USE_UTC
    ? now.toISOString().substring(0, 10).split('-').reverse().join('.') + ' UTC'
    : new Intl.DateTimeFormat('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric', 
        timeZone: LOCAL_TIMEZONE
    }).format(now) + ' Loc';

    let container = $('.dashboard-panel .panel-100-real .dashboard-panel-plugin-content');
    if (!container.length) return;

    container.css({ 'display': 'flex', 'align-items': 'center', 'justify-content': 'flex-start' });

    let clockWidget = $('#custom-clock-widget');

    if (!clockWidget.length) {
        let tooltipContent = TIME_MODE === "auto"
            ? `<span class='text-bold'>Tap to switch mode</span>`
            : `<span class='text-bold'>${USE_UTC ? 'UTC Time' : 'Local Time'} (Locked)</span>`;

        clockWidget = $(`
            <div id="custom-clock-widget" class="flex-container flex-center tooltip hide-phone hover-brighten br-15"
                style="height: 50px; width: 115px; padding: 4px; margin-right: 6px; text-align: center; display: flex; flex-direction: column; gap: 2px; user-select: none;"
                data-tooltip="${tooltipContent}" data-tooltip-placement="bottom">
                <span class="color-4 m-0 clock-time" style="font-size: 22px; font-weight: bold; line-height: 22px;">${time}</span>
                <span class="color-4 m-0 clock-date" style="font-size: 14px; line-height: 14px;">${dateString}</span>
            </div>
        `);

        container.prepend(clockWidget);
        setTimeout(() => initTooltips(clockWidget), 1000);
    } else {
        clockWidget.find('.clock-time').text(time);
        clockWidget.find('.clock-date').text(dateString);
        clockWidget.attr('data-tooltip', TIME_MODE === "auto"
            ? `<span class='text-bold'>Tap to switch mode</span>`
            : `<span class='text-bold'>${USE_UTC ? 'UTC Time' : 'Local Time'} (Locked)</span>`);
    }

    $(window).width() <= 768 ? clockWidget.hide() : clockWidget.show();
}

// 🔄 Toggle between UTC and local time (if allowed)
function toggleTimeFormat() {
    if (TIME_MODE !== "auto") return;  // Stop if switching is disabled
    USE_UTC = !USE_UTC; 
    localStorage.setItem("USE_UTC", USE_UTC.toString()); 
    updateClock();
}

// 🚀 Initialize the clock
$(document).ready(() => {
    console.log(`DOM loaded, starting clock (${USE_UTC ? 'UTC' : 'Local time'})...`);
    updateClock();
    setInterval(updateClock, 1000); 

    $(document).on('click', '#custom-clock-widget', toggleTimeFormat);
});
