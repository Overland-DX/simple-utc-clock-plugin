![bilde](https://github.com/user-attachments/assets/cc8a4022-9d6c-49ae-95f3-0db7d7813b54)
<br><br>
Version 1.1.2 :
- Added so serverowner can set timezone for local time. (e.g., "America/New_York")
- Added "Loc" behind the local date since I still haven't gotten the dynamic tooltips to work properly.
<br>
Please let me know if it doesn't work for you.


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


A simple utc-clock and date which is located at the top right of the top bar on the server.

Only for Version 1.3.5 or later.

It is located at the top right of the top bar on the server.

It retrieves the time and date from the user's device.

Installation instructions:
1. Place the file "Simple_Clock.js" and the folder "Simple_Clock" with its contents in the plugin folder on the server.
2. Navigate to \plugin\Simple_Clock\ and open Simple_clock_plugin.js with your favorite text editor. Change the values at the top of the code according to your wishes and save the changes.
3. Restart your server and activate the plugin in Admin Panel.
<br>
If you are unsure which time zone you are using, you can find it here: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
