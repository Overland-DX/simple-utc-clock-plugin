/*
    Simple Clock Plugin - Server-side Time Provider v2.0.0
*/
'use strict';

const { logInfo } = require('../../server/console');
const endpointsRouter = require('../../server/endpoints');

const pluginName = "Simple Clock";

// Get the server's local timezone identifier (e.g., "Europe/Oslo")
const serverTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
logInfo(`${pluginName}: Server timezone detected as: ${serverTimezone}`);

// Register an endpoint to provide the current time
endpointsRouter.get('/simpleclock_utc_time', (req, res) => {
    const now = new Date();
    
    // Respond with a JSON object containing the time and timezone
    res.json({
        // Use toISOString() for a standardized UTC format (e.g., "2025-09-30T14:20:00.123Z")
        utc_time: now.toISOString(),
        timezone: serverTimezone 
    });
});

module.exports = {
    provides: 'time_and_timezone'
};