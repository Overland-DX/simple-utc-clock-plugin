// User can choose whether the clock should display UTC or local time
const USE_UTC = true; // Set to `false` to show local time

// Funksjon for å oppdatere UI med valgt tid
function updateClock() {
    let now = new Date($.now()); // Henter klientens tid via jQuery

    let time = USE_UTC
        ? now.toISOString().substring(11, 19) // UTC-tid HH:MM:SS
        : now.toLocaleTimeString('no-NO', { hour: '2-digit', minute: '2-digit', second: '2-digit' }); // Lokal tid

    let dateString = USE_UTC
        ? now.toISOString().substring(0, 10).split('-').reverse().join('.') + ' UTC' // Dato i UTC (DD.MM.YYYY)
        : now.toLocaleDateString('no-NO', { day: '2-digit', month: '2-digit', year: 'numeric' }); // Lokal dato (DD.MM.YYYY)

    let container = $('.dashboard-panel .panel-100-real .dashboard-panel-plugin-content');
    if (container.length === 0) return;

    container.css({
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'flex-start'
    });

    let clockWidget = $('#custom-clock-widget');

    if (clockWidget.length === 0) {
        let tooltipContent = `<span class='text-bold'>${USE_UTC ? 'Client Time UTC' : 'Local Time'}</span>`;

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
        clockWidget.attr('data-tooltip', `<span class='text-bold'>${USE_UTC ? 'Klienttid UTC' : 'Lokal tid'}</span>`);
    }

    // 📱 Skjul widget på mobil
    window.innerWidth <= 768 ? clockWidget.hide() : clockWidget.show();
}

// 🚀 Start oppdateringsløkken
$(document).ready(() => {
    console.log(`DOM lastet, starter klokke (${USE_UTC ? 'UTC' : 'Lokal tid'})...`);
    updateClock(); // Oppdater umiddelbart
    setInterval(updateClock, 1000); // 🔄 Oppdater hvert sekund
});
