Simple Clock Plugin for FM-DX-Webserver.
<br>![Skjermbilde 2025-03-03 091541](https://github.com/user-attachments/assets/176910cb-8ff8-4742-a41b-62b4717277f9)![Skjermbilde 2025-03-03 091327](https://github.com/user-attachments/assets/c2c62b4f-73a7-49c8-abd5-e14a8fbbe201)![Skjermbilde 2025-03-03 091227](https://github.com/user-attachments/assets/2cea58af-ad73-4f48-936f-adbc7d6b2b6e)<br>![Skjermbilde 2025-03-03 090913](https://github.com/user-attachments/assets/ccd95b1e-f623-4bc7-9f79-fbd35c694769)
![Skjermbilde 2025-03-03 090947](https://github.com/user-attachments/assets/8c29164e-0ff7-4487-b82f-e82e3f2e7e6b)




A simple clock and date which is located at the top right of the top bar on the server.

Only for FM-DX-Webserver V1.3.5 or later.

It is located at the top right of the top bar on the server.

It retrieves the time and date from the user's device.

Installation instructions:
1. Place the file "Simple_Clock.js" and the folder "Simple_Clock" with its contents in the plugin folder on the server.
2. Navigate to \plugin\Simple_Clock\ and open Simple_clock_plugin.js with your favorite text editor. Change the values at the top of the code according to your wishes and save the changes.
3. Restart your server and activate the plugin in Admin Panel.
<br>
If you are unsure which time zone to use, you can find it here: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
<br><br>
Vesion 1.3:<br>
- Added more time formats, more friendly to other time standards.
<br>
<br>
Version 1.2.0<br>
- Added fetchServerTime.<br>
*If an asterisk character appears after the date, it means that the time could not be updated from the time server and the time is retrieved from the client's device. If no characters appear, the time is retrieved correctly from the server.<br><br>
- Added HideClock, Can be enabled in the settings in the sidebar. I borrowed parts of a code from AmateurAudioDude's pluins as an example for this code.
<br>
<br>
Version 1.1.2 :
- Added so serverowner can set timezone for local time. (e.g., "America/New_York")
- Added "Loc" behind the local date since I still haven't gotten the dynamic tooltips to work properly.
<br>
Please let me know if it doesn't work for you.

<br>
Version 1.1.1:

- Added new string for admin controll in Simple_clock_plugin.js ("auto" = Users can switch, "local" = Only local time, "utc" = Only UTC)
- Fixed state being saved correctly.
- some cleanup.

If you find any bugs or want to help with the project, let me know here or on Discord.

<br><br>
Version 1.1.0:

-The user can now decide for themselves whether to use UTC or local mode by pressing the clock.

-You can disable this option in Simple_clock_plugin.js

-Changed file and folder names to more English friendly.


Version 1.0.4:
- Added user choice in UTC or local time at the top of Simple_clock_plugin.js.
- Some words were in Norwegian and have been changed to English.
- Rewrite code for jquery for better performance.



