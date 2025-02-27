// Funksjon for å oppdatere UI med klientens tid i UTC
function updateClock() {
    const now = new Date(); // Bruker lokal tid fra klientens enhet
    const timeString = now.toISOString().substring(11, 19); // Henter HH:MM:SS i UTC

    // Konverter datoformat til DD.MM.YYYY
    const isoDate = now.toISOString().substring(0, 10);
    const [year, month, day] = isoDate.split('-');
    const dateString = `${day}.${month}.${year} UTC`; // Format: DD.MM.YYYY UTC

    let container = $('.dashboard-panel .panel-100-real .dashboard-panel-plugin-content');
    if (container.length === 0) return;

    container.css({
        'display': 'flex',
        'align-items': 'center',
        'justify-content': 'flex-start'
    });

    let clockWidget = $('#custom-clock-widget');

    if (clockWidget.length === 0) {
        let tooltipContent = `<span class='text-bold'>Clienttime UTC</span>`;

        clockWidget = $(`
            <div id="custom-clock-widget" class="flex-container flex-center tooltip hide-phone hover-brighten br-15"
                style="height: 50px; width: 130px; padding: 4px; margin-right: 6px; text-align: center; display: flex; flex-direction: column; gap: 2px;"
                data-tooltip="${tooltipContent}" data-tooltip-placement="bottom">
                <span class="color-4 m-0" style="font-size: 22px; font-weight: bold; line-height: 22px;">${timeString}</span>
                <span class="color-4 m-0" style="font-size: 14px; line-height: 14px;">${dateString}</span>
            </div>
        `);

        container.prepend(clockWidget);
        setTimeout(() => initTooltips(clockWidget), 1000);
    } else {
        clockWidget.find('span:first').text(timeString);
        clockWidget.find('span:last').text(dateString);
    }

    // 📱 Skjul widget på mobil
    if (window.innerWidth <= 768) {
        clockWidget.hide();
    } else {
        clockWidget.show();
    }
}

// 🚀 Start oppdateringsløkken
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM lastet, starter klokke fra klient (UTC)...');
    updateClock(); // Oppdater umiddelbart
    setInterval(updateClock, 1000); // 🔄 Oppdater hvert 1. sekund
});