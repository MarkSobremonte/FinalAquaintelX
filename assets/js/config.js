export const CONFIG = {
    appName: "AquaIntelX",

    endpoints: {
        latest: "get_latest.php",
        insert: "insert_data.php",
        status: "get_status.php",
        updateStatus: "update_status.php",
        history: "sensor_api.php?action=history",
        chart: "sensor_api.php?action=chart",
        stats: "sensor_api.php?action=stats"
    },

    processDurations: {
        READING: 15 * 60,
        FLUSHING: 8,
        REFILLING: 6,
        SETTLING: 30,
        ERROR: 0
    },

    refresh: {
        latestMs: 3000,
        statusMs: 1000,
        backgroundMs: 30000
    },

    hardware: {
        defaultMode: "WEBSOCKET",
        defaultWebSocketUrl: "ws://192.168.1.100:81",
        defaultRestUrl: "http://192.168.1.100/data",
        pollingIntervalMs: 1000,
        dbSaveThrottleMs: 5000
    },

    chart: {
        maxLivePoints: 36
    }
};