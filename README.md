# Simple Clock Plugin for FM-DX-Webserver

<br><br>

The Simple Clock Plugin is an add-on for the FM-DX-Webserver V1.3.5 and later, that displays a customizable clock in the top bar. It allows users to toggle between local time and UTC, adjust the clock size, and change clock date format.
<br><br><br>
Features:

🕒 Displays Local or UTC Time - Users can toggle between local and UTC time formats.

🎨 Customizable Clock Size - Adjust the clock size using the mouse wheel.

📱 Mobile-Friendly - Option to hide the clock on mobile devices. Default value is set to not show on mobile. (Can be changed in plugin settings)

🕹️ Toggle Visibility - Easily hide or show the clock from the side panel settings.

🖥️ Configurable Display Position - Choose whether to place the clock before or after other plugins. (Plugin setting)

🔄 Automatic Time Synchronization - Syncs time with a predefined time server. Remember to check that the url is set up correctly against the server and change to your time zone. (plugin settings)

🌐 Supports Multiple Time Formats - Select from 12-hour or 24-hour formats with different date styles.
<br><br><br>
Installation:

Download or clone the repository.

1. Place the file "Simple_Clock.js" and the folder "Simple_Clock" with its contents in the plugin folder on the server and place "web" folder to the root of the dm-dx-webserver.
2. Navigate to \plugin\Simple_Clock\ and open Simple_clock_plugin.js with your favorite text editor. Change the values at the top of the code according to your wishes and save the changes.
3. Restart your server and activate the plugin in Admin Panel.
<br><br>Note!<br>
If you are unsure which time zone to use, you can find some tips/info here: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
<br>
<br><br><br>

Usage:

Click on the clock to switch between UTC and local time.

Open the settings menu to change time and date format.

Use the mouse wheel over the clock to increase or decrease clock size.
<br><br><br>
Screenshots:

<br>

![oversikt](https://github.com/user-attachments/assets/6b9de157-5b4d-4fa8-aa7e-05547b35da2f)
<br>

![image](https://github.com/user-attachments/assets/acadaf29-3eb6-45c7-9e2e-f5bc960f53ed)
<br>

<br><br><br>
Notes

This plugin is open-source and free to use. Feel free to contribute or modify it as needed. If you encounter issues, please open a ticket in the GitHub repository.
<br><br><br><br><br><br><br>

📌 Version: 1.10.0: (Current)<br>
 - Added fonts and colors. (4 fonts and 15 colors)
 - Added ability to resize clock in mobile view. (Swipe left or right to change clock size)
 - Increased to 8 clock sizes. (can be changed in settings)
 - Fixed some bugs and optimized the design.
 - Adapted to new version of FM-DX-Webserver 1.3.7. (This may cause incorrect display if you are using an older version of FM-DX-Webserver)

<br><br>
Version: 1.05.3:<br>
 - Fixed so clock and date is displayed correctly in mobile view.
 - Added back 24h clock only format.<br>*The clock can now be displayed without the "UTC" icon/text above the clock.
 - Removed "Server" which was displayed above the clock for Server time mode.<br>*Server time mode will still be displayed in the tooltip. UTC is not affected.
 - Added more options to customize the clock (server side)<br> * Added option for shortened tooltip.<br> * You can now hide seconds in the clock.<br> *
 You can now set a default preset time format.<br> * You can remove the ability for the user to choose the format themselves.(This will hide the Simple clock format dropdown for users in sidepanel setting.)
 - Simplified the plugin config and better explains what changes will do.
 - You can now use the plugin without changing any settings.<br>*In this case, the time will be displayed in UTC time only.
<br>*If you want local server time and other options, this must be set up in config.

<br><br>
Version: 1.05.2:<br>
 - Fixed Time format names. And changed name from Local time to Server time,
 so that no one misunderstands that the time shown is the local time where the server is. (added in v1.05.01) 
 - Added more time format. ("24h yyyy.MM.dd", "24h yyyy MMM dd", "12h yyyy.MM.dd")
 - Removed "24h and 12h time only" for now. We will try to add back only clock later.



<br><br>
Version: 1.05.0:<br>
 - Added dynamic text in tooltip. The current time mode as UTC or Local is now displayed in the tooltip. Plus other relevant information.
 - Added new options in plugin settings, which give the server owner the ability to decide what the user can do. Such as changing the size of the clock, hiding "UTC"/"Local" that is displayed above the clock.
 - Added more time formats.
 - Fixed some bugs. As when admin has set the clock to hidden for mobile viewing, the dropdown and button to hide the clock are also removed.
 - Fixed the gap between time and date in mobile view to be smaller.
 - +++

<br><br>
Version: 1.04.3:<br>
- Now the sync type is displayed correctly in the tooltip.
- Made changes to how data is cached.
- Made it easier to set the server API URL.
- Set default value for HIDE_CLOCK_ON_MOBILE to false.

<br><br>
Version: 1.04.2:<br>
- Fixed: when hiding the clock with a mobile, the button disappeared.
- Optimized checking for older versions and corrupt cache.

<br><br>
Version: 1.04.1:<br>
- Added info on tooltip. (Shows whether the time is retrieved from the server API or the user's device.)
- Fixed the issue with cache storing invalid info.
<br><br><br>

Version: 1.04.0:<br>
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
Version 1.02.0:<br>

 - Added HideClock, Can be enabled in the settings in the sidebar. I borrowed parts of a code from AmateurAudioDude's pluins as an example for this code.
 - Added fetchServerTime.<br>
*If an asterisk character appears after the date, it means that the time could not be updated from the time server and the time is retrieved from the client's device. If no characters appear, the time is retrieved correctly from the server.<br><br>
   
<br>
<br>

Version 1.01.2:<br>

 -  Added "Loc" behind the local date since I still haven't gotten the dynamic tooltips to work properly.
 - Added so serverowner can set timezone for local time. (e.g., "America/New_York")<br>


<br>

<br>
Version 1.01.1:

- Added new string for admin controll in Simple_clock_plugin.js ("auto" = Users can switch, "local" = Only local time, "utc" = Only UTC)
- Fixed state being saved correctly.
- some cleanup.

*If you find any bugs or want to help with the project, let me know here or on Discord.

<br><br>
Version 1.01.0:
 - The user can now decide for themselves whether to use UTC or local mode by pressing the clock.
 - You can disable this option in Simple_clock_plugin.js
 - Changed file and folder names to more English friendly.

<br><br>
Version 1.00.4:
- Added user choice in UTC or local time at the top of Simple_clock_plugin.js.
- Some words were in Norwegian and have been changed to English.
- Rewrite code for jquery for better performance.
>

