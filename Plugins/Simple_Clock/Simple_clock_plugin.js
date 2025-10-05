(() => {
    /*
    Simple Clock v1.20.1
    For FM-DX-Webserver v1.3.5 or later.
    */

	// ===================================================================
	// === Simple Clock Plugin Configuration ===
	// ===================================================================
	const CONFIG = {
		// General
		PLUGIN_VERSION: "1.20.1",
		GITHUB_URL: "https://github.com/Overland-DX/simple-utc-clock-plugin",

		// Behavior
		DEFAULT_CLOCK_MODE: "Nixie Tube Clock", // Sets the clock type shown to new users. Options: "Digital Clock", "Flap Clock", "Nixie Tube Clock"
		DISPLAY_MODE: "auto",                // "auto": User can click to toggle UTC/Local. "local": Locks to server time. "utc": Locks to UTC time.
		TOOLTIP_MODE: "normal",              // "normal": Shows all info on hover. "limited": Shows only the current time mode.
		PLUGIN_POSITION: "after",            // "after": Places the clock to the right of other plugins. "before": Places it to the left.
		HIDE_SETTINGS_BUTTON: false,         // true: Hides the gear icon for all users. false: Shows the gear icon.
		HIDE_CLOCK_ON_MOBILE: false,         // true: Hides the clock entirely on small screens (phones). false: Shows the clock on all devices.
		HIDE_TIME_MODE_LABEL: false,         // true: Hides the small "UTC" text above the clock. false: Shows the text.

		// Server API (Leave empty to use default)
		API_SERVER_ADDRESS: "",              // e.g., "my-time-server.com/api/time". Do not include http:// or https://.
		TIME_SERVER_RESPONSE_KEY: "utc_time",// The JSON key in the API response that contains the time string.
		FORCE_TIMEZONE: "",                  // Overrides server-detected timezone. e.g., "Europe/Oslo", "America/New_York", "Asia/Tokyo".

		// ===================================================================
		// === Default Settings for Each Clock Type ===
		// ===================================================================
		CLOCK_DEFAULTS: {
			digital: {
				zoom: 3,
				showSeconds: true,
				colorName: "Theme Color",
				fontIndex: 0,
				timeFormat: "24h dd MMM yyyy"
			},
			flap: {
				zoom: 2,
				showSeconds: false,
				showDate: true,
				dateFormat: "dd.MM.yyyy",
				colorName: "Theme Color"
			},
			nixie: {
				zoom: 2,
				showSeconds: false,
				showDate: true,
				dateFormat: "dd.MM.yyyy"
			}
		}
	};

    // ===================================================================
    // === Constants & Presets ===
    // ===================================================================
    const PRESETS = {
        FONTS: ["standard", "sc-font1", "sc-font2", "sc-font3", "sc-font4"],
        COLORS: { "Theme Color": "auto", "Turquoise": "#1abc9c", "Sky Blue": "#3498db", "Amethyst": "#9b59b6", "Red": "#e74c3c", "Sunflower": "#f1c40f", "Emerald": "#2ecc71", "Orange": "#e67e22", "Light Gray": "#ecf0f1", "Dark Slate": "#34495e", "Pink": "#fd79a8", "Cyan": "#00cec9", "Deep Pink": "#e84393", "Pumpkin": "#d35400", "Concrete": "#7f8c8d", "Mint Green": "#26de81", "Lavender": "#a29bfe", "Coral Pink": "#ff7979", "Steel Gray": "#535c68", "Ocean Blue": "#01a3a4" },
        TIME_FORMATS: { "24h dd.MM.yyyy": {}, "24h dd MMM yyyy": {}, "12h dd.MM.yyyy": {}, "24h MM.dd.yyyy": {}, "24h MMM dd yyyy": {}, "12h MM.dd.yyyy": {}, "24h yyyy.MM.dd": {}, "24h yyyy MMM dd": {}, "12h yyyy.MM.dd": {}, "24h Time Only": { time: "HH:mm:ss" } },
        DATE_FORMATS: {
			// Standard formats
			"dd.MM.yyyy": {},
			"dd MMM yyyy": {},
			"MM.dd.yyyy": {},
			"MMM dd yyyy": {},
			"yyyy.MM.dd": {},
			"yyyy MMM dd": {},
			// Formats with short day name
			"DDD, dd.MM.yyyy": {},
			"DDD, dd MMM yyyy": {},
			"DDD, MM.dd.yyyy": {},
			"DDD, MMM dd yyyy": {},
			// Formats with long day name
			"DDDD, dd.MM.yyyy": {},
			"DDDD, dd MMM yyyy": {},
			"DDDD, MM.dd.yyyy": {},
			"DDDD, MMM dd yyyy": {}
		},
    };

    /**
     * Manages settings persistence using localStorage in a single object.
     */
    class SettingsManager {
        constructor() {
            this.storageKey = 'sc-settings';
            this._settings = this._loadSettings();
        }

        _loadSettings() {
            const storedSettings = localStorage.getItem(this.storageKey);
            if (storedSettings) {
                try {
                    return JSON.parse(storedSettings);
                } catch (e) {
                    console.error("Simple Clock: Could not read settings. Resetting.", e);
                    return {};
                }
            }
            return {};
        }

        _saveSettings() {
            try {
                localStorage.setItem(this.storageKey, JSON.stringify(this._settings));
            } catch (e) {
                console.error("Simple Clock: Could not save settings.", e);
            }
        }

        get(key, defaultValue) {
            return this._settings[key] !== undefined ? this._settings[key] : defaultValue;
        }

        set(key, value) {
            this._settings[key] = value;
            this._saveSettings();
        }
    }

    /**
     * Manages time synchronization with the server.
     */
    class TimeService {
        constructor() {
            this.serverTime = new Date();
            this.lastSync = Date.now();
            this.syncStatus = 'unknown';
            this.serverTimezone = CONFIG.FORCE_TIMEZONE || "Etc/GMT+0";
            this.timeServerUrl = this._resolveTimeServerUrl();
        }

        _resolveTimeServerUrl() {
            if (CONFIG.API_SERVER_ADDRESS.trim() !== "") {
                const protocol = window.location.protocol === 'https' ? 'https' : 'http';
                return `${protocol}://${CONFIG.API_SERVER_ADDRESS}`;
            }
            return `${window.location.origin}/simpleclock_utc_time`;
        }

        async fetchServerTime() {
            try {
                const data = await $.getJSON(this.timeServerUrl, { _: new Date().getTime() });
                const timeStr = data[CONFIG.TIME_SERVER_RESPONSE_KEY];
                if (timeStr && !isNaN(new Date(timeStr).getTime())) {
                    this.serverTime = new Date(timeStr);
                    if (CONFIG.FORCE_TIMEZONE.trim() === "" && data.timezone) {
                        this.serverTimezone = data.timezone;
                    }
                    this.lastSync = Date.now();
                    this.syncStatus = 'server';
                } else {
                    throw new Error("Invalid time response format");
                }
            } catch (error) {
                console.error("Simple Clock: Could not sync with server, falling back to client time.", error);
                this.serverTime = new Date();
                this.lastSync = Date.now();
                this.syncStatus = 'client';
            }
        }

        getCurrentTime() {
            return new Date(this.serverTime.getTime() + (Date.now() - this.lastSync));
        }
    }

    /**
     * Manages the settings modal.
     */
    class Modal {
    constructor(id, title) {
        this.id = id;
        this.title = title;
        this.modalOverlay = null;
        this._injectStyles();
        this._createModalFrame();
    }

    _injectStyles() {
        const styleId = `${this.id}-styles`;
        if (document.getElementById(styleId)) return;
        const css = `
            #${this.id}-overlay {
                display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.7); z-index: 9999;
            }
			#${this.id}-overlay .sc-modal-content {
				position: absolute;
				top: 100px;
				left: 50%;
				transform: translateX(-50%); 
				background: var(--color-1, #121010);
				color: var(--color-3, #FFF);
				border: 1px solid var(--color-2, #333);
				border-radius: 8px;
				width: 340px; 
				height: 520px; 
				display: flex;
				flex-direction: column;
				overflow: hidden;
				box-shadow: 0 5px 20px rgba(0,0,0,0.4);
				font-size: calc(1rem * 0.7);
			}
            #${this.id}-overlay .sc-header {
                background: var(--color-2, #2A2A2A);
                padding: 10px 15px;
                border-bottom: 1px solid var(--color-2, #333);
                position: relative;
            }
            #${this.id}-overlay h2 {
                color: var(--color-4, #FFF); font-size: 1.5em; margin: 0;
            }
            #${this.id}-overlay .sc-header a {
                color: var(--color-4, #FFF); opacity: 0.6; text-decoration: none; font-size: 0.9em; margin-top: 4px;
            }
            #${this.id}-overlay .sc-header a:hover { opacity: 1; }

			#${this.id}-overlay .sc-scrollable-area {
				flex: 1; /* NY: Tvinger dette elementet til å fylle resten av høyden */
				overflow-y: auto; /* Beholder scroll hvis innholdet er for stort */
				padding: 15px 25px 25px;
			}
            #${this.id}-overlay label {
                display: block; margin-top: 1.5em; margin-bottom: 0.6em;
                font-weight: bold; color: var(--color-4, #E6C269);
                text-transform: uppercase; font-size: 0.9em;
            }
            #${this.id}-overlay select {
                width: 100%; padding: 0.8em;
                background: var(--color-2, #333); color: var(--color-5, #FFF);
                border: 1px solid var(--color-1, #444); border-radius: 10px; font-size: 1em;
            }
            #${this.id}-overlay hr {
                border: none; border-top: 1px solid var(--color-2, #444); opacity: 0.8; margin: 2em 0;
            }
            #${this.id}-overlay .sc-close-button {
                position: absolute; top: 15px; right: 15px;
                background: var(--color-3, rgba(255,255,255,0.1));
                color: var(--color-5, #FFF);
                border: none; cursor: pointer; border-radius: 50%;
                width: 30px; height: 30px; font-size: 1.8em; line-height: 30px;
                padding: 0; display: flex; align-items: center; justify-content: center;
                transition: background-color 0.2s, transform 0.2s;
            }
            #${this.id}-overlay .sc-close-button:hover {
                background: var(--color-4, #E6C269);
                color: var(--color-1, #111);
                transform: rotate(90deg);
            }
            /* Styling for Sliders (fra visualeq) */
            .sc-range-slider {
                -webkit-appearance: none; appearance: none;
                width: 100%; height: 14px;
                background: var(--color-2, #555);
                border-radius: 7px; outline: none; padding: 0; margin-top: 0.6em;
            }
            .sc-range-slider::-webkit-slider-thumb {
                -webkit-appearance: none; appearance: none;
                width: 28px; height: 28px;
                background-color: var(--color-4, #E6C269);
                background-image: none !important;
                border-radius: 50%; cursor: pointer;
                border: 3px solid var(--color-1, #111);
                transition: transform 0.2s ease;
            }
            .sc-range-slider::-moz-range-thumb {
                width: 28px; height: 28px;
                background-color: var(--color-4, #E6C269);
                background-image: none !important;
                border-radius: 50%; cursor: pointer;
                border: 3px solid var(--color-1, #111);
                transition: transform 0.2s ease;
            }
            .sc-range-slider:hover::-webkit-slider-thumb { transform: scale(1.1); }
            .sc-range-slider:hover::-moz-range-thumb { transform: scale(1.1); }

            .sc-checkbox-container {
				display: flex;
				align-items: center;
				justify-content: space-between;
				height:45px;
				margin: 1.5em auto 0; 
				padding: 0.8em;
				background-color: var(--color-2, #2A2A2A);
				border-radius: 10px; 
				border: 1px solid var(--color-1, #444);
			}
            .sc-checkbox-container label {
                color: var(--color-5, #E6C269); text-transform: uppercase;
                font-size: 0.9em; margin: 0;
            }
            .sc-switch { position: relative; display: inline-block; width: 44px; height: 24px; }
            .sc-switch input { display: none; }
            .sc-switch .sc-slider {
                position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
                background-color: var(--color-1, #ccc);
                transition: .4s; border-radius: 24px;
            }
            .sc-switch .sc-slider:before {
                position: absolute; content: "";
                height: 18px; width: 18px; left: 3px; bottom: 3px;
                background-color: white; transition: .4s; border-radius: 50%;
            }
            input:checked + .sc-slider { background-color: var(--color-4, #2196F3); }
            input:checked + .sc-slider:before { transform: translateX(20px); }
        `;
        $('<style>').prop('type', 'text/css').attr('id', styleId).html(css).appendTo('head');
    }

    _createModalFrame() {
        const overlayId = `${this.id}-overlay`;
        if (document.getElementById(overlayId)) return;
        const modalHtml = `
            <div id="${overlayId}">
                <div class="sc-modal-content">
                    <div class="sc-header">
                        <div>
                            <h2>${this.title}</h2>
                            <a id="sc-version-info" href="${CONFIG.GITHUB_URL}" target="_blank">Simple Clock v${CONFIG.PLUGIN_VERSION}</a>
                        </div>
                        <button class="sc-close-button">&times;</button>
                    </div>
                    <div class="sc-scrollable-area"></div>
                </div>
            </div>`;
        $('body').append(modalHtml);
        this.modalOverlay = $(`#${overlayId}`);
        this.modalOverlay.on('click', (e) => { if (e.target === this.modalOverlay[0]) this.close(); });
        this.modalOverlay.find('.sc-close-button').on('click', () => this.close());
    }

    open() {
        this.modalOverlay.css('display', 'block');
        this.modalOverlay.find('.sc-range-slider').each((_, slider) => this._updateSliderFill(slider));
    }
    close() { this.modalOverlay.css('display', 'none'); }

    updateContent(html) {
        this.modalOverlay.find('.sc-scrollable-area').html(html);
        this.modalOverlay.find('.sc-range-slider').each((_, slider) => this._updateSliderFill(slider));
    }

    _updateSliderFill(slider) {
        const min = parseFloat(slider.min);
        const max = parseFloat(slider.max);
        const val = parseFloat(slider.value);
        const percentage = (val - min) * 100 / (max - min);
        const color1 = getComputedStyle(document.documentElement).getPropertyValue('--color-4').trim() || '#E6C269';
        const color2 = getComputedStyle(document.documentElement).getPropertyValue('--color-2').trim() || '#333';
        slider.style.background = `linear-gradient(to right, ${color1} ${percentage}%, ${color2} ${percentage}%)`;
    }
}

    /**
     * Base class for all clock types.
     */
    class BaseClock {
        constructor(settingsManager) {
            this.settings = settingsManager;
            this.id = '';
            this.wrapper = null;
            this.previousTimeString = '';
            this.config = { minZoom: 0, maxZoom: 4 };
        }

        init() {
            const panelContainer = $(".dashboard-panel .panel-100-real .dashboard-panel-plugin-content");
            this.wrapper = $('<div id="sc-plugin-wrapper" style="display: flex; align-items: center; justify-content: center; height: 50px;"></div>');
            this.wrapper.html(this._getHTML());
            
            if (CONFIG.PLUGIN_POSITION === "before") panelContainer.before(this.wrapper);
            else panelContainer.after(this.wrapper);

            this.element = document.getElementById(this.id);
            
            this.applyStyles();
            this.updateSize();
        }

        destroy() {
            this.wrapper.remove();
        }

        _showZoomText(text) {
            const clock = $(this.element);
            if (!clock.length) return;
            const offset = clock.offset();
            $('<div>').text(text).css({
                position: 'absolute', top: `${offset.top - 28}px`, left: `${offset.left + clock.outerWidth() / 2}px`,
                transform: 'translateX(-50%)', backgroundColor: 'var(--color-2)', border: '2px solid var(--color-3)',
                color: 'white', padding: '4px 10px', borderRadius: '10px', fontSize: '12px', zIndex: 9999,
                opacity: 0, whiteSpace: 'nowrap'
            }).appendTo('body').animate({ opacity: 1 }, 150).delay(800).fadeOut(300, function() { $(this).remove(); });
        }
        
        _formatDate(now, format, useUTC) {
            const dateOptions = {
                day: '2-digit',
                month: format.includes('MMM') ? 'short' : '2-digit',
                year: 'numeric',
                timeZone: useUTC ? "UTC" : this.settings.get('serverTimezone', 'UTC')
            };

            if (format.includes('DDD')) {
                dateOptions.weekday = format.includes('DDDD') ? 'long' : 'short';
            }

            const p = new Intl.DateTimeFormat('en-US', dateOptions).formatToParts(now).reduce((acc, part) => ({...acc, [part.type]: part.value }), {});

            let dateString = format;
            dateString = dateString.replace('DDDD', p.weekday); 
            dateString = dateString.replace('DDD', p.weekday); 
            dateString = dateString.replace('dd', p.day);
            dateString = dateString.replace('MMM', p.month);
            dateString = dateString.replace('MM', p.month); 
            dateString = dateString.replace('yyyy', p.year);

            return dateString;
        }

        applyStyles() { /* Implemented by subclasses */ }
        update(now, useUTC, syncStatus) { /* Implemented by subclasses */ }
        updateSize() { /* Implemented by subclasses */ }
        getSettingsHTML() { return ''; }
        applySettingsFromModal() { /* Implemented by subclasses */ }

        _getThemeSettingsHTML(settingKey) {
            const currentColorName = this.settings.get(settingKey, CONFIG.DEFAULT_COLOR_NAME);
            const currentColorValue = PRESETS.COLORS[currentColorName];
            return `<div><label for="sc-modal-theme-select">Theme</label><select id="sc-modal-theme-select">${Object.keys(PRESETS.COLORS).map(name => `<option value="${PRESETS.COLORS[name]}" ${currentColorValue === PRESETS.COLORS[name] ? 'selected' : ''}>${name}</option>`).join('')}</select></div>`;
        }

        _getFontSettingsHTML() {
            const currentFont = this.settings.get('fontIndex', CONFIG.DEFAULT_FONT_INDEX);
            return `<div><label for="sc-modal-font-select">Font</label><select id="sc-modal-font-select">${PRESETS.FONTS.map((f, i) => `<option value="${i}" ${currentFont === i ? 'selected' : ''}>${f === 'standard' ? 'Standard' : `Font ${i+1}`}</option>`).join('')}</select></div>`;
        }

        _getDateFormatSettingsHTML(settingKey) {
            const currentFormat = this.settings.get(settingKey, 'dd.MM.yyyy');
            const formatOptions = Object.keys(PRESETS.DATE_FORMATS).map(f => `<option value="${f}" ${currentFormat === f ? 'selected' : ''}>${f}</option>`).join('');
            return `<div><label for="sc-modal-date-format-select">Date Format</label><select id="sc-modal-date-format-select">${formatOptions}</select></div>`;
        }

        _getShowSecondsHTML(settingKey, labelText = "Show Seconds") {
            const isChecked = this.settings.get(settingKey, false);
            const checkboxId = `sc-${settingKey}-checkbox`;
            return `
                <div class="sc-checkbox-container">
                    <label>${labelText}</label>
                    <label class="sc-switch">
                        <input type="checkbox" id="${checkboxId}" ${isChecked ? 'checked' : ''}>
                        <span class="sc-slider"></span>
                    </label>
                </div>
            `;
        }
        
        _getZoomSliderHTML(settingKey) {
            const currentZoom = this.settings.get(settingKey, 0); 
            return `<div>
                        <label for="sc-zoom-slider">Zoom <span>(${currentZoom})</span></label>
                        <input type="range" id="sc-zoom-slider" class="sc-range-slider"
                               min="${this.config.minZoom}"
                               max="${this.config.maxZoom}"
                               value="${currentZoom}">
                    </div>`;
        }
    }

    class DigitalClock extends BaseClock {
        constructor(settingsManager) {
            super(settingsManager);
            this.id = 'sc-digital-clock-widget';
            this.config = { minZoom: 1, maxZoom: 8 };
            this.showSeconds = this.settings.get('digital-showSeconds', CONFIG.CLOCK_DEFAULTS.digital.showSeconds);
        }

        _getHTML() {
            return `
                <div id='${this.id}' class='flex-container flex-center hide-phone hover-brighten br-15' style='position: relative; height: 50px; padding: 0px; text-align: center; display: flex; flex-direction: column; gap: 2px !important; user-select: none;'>
                    ${CONFIG.HIDE_TIME_MODE_LABEL ? '' : `<span class='sc-clock-mode'></span>`}
                    <span class='sc-synk-status'></span>
                    <span class='sc-clock-am-pm'></span>
                    <span class='sc-clock-time'></span>
                    <span class='sc-clock-date'></span>
                    ${!CONFIG.HIDE_SETTINGS_BUTTON ? `<div class='sc-clock-controls'><span class='sc-settings-toggle'>⚙️</span></div>` : ''}
                </div>`;
        }
        
        applyStyles() {
            const fontIndex = this.settings.get('fontIndex', CONFIG.CLOCK_DEFAULTS.digital.fontIndex);
            const colorName = this.settings.get('digital-colorName', CONFIG.CLOCK_DEFAULTS.digital.colorName);
            const fontClass = PRESETS.FONTS[fontIndex];
            const colorValue = PRESETS.COLORS[colorName] === "auto" ? "var(--color-main-bright)" : PRESETS.COLORS[colorName];

            $(this.element).removeClass(PRESETS.FONTS.join(' ')).addClass(fontClass !== "standard" ? fontClass : "");
            ['.sc-clock-time', '.sc-clock-date', '.sc-clock-mode', '.sc-clock-am-pm', '.sc-synk-status'].forEach(sel => {
                $(this.element).find(sel).css("color", colorValue);
            });
        }

        update(now, useUTC, syncStatus) {
            const timeFormat = this.settings.get('timeFormat', CONFIG.CLOCK_DEFAULTS.digital.timeFormat);
            const is12Hour = timeFormat.includes('12h');
            
            const timeOptions = {
                hour: '2-digit', minute: '2-digit',
                second: this.showSeconds ? '2-digit' : undefined,
                timeZone: useUTC ? "UTC" : this.settings.get('serverTimezone', 'UTC'),
                hour12: is12Hour
            };

            let timeString = now.toLocaleTimeString(is12Hour ? 'en-US' : 'en-GB', timeOptions);
            let amPm = '';
            if (is12Hour) {
                [timeString, amPm] = timeString.split(' ');
            }

            const fullTimeString = timeString + (this.showSeconds ? now.getSeconds() : '');
            if (fullTimeString === this.previousTimeString) return;
            this.previousTimeString = fullTimeString;

            let dateString = '';
            if (!timeFormat.includes("Time Only")) {
                const dateFormat = timeFormat.replace(/^(24h|12h)\s/, '');
                dateString = this._formatDate(now, dateFormat, useUTC);
            }

            $(this.element).find('.sc-clock-time').text(timeString);
            $(this.element).find('.sc-clock-date').text(dateString);
            $(this.element).find('.sc-clock-mode').text(useUTC ? "UTC" : "").toggle(!CONFIG.HIDE_TIME_MODE_LABEL);
            $(this.element).find('.sc-synk-status').html(syncStatus === 'client' ? '⚠️' : '');
            $(this.element).find('.sc-clock-am-pm').text(amPm).toggle(is12Hour);
        }

        updateSize() {
            const scale = this.settings.get('digital-zoom', CONFIG.CLOCK_DEFAULTS.digital.zoom) - 1;
            
            const timeFontSize = Math.max(12, 16 + scale * 2.5);
            const dateFontSize = Math.max(9, 11 + scale * 1.5);

            const baseWidth = 65; 
            const widthPerZoom = this.showSeconds ? 8 : 6;
            const widgetWidth = baseWidth + scale * widthPerZoom;

            const labelTopPosition = 0 - (scale * 1.5);
            const syncTopPosition = labelTopPosition + 16;

            $(this.element).find('.sc-clock-time').css("font-size", `${timeFontSize}px`);
            $(this.element).find('.sc-clock-date').css("font-size", `${dateFontSize}px`);
            $(this.element).css("width", `${widgetWidth}px`);

            $(this.element).find('.sc-clock-mode, .sc-clock-am-pm').css("top", `${labelTopPosition}px`);
            $(this.element).find('.sc-synk-status').css("top", `${syncTopPosition}px`);
        }

        getSettingsHTML() {
            const currentFormat = this.settings.get('timeFormat', CONFIG.CLOCK_DEFAULTS.digital.timeFormat);
            const formatOptions = Object.keys(PRESETS.TIME_FORMATS).map(f => `<option value="${f}" ${currentFormat === f ? 'selected' : ''}>${f}</option>`).join('');
            
            return `
                <div><label for="sc-modal-format-select">Time/Date Format</label><select id="sc-modal-format-select">${formatOptions}</select></div>
                ${this._getThemeSettingsHTML('digital-colorName')}
                ${this._getFontSettingsHTML()}
                ${this._getShowSecondsHTML('digital-showSeconds')}
                <hr>
                ${this._getZoomSliderHTML('digital-zoom')}
            `;
        }

        applySettingsFromModal() {
            const newFormat = $('#sc-modal-format-select').val();
            if (this.settings.get('timeFormat', CONFIG.CLOCK_DEFAULTS.digital.timeFormat) !== newFormat) {
                this.settings.set('timeFormat', newFormat);
                this.previousTimeString = ''; 
            }

            const newColorValue = $('#sc-modal-theme-select').val();
            const newColorName = Object.keys(PRESETS.COLORS).find(name => PRESETS.COLORS[name] === newColorValue);
            this.settings.set('digital-colorName', newColorName);
            this.settings.set('fontIndex', parseInt($('#sc-modal-font-select').val(), 10));
            this.applyStyles(); 

            const newZoom = parseInt($('#sc-zoom-slider').val(), 10);
            if (this.settings.get('digital-zoom', CONFIG.CLOCK_DEFAULTS.digital.zoom) !== newZoom) {
                this.settings.set('digital-zoom', newZoom);
                this.updateSize(); 
				$('#sc-zoom-slider').parent().find('label span').text(`(${newZoom})`);
				this.modal._updateSliderFill(document.getElementById('sc-zoom-slider'));
            }

            const showSeconds = $('#sc-digital-showSeconds-checkbox').is(':checked');
            if (this.showSeconds !== showSeconds) {
                this.showSeconds = showSeconds;
                this.settings.set('digital-showSeconds', showSeconds);
                this.previousTimeString = ''; 
                this.updateSize(); 
            }
        }
    }

    class FlapClock extends BaseClock {
        constructor(settingsManager) {
            super(settingsManager);
            this.id = 'sc-flap-clock-widget';
            this.config = { minZoom: 1, maxZoom: 5 };
            this.showSeconds = this.settings.get('flap-showSeconds', CONFIG.CLOCK_DEFAULTS.flap.showSeconds);
            this.showDate = this.settings.get('flap-showDate', CONFIG.CLOCK_DEFAULTS.flap.showDate);
        }

        _getHTML() {
            let digitsHTML = '';
            for (let i = 0; i < 4; i++) {
                digitsHTML += `<div class="sc-flap-digit" data-value="0"><div class="sc-flap-static sc-flap-bottom"><span>0</span></div><div class="sc-flap-static sc-flap-top"><span>0</span></div><div class="sc-flap-flipper"><div class="sc-flap-flipper-face sc-flap-flipper-front"><span>0</span></div><div class="sc-flap-flipper-face sc-flap-flipper-back"><span>0</span></div></div></div>`;
            }

            let secondsHTML = '';
            if (this.showSeconds) {
                let secDigits = '';
                for (let i = 0; i < 2; i++) {
                    secDigits += `<div class="sc-flap-digit sc-flap-seconds" data-value="0"><div class="sc-flap-static sc-flap-bottom"><span>0</span></div><div class="sc-flap-static sc-flap-top"><span>0</span></div><div class="sc-flap-flipper"><div class="sc-flap-flipper-face sc-flap-flipper-front"><span>0</span></div><div class="sc-flap-flipper-face sc-flap-flipper-back"><span>0</span></div></div></div>`;
                }
                secondsHTML = `<div class="sc-flap-separator">:</div><div class="sc-flap-digit-group">${secDigits}</div>`;
            }

            return `
                <div id="${this.id}" class="hover-brighten">
                    ${CONFIG.HIDE_TIME_MODE_LABEL ? '' : `<span class='sc-flap-clock-mode'></span>`}
                    <div class="sc-flap-time">
                        <div class="sc-flap-digit-group">${digitsHTML.substring(0, digitsHTML.length/2)}</div>
                        <div class="sc-flap-separator">:</div>
                        <div class="sc-flap-digit-group">${digitsHTML.substring(digitsHTML.length/2)}</div>
                        ${secondsHTML}
                    </div>
                    <span class="sc-flap-date"></span>
                    ${!CONFIG.HIDE_SETTINGS_BUTTON ? `<div class='sc-clock-controls'><span class='sc-settings-toggle'>⚙️</span></div>` : ''}
                </div>`;
        }
        
        applyStyles() {
            const colorName = this.settings.get('flap-colorName', CONFIG.CLOCK_DEFAULTS.flap.colorName);
            const colorValue = PRESETS.COLORS[colorName] === "auto" ? "var(--color-main-bright)" : PRESETS.COLORS[colorName];
            $(this.element).find('span, .sc-flap-separator').css("color", colorValue);
        }

        update(now, useUTC) {
            const timeZone = useUTC ? "UTC" : this.settings.get('serverTimezone', 'UTC');
            const hours = now.toLocaleTimeString('en-GB', { hour: '2-digit', timeZone }).padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            
            let newTimeString = hours + minutes;
            if (this.showSeconds) {
                newTimeString += now.getSeconds().toString().padStart(2, '0');
            }

            if (newTimeString !== this.previousTimeString) {
                this.previousTimeString = newTimeString;

                for (let i = 0; i < newTimeString.length; i++) {
                    const digitElement = $(this.element).find(`.sc-flap-digit:eq(${i})`);
                    if (digitElement.attr('data-value') !== newTimeString[i]) {
                        this._flip(digitElement, newTimeString[i]);
                    }
                }
            }
            
            if (this.showDate) {
                const dateFormat = this.settings.get('flap-dateFormat', CONFIG.CLOCK_DEFAULTS.flap.dateFormat);
                const dateString = this._formatDate(now, dateFormat, useUTC);
                $(this.element).find('.sc-flap-date').text(dateString).show();
            } else {
                $(this.element).find('.sc-flap-date').hide();
            }

            $(this.element).find('.sc-flap-clock-mode').text(useUTC ? "UTC" : "").toggle(!CONFIG.HIDE_TIME_MODE_LABEL);
        }
        
        _flip(digitElement, newValue) {
            if (digitElement.hasClass('sc-flipping')) return;
            const currentValue = digitElement.attr('data-value');
            if (currentValue === newValue) return;

            const staticTop = digitElement.find('.sc-flap-top span');
            const staticBottom = digitElement.find('.sc-flap-bottom span');
            const flipperFront = digitElement.find('.sc-flap-flipper-front span');
            const flipperBack = digitElement.find('.sc-flap-flipper-back span');
            const flipper = digitElement.find('.sc-flap-flipper');

            flipperFront.text(currentValue);
            flipperBack.text(newValue);
            staticTop.text(newValue);
            digitElement.addClass('sc-flipping').attr('data-value', newValue);

            setTimeout(() => {
                staticBottom.text(newValue);
                flipperFront.text(newValue);
                flipper.css('transition', 'none');
                digitElement.removeClass('sc-flipping');
                flipper[0].offsetHeight;
                flipper.css('transition', '');
            }, 600);
        }

        updateSize() {
            const scale = this.settings.get('flap-zoom', CONFIG.CLOCK_DEFAULTS.flap.zoom) - 2;
            const digitWidth = 18 + scale * 4;
            const digitHeight = 30 + scale * 6;
            const fontSize = 24 + scale * 5;
            const dateFontSize = 10 + scale * 1.5;

            $(this.element).find('.sc-flap-digit').css({
                'width': `${digitWidth}px`,
                'height': `${digitHeight}px`,
                'font-size': `${fontSize}px`
            });
            $(this.element).find('.sc-flap-separator').css('font-size', `${fontSize}px`);
            $(this.element).find('.sc-flap-date').css('font-size', `${dateFontSize}px`);

            $(this.element).find('.sc-flap-digit span').css('line-height', `${digitHeight}px`);
        }

        getSettingsHTML() {
            return `
                ${this._getThemeSettingsHTML('flap-colorName')}
                ${this.showDate ? this._getDateFormatSettingsHTML('flap-dateFormat') : ''}
                ${this._getShowSecondsHTML('flap-showSeconds')}
                ${this._getShowSecondsHTML('flap-showDate', 'Show Date')}
                <hr>
                ${this._getZoomSliderHTML('flap-zoom')}
            `;
        }

        applySettingsFromModal() {
            const newColorValue = $('#sc-modal-theme-select').val();
            const newColorName = Object.keys(PRESETS.COLORS).find(name => PRESETS.COLORS[name] === newColorValue);
            this.settings.set('flap-colorName', newColorName);
            this.applyStyles();

            const newDateFormat = $('#sc-modal-date-format-select').val();
            if (newDateFormat && this.settings.get('flap-dateFormat', '') !== newDateFormat) {
                this.settings.set('flap-dateFormat', newDateFormat);
                this.previousTimeString = '';
            }

            const showSeconds = $('#sc-flap-showSeconds-checkbox').is(':checked');
            if (this.showSeconds !== showSeconds) {
                this.showSeconds = showSeconds;
                this.settings.set('flap-showSeconds', showSeconds);
                this.destroy();
                this.init();
                return;
            }
            
            const showDate = $('#sc-flap-showDate-checkbox').is(':checked');
            if (this.showDate !== showDate) {
                this.showDate = showDate;
                this.settings.set('flap-showDate', showDate);
                this.previousTimeString = '';
                this.modal.updateContent(this.getSettingsHTML());
            }
            
            const newZoom = parseInt($('#sc-zoom-slider').val(), 10);
            this.settings.set('flap-zoom', newZoom);
            this.updateSize();
			$('#sc-zoom-slider').parent().find('label span').text(`(${newZoom})`);
			this.modal._updateSliderFill(document.getElementById('sc-zoom-slider'));
        }
    }
    
    class NixieClock extends BaseClock {
        constructor(settingsManager) {
            super(settingsManager);
            this.id = 'sc-nixie-clock-widget';
            this.config = { minZoom: 1, maxZoom: 5 };
            this.showSeconds = this.settings.get('nixie-showSeconds', CONFIG.CLOCK_DEFAULTS.nixie.showSeconds);
            this.showDate = this.settings.get('nixie-showDate', CONFIG.CLOCK_DEFAULTS.nixie.showDate);
        }

        _getHTML() {
            let digitsHTML = '';
            for (let i = 0; i < 4; i++) {
                let digitSpans = '';
                for (let j = 0; j < 10; j++) digitSpans += `<span>${j}</span>`;
                digitsHTML += `<div class="sc-nixie-digit">${digitSpans}</div>`;
            }

            let secondsHTML = '';
            if (this.showSeconds) {
                let secDigits = '';
                for (let i = 0; i < 2; i++) {
                    let digitSpans = '';
                    for (let j = 0; j < 10; j++) digitSpans += `<span>${j}</span>`;
                    secDigits += `<div class="sc-nixie-digit">${digitSpans}</div>`;
                }
                secondsHTML = `<div class="sc-nixie-separator">:</div><div class="sc-nixie-digit-group">${secDigits}</div>`;
            }

            return `
                <div id="${this.id}" class="hover-brighten">
                    ${CONFIG.HIDE_TIME_MODE_LABEL ? '' : `<span class='sc-nixie-clock-mode'></span>`}
                    <div class="sc-nixie-time">
                        <div class="sc-nixie-digit-group">${digitsHTML.substring(0, digitsHTML.length/2)}</div>
                        <div class="sc-nixie-separator">:</div>
                        <div class="sc-nixie-digit-group">${digitsHTML.substring(digitsHTML.length/2)}</div>
                        ${secondsHTML}
                    </div>
                    <span class="sc-nixie-date" style="display: none;"></span>
                    ${!CONFIG.HIDE_SETTINGS_BUTTON ? `<div class='sc-clock-controls'><span class='sc-settings-toggle'>⚙️</span></div>` : ''}
                </div>`;
        }

        update(now, useUTC) {
            const timeZone = useUTC ? "UTC" : this.settings.get('serverTimezone', 'UTC');
            const hours = now.toLocaleTimeString('en-GB', { hour: '2-digit', timeZone }).padStart(2, '0');
            const minutes = now.getMinutes().toString().padStart(2, '0');
            
            let newTimeString = hours + minutes;
            if (this.showSeconds) {
                newTimeString += now.getSeconds().toString().padStart(2, '0');
            }

            if (newTimeString !== this.previousTimeString) {
                this.previousTimeString = newTimeString;
                for (let i = 0; i < newTimeString.length; i++) {
                    const digitContainer = $(this.element).find(`.sc-nixie-digit:eq(${i})`);
                    const newDigit = newTimeString[i];
                    digitContainer.find('span.sc-nixie-active').removeClass('sc-nixie-active');
                    digitContainer.find('span').filter((_, el) => $(el).text() === newDigit).addClass('sc-nixie-active');
                }
            }
            
            if (this.showDate) {
                const dateFormat = this.settings.get('nixie-dateFormat', CONFIG.CLOCK_DEFAULTS.nixie.dateFormat);
                const dateString = this._formatDate(now, dateFormat, useUTC);
                $(this.element).find('.sc-nixie-date').text(dateString);
            }

            $(this.element).find('.sc-nixie-clock-mode').text(useUTC ? "UTC" : "").toggle(!CONFIG.HIDE_TIME_MODE_LABEL);
			this._adjustContainerWidth();
        }

        updateSize() {
            const scale = this.settings.get('nixie-zoom', CONFIG.CLOCK_DEFAULTS.nixie.zoom) - 2;
            const fontSize = 32 + scale * 6;
            $(this.element).find('.sc-nixie-digit, .sc-nixie-separator').css({ 'font-size': `${fontSize}px` });

            const dateElement = $(this.element).find('.sc-nixie-date');
            if (this.showDate && (scale === -1 || scale === 0)) {
                dateElement.show();
            } else {
                dateElement.hide();
            }
			
			this._adjustContainerWidth();
        }
        
		_adjustContainerWidth() {
            setTimeout(() => {
                const timeElement = $(this.element).find('.sc-nixie-time');
                const dateElement = $(this.element).find('.sc-nixie-date');

                if (!timeElement.length) return; 

                const timeWidth = timeElement.outerWidth();
                let dateWidth = 0;

                if (dateElement.is(':visible')) {
                    dateWidth = dateElement.outerWidth();
                }

                const requiredWidth = Math.max(timeWidth, dateWidth);

                $(this.element).css('width', `${requiredWidth}px`);
            }, 0);
        }

        getSettingsHTML() {
            return `
                ${this.showDate ? this._getDateFormatSettingsHTML('nixie-dateFormat') : ''}
                ${this._getShowSecondsHTML('nixie-showSeconds')}
                ${this._getShowSecondsHTML('nixie-showDate', 'Show Date (at zoom 1-2)')}
                <hr>
                ${this._getZoomSliderHTML('nixie-zoom')}
            `;
        }

        applySettingsFromModal() {
            const newDateFormat = $('#sc-modal-date-format-select').val();
            if (newDateFormat && this.settings.get('nixie-dateFormat', '') !== newDateFormat) {
                this.settings.set('nixie-dateFormat', newDateFormat);
                this.previousTimeString = ''; 
            }

            const showSeconds = $('#sc-nixie-showSeconds-checkbox').is(':checked');
            if (this.showSeconds !== showSeconds) {
                this.showSeconds = showSeconds;
                this.settings.set('nixie-showSeconds', showSeconds);
                this.destroy();
                this.init();
                return; 
            }

            const showDate = $('#sc-nixie-showDate-checkbox').is(':checked');
            if (this.showDate !== showDate) {
                this.showDate = showDate;
                this.settings.set('nixie-showDate', showDate);
                this.previousTimeString = '';
				this.updateSize();
                this.modal.updateContent(this.getSettingsHTML());
            }

            const newZoom = parseInt($('#sc-zoom-slider').val(), 10);
            this.settings.set('nixie-zoom', newZoom);
            this.updateSize();
			$('#sc-zoom-slider').parent().find('label span').text(`(${newZoom})`);
			this.modal._updateSliderFill(document.getElementById('sc-zoom-slider'))
        }
    }

    /**
     * Manages the active clock and switching between different clock types.
     */
    class ClockManager {
        constructor(settingsManager) {
            this.settings = settingsManager;
            this.clockTypes = {
                'Digital Clock': DigitalClock,
                'Flap Clock': FlapClock,
                'Nixie Tube Clock': NixieClock
            };
            this.activeClock = null;
            this.activeClockType = this.settings.get('clockMode', CONFIG.DEFAULT_CLOCK_MODE);
            
            if (!this.clockTypes[this.activeClockType]) {
                this.activeClockType = CONFIG.DEFAULT_CLOCK_MODE;
            }
        }

        init() {
            this.activeClock = new this.clockTypes[this.activeClockType](this.settings);
            this.activeClock.init();
        }

        update(now, useUTC, syncStatus) {
            if (this.activeClock) {
                this.activeClock.update(now, useUTC, syncStatus);
            }
        }

        switchClock(newType) {
            if (!this.clockTypes[newType] || newType === this.activeClockType) return;
            
            if (this.activeClock) this.activeClock.destroy();
            
            this.activeClockType = newType;
            this.settings.set('clockMode', newType);
            
            this.activeClock = new this.clockTypes[newType](this.settings);
            this.activeClock.init();
        }
        
        getSettingsHTML() {
            const clockOptions = Object.keys(this.clockTypes).map(name =>
                `<option value="${name}" ${this.activeClockType === name ? 'selected' : ''}>${name}</option>`
            ).join('');

            return `
                <div><label for="sc-modal-mode-select">Clock Type</label>
                <select id="sc-modal-mode-select">${clockOptions}</select></div>
                <div id="sc-clock-specific-settings">
                    ${this.activeClock.getSettingsHTML()}
                </div>
            `;
        }

        applySettingsFromModal() {
            if (this.activeClock) {
                this.activeClock.applySettingsFromModal();
            }
        }
    }

    /**
     * Main plugin class, orchestrates everything.
     */
    class SimpleClockPlugin {
        constructor() {
            this.settings = new SettingsManager();
            this.timeService = new TimeService();
            this.clockManager = new ClockManager(this.settings);
            this.modal = new Modal('simple-clock-modal', 'Clock Settings');
            this.tooltip = null;
            this.tooltipVisible = false;
            this.lastTooltipText = '';
            
            this.useUTC = this._resolveInitialTimeMode();
        }

		_addHideClockCheckbox() {
            const imperialUnitsCheckbox = document.getElementById("imperial-units");
            if (!imperialUnitsCheckbox) {
                console.warn("Simple Clock: Could not find 'Imperial units' checkbox. The 'Hide Clock' button will not be added.");
                return;
            }

            if (document.getElementById("sc-hide-clock-checkbox")) return;

            const id = "sc-hide-clock-checkbox";
            const label = "Hide Simple Clock";
            const isChecked = this.settings.get('isClockHidden', false);

            const wrapper = document.createElement("div");
            wrapper.className = "form-group";
            wrapper.innerHTML = `
                <div class="switch flex-container flex-phone flex-phone-column flex-phone-center">
                    <input type="checkbox" tabindex="0" id="${id}" aria-label="${label}" ${isChecked ? 'checked' : ''} />
                    <label for="${id}"></label>
                    <span class="text-smaller text-uppercase text-bold color-4 p-10">${label.toUpperCase()}</span>
                </div>
            `;

            imperialUnitsCheckbox.closest('.form-group').insertAdjacentElement("afterend", wrapper);

            document.getElementById(id).addEventListener("change", (e) => {
                this.settings.set('isClockHidden', e.target.checked);
                this._toggleClockVisibility();
            });
        }

		_toggleClockVisibility() {
            const isHidden = this.settings.get('isClockHidden', false);
            const clockWrapper = $('#sc-plugin-wrapper'); 

            if (isHidden) {
                clockWrapper.hide();
            } else {
                clockWrapper.show();
            }
        }
        
        _resolveInitialTimeMode() {
            if (CONFIG.DISPLAY_MODE === 'utc') return true;
            if (CONFIG.DISPLAY_MODE === 'local') return false;
            return this.settings.get('useUTC', true);
        }

        init() {
            this._injectGlobalStyles();
            this.clockManager.init();
            this._createTooltip();
            this._attachEventListeners();
            
            setInterval(() => this.update(), 200);
            
            this.timeService.fetchServerTime().then(() => {
                this.settings.set('serverTimezone', this.timeService.serverTimezone);
                this._startTooltipRotation();
            });
            setInterval(() => this.timeService.fetchServerTime(), 5 * 60 * 1000);
            
            this._checkForUpdates();
			setTimeout(() => this._addHideClockCheckbox(), 500);
            this._toggleClockVisibility();
        }

        update() {
            const now = this.timeService.getCurrentTime();
            this.clockManager.update(now, this.useUTC, this.timeService.syncStatus);
            this._refreshTooltip();
        }

        _compareVersions(v1, v2) {
            const parts1 = v1.replace('v', '').split('.').map(Number);
            const parts2 = v2.replace('v', '').split('.').map(Number);
            const len = Math.max(parts1.length, parts2.length);

            for (let i = 0; i < len; i++) {
                const p1 = parts1[i] || 0;
                const p2 = parts2[i] || 0;
                if (p1 > p2) return 1;
                if (p1 < p2) return -1;
            }
            return 0;
        }

        async _checkForUpdates() {
            try {
                const FILENAME_ON_GITHUB = 'Plugins/Simple_Clock.js';
                
                const match = CONFIG.GITHUB_URL.match(/github\.com\/([^\/]+)\/([^\/]+)/);
                if (!match) {
                    console.error('Simple Clock: Could not parse GITHUB_URL for version check.');
                    return;
                }

                const owner = match[1];
                const repo = match[2];
                const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${FILENAME_ON_GITHUB}?ref=main`;

                const response = await fetch(apiUrl, {
                    headers: { 'Accept': 'application/vnd.github.v3.raw' }
                });
                
                if (!response.ok) {
                    console.error(`Simple Clock: GitHub API call failed. Status: ${response.status} ${response.statusText}`);
                    return;
                }

                const scriptContent = await response.text();
                
                const versionRegex = /version:\s*['"]([\d\.]+)['"]/;

                const versionMatch = scriptContent.match(versionRegex);

                if (versionMatch && versionMatch[1]) {
                    const latestVersion = versionMatch[1];

                    if (this._compareVersions(latestVersion, CONFIG.PLUGIN_VERSION) > 0) {
                        const versionElement = $('#sc-version-info');
                        if (versionElement.length && !versionElement.text().includes('New version')) {
                            versionElement.append(` <span style="color: var(--color-4, #ffcc00); opacity: 0.8;">(New version available: v${latestVersion})</span>`);
                        }
                    } else {
                        console.log("Simple Clock: You have the latest version.");
                    }
                } else {
                    console.warn("Simple Clock: Could not find version number ('version: ...') in the file from GitHub.");
                }
            } catch (error) {
                console.error('Simple Clock: An error occurred during the version check.', error);
            }
        }

        _injectGlobalStyles() {
            const css = `
                /* --- Common Styles --- */
                #sc-plugin-wrapper .sc-clock-controls { display: none; position: absolute; top: -15px; left: -10px; z-index: 20; }
                #sc-plugin-wrapper .sc-settings-toggle { cursor: pointer; font-size: 1.2em; }
                /* --- Digital Clock Specific Styles --- */
                #sc-digital-clock-widget .sc-clock-mode, #sc-digital-clock-widget .sc-clock-am-pm, #sc-digital-clock-widget .sc-synk-status { position: absolute; font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 5px; }
                #sc-digital-clock-widget .sc-clock-mode { right: -5px; transform: none; }
                #sc-digital-clock-widget .sc-synk-status { right: -12px; font-size: 6px; }
                #sc-digital-clock-widget .sc-clock-am-pm { left: -5px; transform: none; }
                #sc-digital-clock-widget .sc-clock-time { font-weight: bold; line-height: 1; }
                #sc-digital-clock-widget .sc-clock-date { line-height: 0.7; white-space: nowrap; }
                /* --- Font Styles --- */
                @font-face { font-family: 'SCFont1'; src: url('/SC-FONTS/font1.ttf') format('truetype'); } @font-face { font-family: 'SCFont2'; src: url('/SC-FONTS/font2.ttf') format('truetype'); } @font-face { font-family: 'SCFont3'; src: url('/SC-FONTS/font3.ttf') format('truetype'); } @font-face { font-family: 'SCFont4'; src: url('/SC-FONTS/font4.ttf') format('truetype'); }
                .sc-font1 { font-family: 'SCFont1'; } .sc-font2 { font-family: 'SCFont2', serif; } .sc-font3 { font-family: 'SCFont3', cursive; } .sc-font4 { font-family: 'SCFont4'; }
                /* --- Flap Clock Styles --- */
                #sc-flap-clock-widget { display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; user-select: none; } .sc-flap-clock-mode { font-size: 9px; font-weight: bold; padding: 2px 6px; border-radius: 5px; position: absolute; top: -10px; } .sc-flap-time { display: flex; gap: 4px; align-items: center; } .sc-flap-digit-group { display: flex; gap: 2px; } .sc-flap-digit { position: relative; perspective: 400px; box-shadow: 0 3px 10px rgba(0,0,0,0.3); border-radius: 4px; } .sc-flap-static, .sc-flap-flipper-face { position: absolute; left: 0; width: 100%; height: 50%; overflow: hidden; background-color: var(--color-2, #2A2A2A); border-radius: 4px; display: flex; justify-content: center; box-sizing: border-box; } .sc-flap-flipper-face { height: 100%; } .sc-flap-top, .sc-flap-flipper-front { top: 0; align-items: flex-start; box-shadow: inset 0 1px 0px rgba(255,255,255,0.1); border-bottom: 1px solid rgba(0,0,0,0.5); } .sc-flap-bottom, .sc-flap-flipper-back { bottom: 0; align-items: flex-end; box-shadow: inset 0 1px 1px rgba(0,0,0,0.4); } .sc-flap-top span, .sc-flap-flipper-front span {} .sc-flap-bottom span, .sc-flap-flipper-back span {} .sc-flap-static { z-index: 1; } .sc-flap-flipper { position: absolute; top: 0; left: 0; width: 100%; height: 50%; transform-origin: bottom; transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(0.4, 0.0, 0.2, 1); z-index: 10; } .sc-flipping .sc-flap-flipper { transform: rotateX(-180deg); } .sc-flap-flipper-face { position: absolute; backface-visibility: hidden; } .sc-flap-flipper-back { transform: rotateX(180deg); } .sc-flap-separator { font-weight: bold; padding: 0 2px; } .sc-flap-date { position: absolute; bottom: -13px; left: 50%; transform: translateX(-50%); width: 100%; text-align: center; white-space: nowrap; font-weight: bold; }
                /* --- Nixie Tube Clock Styles --- */
                #sc-nixie-clock-widget { font-family: 'Nixie One', cursive; font-weight: 400; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; }
                .sc-nixie-time { display: flex; gap: 0.25em; align-items: center; justify-content: center; } 
                .sc-nixie-digit-group { display: flex; gap: 0.3em; } 
                .sc-nixie-separator { color: #ff8a00; text-shadow: 0 0 5px #ff8a00, 0 0 10px #ffc900; animation: sc-nixie-flicker 1.5s infinite alternate; margin-top: -0.2em; } 
                .sc-nixie-digit { position: relative; display: flex; align-items: center; justify-content: center; width: 0.6em; height: 1.0em; } 
                .sc-nixie-digit::before { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #1a1a1a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 0.5em; box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.5), 0 1px 1px rgba(255,255,255,0.05); z-index: 1; } 
                .sc-nixie-digit::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%; background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHBhdGggZD0iTS0xIDFoMTFNLTEgM2gxMU0tMSA1aDExTS0xIDdoMTFNLTEgOWgxMSIgc3Ryb2tlPSJyZ2JhKDAsMCwwLDAuMikiIHN0cm9rZS13aWR0aD0iMC41Ij48L3BhdGg+PHBhdGggZD0iTTUgLTV2MjBNNyAtNXYyME05IC01djIwTTEgLTV2MjBNMyAtNXYyMCIgc3Ryb2tlPSJyZ2JhKDAsMCwwLDAuMikiIHN0cm9rZS13aWR0aD0iMC41Ij48L3BhdGg+PC9zdmc+'); opacity: 0.8; z-index: 15; pointer-events: none; } 
                .sc-nixie-digit span { position: absolute; color: #443; text-shadow: none; opacity: 0.2; transition: all 0.2s ease-in-out; z-index: 2; pointer-events: none; } 
                .sc-nixie-digit span.sc-nixie-active { color: #ff9f1a; opacity: 1; text-shadow: 0 0 2px #ff9f1a, 0 0 6px #ff9f1a, 0 0 12px #ff6a00, 0 0 20px #ff6a00, 0 0 30px #ff4d00; animation: sc-nixie-flicker-dyn 2s infinite; z-index: 10; } 
                @keyframes sc-nixie-flicker { 0%, 18%, 22%, 25%, 53%, 57%, 100% { opacity: 1; } 20%, 24%, 55% { opacity: 0.95; } }
                .sc-nixie-clock-mode { position: absolute; top: -10px; left: 50%; transform: translateX(-50%); font-size: 10px; font-weight: bold; color: #ff9f1a; text-shadow: 0 0 1px #ff9f1a, 0 0 3px #ff9f1a, 0 0 6px #ff6a00; animation: sc-nixie-flicker-dyn 2s infinite; }
                .sc-nixie-date { margin-top: 1px; margin-bottom: -10px; white-space: nowrap; font-size: 13px; color: #ff9f1a; text-shadow: 0 0 1px #ff9f1a, 0 0 3px #ff6a00; animation: sc-nixie-flicker-dyn 2.5s infinite; }
            `;
            $('<style>').prop('type', 'text/css').html(css).appendTo('head');
            $('head').append('<link href="https://fonts.googleapis.com/css2?family=Nixie+One&display=swap" rel="stylesheet">');
            if (CONFIG.HIDE_CLOCK_ON_MOBILE) {
                $("<style>").prop("type", "text/css").html(`@media (max-width: 768px) { #sc-plugin-wrapper { display: none !important; } }`).appendTo("head");
            }
        }

        _createTooltip() {
            this.tooltip = $('<div id="sc-clock-tooltip"></div>').css({
                position: 'fixed', zIndex: 15, textAlign: 'center', backgroundColor: 'var(--color-2)',
                border: '2px solid var(--color-3)', color: 'var(--color-text)', fontSize: '14px',
                borderRadius: '15px', padding: '10px 20px', minWidth: '270px',
                whiteSpace: 'pre-line', pointerEvents: 'none', display: 'none'
            }).appendTo('body');
        }

        _attachEventListeners() {
            const doc = $(document);
            doc.on('click', '#sc-plugin-wrapper', e => {
                if ($(e.target).closest('.sc-settings-toggle').length === 0) {
                    this._toggleTimeMode();
                }
            });
            doc.on("mouseenter", "#sc-plugin-wrapper", () => {
                this.tooltipVisible = true;
                this.lastTooltipText = null;
                this._refreshTooltip();
                $('#sc-plugin-wrapper').find('.sc-clock-controls').fadeIn(150);
            });
            doc.on("mouseleave", "#sc-plugin-wrapper", () => {
                this.tooltipVisible = false;
                this.tooltip.hide();
                $('#sc-plugin-wrapper').find('.sc-clock-controls').fadeOut(150);
            });
            doc.on('click', '.sc-settings-toggle', () => this._openSettings());
            
            doc.on('change', '#sc-modal-mode-select', e => {
                this.clockManager.switchClock($(e.target).val());
                this.modal.updateContent(this.clockManager.getSettingsHTML());
            });

			doc.on('input', '#simple-clock-modal-overlay .sc-range-slider', e => {
				const slider = e.target;
				$(slider).parent().find('label span').text(`(${slider.value})`);
				this.modal._updateSliderFill(slider);
				this.clockManager.applySettingsFromModal();
			});

			doc.on('change', '#simple-clock-modal-overlay #sc-clock-specific-settings input, #simple-clock-modal-overlay #sc-clock-specific-settings select', () => {
				this.clockManager.applySettingsFromModal();
			});

            $(window).on('resize scroll', () => this._refreshTooltip());
        }

        _toggleTimeMode() {
            if (CONFIG.DISPLAY_MODE !== "auto") return;
            this.useUTC = !this.useUTC;
            this.settings.set('useUTC', this.useUTC);
            if (this.clockManager.activeClock) this.clockManager.activeClock.previousTimeString = '';
            this._refreshTooltip();
        }

        _openSettings() {
            if (CONFIG.HIDE_SETTINGS_BUTTON) return;
            this.modal.updateContent(this.clockManager.getSettingsHTML());
            this.modal.open();
        }

        _getTooltipText() {
            let line1 = '';
            if (CONFIG.DISPLAY_MODE === "utc") line1 = "Displays UTC Time (Locked)";
            else if (CONFIG.DISPLAY_MODE === "local") line1 = "Displays Server Time (Locked)";
            else line1 = `Displays ${this.useUTC ? "UTC" : "Server"} Time.`;

            if (CONFIG.TOOLTIP_MODE === "limited") return line1;
            
            return `${line1}\n${this.dynamicTooltipText || ''}`;
        }
        
        _startTooltipRotation() {
            const texts = [
                `TimeZone: ${this.timeService.serverTimezone}`,
                this.timeService.syncStatus === 'server' ? "Time is synchronized with server." : "⚠️ Sync problem, using client time!",
                `Simple Clock v${CONFIG.PLUGIN_VERSION}`
            ];
            if (CONFIG.DISPLAY_MODE === "auto") texts.push("Click clock to switch time mode.");
            if (CONFIG.ALLOW_USER_ZOOM) texts.push("Use mouse wheel to zoom.");

            let index = 0;
            this.dynamicTooltipText = texts[index];
            
            setInterval(() => {
                index = (index + 1) % texts.length;
                this.dynamicTooltipText = texts[index];
            }, 5000);
        }

        _refreshTooltip() {
            if (!this.tooltipVisible) return;
            const clock = $('#sc-plugin-wrapper').children().first();
            if (!clock.length) return;

            const newText = this._getTooltipText();
            if (newText !== this.lastTooltipText) {
                this.tooltip.text(newText);
                this.lastTooltipText = newText;
            }
            
            const offset = clock.offset();
            this.tooltip.css({
                display: 'block',
                left: `${offset.left + clock.outerWidth() / 2}px`,
                top: `${offset.top + clock.outerHeight() + 10}px`,
                transform: 'translateX(-50%)'
            });
        }
    }

    // --- Plugin Initialization ---
    $(document).ready(() => {
        const plugin = new SimpleClockPlugin();
        plugin.init();
    });

})();