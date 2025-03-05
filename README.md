# Simple Clock Plugin for FM-DX-Webserver

Overview

The Simple Clock Plugin is an add-on for the FM-DX-Webserver V1.3.5 and later, that displays a customizable clock in the top bar. It allows users to toggle between local time and UTC, adjust the clock size, and change clock date format.

Features

🕒 Displays Local or UTC Time - Users can toggle between local and UTC time formats.

🎨 Customizable Clock Size - Adjust the clock size using the mouse wheel.

📱 Mobile-Friendly - Option to hide the clock on mobile devices. Default value is set to not show on mobile. (Can be changed in plugin settings)

🕹️ Toggle Visibility - Easily hide or show the clock from the side panel settings.

🖥️ Configurable Display Position - Choose whether to place the clock before or after other plugins. (Plugin setting)

🔄 Automatic Time Synchronization - Syncs time with a predefined time server. Remember to check that the url is set up correctly against the server and change to your time zone. (plugin settings)

🌐 Supports Multiple Time Formats - Select from 12-hour or 24-hour formats with different date styles.

Installation

Download or clone the repository.

1. Place the file "Simple_Clock.js" and the folder "Simple_Clock" with its contents in the plugin folder on the server.
2. Navigate to \plugin\Simple_Clock\ and open Simple_clock_plugin.js with your favorite text editor. Change the values at the top of the code according to your wishes and save the changes.
3. Restart your server and activate the plugin in Admin Panel.

Ensure your browser allows local storage, as some settings are stored there.

Usage

Click on the clock to switch between UTC and local time.

Open the settings menu to change display preferences.

Use the mouse wheel over the clock to increase or decrease font size.

Screenshots

![Skjermbilde 2025-03-05 094513](https://github.com/user-attachments/assets/226c277a-7f24-418e-b773-0bf8c3b5059f)
<br>
![Skjermbilde 2025-03-05 094440](https://github.com/user-attachments/assets/0b2f10b8-0852-4c21-91e6-9f499f1a1e75)
<br>
![Skjermbilde 2025-03-05 094832](https://github.com/user-attachments/assets/827d645e-b781-4d67-8f76-b33906d9e9c3)
<br>
![Skjermbilde 2025-03-05 094928](https://github.com/user-attachments/assets/53f00580-5923-4f25-ae9c-0ae42232b9fc)


Notes

This plugin is open-source and free to use. Feel free to contribute or modify it as needed. If you encounter issues, please open a ticket in the GitHub repository.
<br><br>
📌 Version: 1.04.2: Hotfix2 (Current)<br>
- Fixed: when hiding the clock with a mobile, the button disappeared.
- Optimized checking for older versions and corrupt cache.

<br><br>
Version: 1.04.1:<br>
- Added info on tooltip. (Shows whether the time is retrieved from the server API or the user's device.)
- Fixed the issue with cache storing invalid info.
<br><br><br>
Version: 1.04.0:
- Added clock zoom (5 step).<br>
- Added hide on phone in the plugin setting.<br>
- Fixex the dropdown style. It now follow fm-dx-webservers style.<br>
- Fixed USA date format and 12h time.<br>
- Changed the position to center in mobile view.<br>
- Moved AM/PM and UTC/Local to above the clock.<br>
- Removed some date formats and added 2 new display options for time only 12h and 24h<br>
<br>

<br><br>
Vesion 1.03.0:<br>
- Added more time formats, more friendly to other time standards.
<br>
<br>
Version 1.02.0<br>
- Added fetchServerTime.<br>
*If an asterisk character appears after the date, it means that the time could not be updated from the time server and the time is retrieved from the client's device. If no characters appear, the time is retrieved correctly from the server.<br><br>
- Added HideClock, Can be enabled in the settings in the sidebar. I borrowed parts of a code from AmateurAudioDude's pluins as an example for this code.
<br>
<br>
Version 1.01.2 :
- Added so serverowner can set timezone for local time. (e.g., "America/New_York")
- Added "Loc" behind the local date since I still haven't gotten the dynamic tooltips to work properly.
<br>
Please let me know if it doesn't work for you.

<br>
Version 1.01.1:

- Added new string for admin controll in Simple_clock_plugin.js ("auto" = Users can switch, "local" = Only local time, "utc" = Only UTC)
- Fixed state being saved correctly.
- some cleanup.

If you find any bugs or want to help with the project, let me know here or on Discord.

<br><br>
Version 1.01.0:

-The user can now decide for themselves whether to use UTC or local mode by pressing the clock.

-You can disable this option in Simple_clock_plugin.js

-Changed file and folder names to more English friendly.


Version 1.00.4:
- Added user choice in UTC or local time at the top of Simple_clock_plugin.js.
- Some words were in Norwegian and have been changed to English.
- Rewrite code for jquery for better performance.
>

