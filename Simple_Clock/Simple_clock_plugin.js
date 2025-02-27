// 🔧 Configuration options for the server admin
const CONFIG = {
    ALLOW_TIME_SWITCH: true // Set to `false` to disable the ability to switch between UTC and local time
};

// 🔧 User can choose whether the clock should display UTC or local time
let USE_UTC = true; // Set to `false` for local time

// Function to update the UI with the selected time
function updateClock() {
    let now = new Date($.now()); // Get client time via jQuery

    let time = USE_UTC
        ? now.toISOString().substring(11, 19) // UTC time HH:MM:SS
        : now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // Local time

    let dateString = USE_UTC
        ? now.toISOString().substring(0, 10).split('-').reverse().join('.') + ' UTC' // Date in UTC (DD.MM.YYYY)
        : now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }); // Local date (DD.MM.YYYY)

    let container = $('.dashboard-panel .panel-100-real .dashboard-panel-plugin-content');
    if (container.length === 0) return;

    container.css({
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'flex-start'
    });

    let clockWidget = $('#custom-clock-widget');

    if (clockWidget.length === 0) {
        let tooltipContent = CONFIG.ALLOW_TIME_SWITCH
            ? `<span class='text-bold'>${USE_UTC ? 'Client Time UTC' : 'Local Time'}</span>`
            : `<span class='text-bold'>${USE_UTC ? 'Client Time UTC' : 'Local Time'} (Switching Disabled)</span>`;

        clockWidget = $(`
            <div id="custom-clock-widget" class="flex-container flex-center tooltip hide-phone hover-brighten br-15"
                style="height: 50px; width: 130px; padding: 4px; margin-right: 6px; text-align: center; display: flex; flex-direction: column; gap: 2px;"
                data-tooltip="${tooltipContent}" data-tooltip-placement="bottom">
                <span class="color-4 m-0" style="font-size: 22px; font-weight: bold; line-height: 22px;">${time}</span>
                <span class="color-4 m-0" style="font-size: 14px; line-height: 14px;">${dateString}</span>
            </div>
        `);

        container.prepend(clockWidget);
        setTimeout(() => initTooltips(clockWidget), 1000);
    } else {
        clockWidget.find('span:first').text(time);
        clockWidget.find('span:last').text(dateString);
        let tooltipContent = CONFIG.ALLOW_TIME_SWITCH
            ? `<span class='text-bold'>${USE_UTC ? 'Client Time UTC' : 'Local Time'}</span>`
            : `<span class='text-bold'>${USE_UTC ? 'Client Time UTC' : 'Local Time'} (Switching Disabled)</span>`;
        clockWidget.attr('data-tooltip', tooltipContent);
    }

    // 📱 Hide widget on mobile
    window.innerWidth <= 768 ? clockWidget.hide() : clockWidget.show();
}

// Function to toggle between UTC and local time
function toggleTimeFormat() {
    if (!CONFIG.ALLOW_TIME_SWITCH) return; // Do nothing if time switching is disabled
    USE_UTC = !USE_UTC; // Toggle the value of USE_UTC
    updateClock(); // Update the clock immediately
}

// 🚀 Start update loop
$(document).ready(() => {
    console.log(`DOM loaded, starting clock (${USE_UTC ? 'UTC' : 'Local Time'})...`);
    updateClock(); // Update immediately
    setInterval(updateClock, 1000); // 🔄 Update every second

    // Add click event listener to the clock widget
    $(document).on('click', '#custom-clock-widget', toggleTimeFormat);
});
