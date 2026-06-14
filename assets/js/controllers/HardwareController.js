import { CONFIG } from "../config.js";

export class HardwareController {
    constructor({ model, dashboardView, chartView, apiService, onSaved }) {
        this.model = model;
        this.dashboardView = dashboardView;
        this.chartView = chartView;
        this.apiService = apiService;
        this.onSaved = onSaved;

        this.mode = localStorage.getItem("hw_mode") || CONFIG.hardware.defaultMode;
        this.websocketUrl = localStorage.getItem("hw_url") || CONFIG.hardware.defaultWebSocketUrl;
        this.restEndpoint = localStorage.getItem("hw_rest_url") || CONFIG.hardware.defaultRestUrl;
        this.pollingInterval = CONFIG.hardware.pollingIntervalMs;

        this.dbSaveThrottle = 0;
        this.ws = null;
        this.pollingIntervalId = null;
        this.serialReader = null;
    }

    init() {
        this.setupConnectionModal();
        this.connect();
    }

    setupConnectionModal() {
        const statusEl = document.querySelector(".system-status");
        const modal = document.getElementById("connection-modal");
        const closeBtn = document.getElementById("close-conn-modal");
        const wifiCard = document.getElementById("conn-wifi");
        const wiredCard = document.getElementById("conn-wired");
        const wifiConfig = document.getElementById("wifi-config");
        const connectWifiBtn = document.getElementById("btn-connect-wifi");
        const wifiInput = document.getElementById("wifi-url-input");

        if (statusEl) {
            statusEl.style.cursor = "pointer";
            statusEl.title = "Click to configure hardware connection";
            statusEl.addEventListener("click", () => {
                modal?.classList.add("open");
                if (wifiInput) {
                    wifiInput.value = this.mode === "REST" ? this.restEndpoint : this.websocketUrl;
                }
            });
        }

        closeBtn?.addEventListener("click", () => modal?.classList.remove("open"));

        const clearActive = () => {
            wifiCard?.classList.remove("active");
            wiredCard?.classList.remove("active");
            wifiConfig?.classList.remove("active");
        };

        wifiCard?.addEventListener("click", () => {
            clearActive();
            wifiCard.classList.add("active");
            wifiConfig?.classList.add("active");
        });

        wiredCard?.addEventListener("click", () => {
            clearActive();
            wiredCard.classList.add("active");
            modal?.classList.remove("open");

            this.mode = "SERIAL";
            localStorage.setItem("hw_mode", "SERIAL");
            this.connect();
        });

        connectWifiBtn?.addEventListener("click", () => {
            const url = wifiInput?.value.trim();
            if (!url) return;

            if (/^https?:\/\//i.test(url)) {
                this.mode = "REST";
                this.restEndpoint = url;
                localStorage.setItem("hw_mode", "REST");
                localStorage.setItem("hw_rest_url", url);
            } else {
                this.mode = "WEBSOCKET";
                this.websocketUrl = url;
                localStorage.setItem("hw_mode", "WEBSOCKET");
                localStorage.setItem("hw_url", url);
            }

            modal?.classList.remove("open");
            this.connect();
        });
    }

    connect() {
        this.cleanup();

        this.dashboardView.updateSystemStatus("Connecting...", "warning");

        if (this.mode === "WEBSOCKET") {
            this.connectWebSocket();
        } else if (this.mode === "REST") {
            this.startRestPolling();
        } else if (this.mode === "SERIAL") {
            this.connectSerial();
        }
    }

    cleanup() {
        if (this.ws) {
            this.ws.onclose = null;
            this.ws.close();
            this.ws = null;
        }

        if (this.pollingIntervalId) {
            clearInterval(this.pollingIntervalId);
            this.pollingIntervalId = null;
        }

        if (this.serialReader) {
            try { this.serialReader.cancel(); } catch {}
            this.serialReader = null;
        }
    }

    connectWebSocket() {
        try {
            console.log(`Attempting WebSocket hardware connection: ${this.websocketUrl}`);
            this.ws = new WebSocket(this.websocketUrl);

            this.ws.onopen = () => {
                this.dashboardView.updateSystemStatus("Hardware Connected", "success");
            };

            this.ws.onmessage = (event) => {
                try {
                    this.handleHardwareData(JSON.parse(event.data));
                } catch (error) {
                    console.error("Error parsing WebSocket hardware data:", error);
                }
            };

            this.ws.onclose = () => {
                this.dashboardView.updateSystemStatus("Connection Lost (Click to Edit)", "danger");
                setTimeout(() => {
                    if (this.mode === "WEBSOCKET") this.connectWebSocket();
                }, 5000);
            };

            this.ws.onerror = (error) => console.error("WebSocket error:", error);
        } catch (error) {
            console.error("Invalid WebSocket URL:", error);
            this.dashboardView.updateSystemStatus("Invalid IP (Click to Edit)", "danger");
        }
    }

    startRestPolling() {
        console.log("Starting REST polling to hardware...");
        this.dashboardView.updateSystemStatus("Polling Hardware", "success");

        const poll = async () => {
            try {
                const response = await fetch(this.restEndpoint);
                if (!response.ok) throw new Error("Hardware unavailable");
                this.handleHardwareData(await response.json());
            } catch (error) {
                console.warn("REST hardware polling error:", error.message);
            }
        };

        poll();
        this.pollingIntervalId = setInterval(poll, this.pollingInterval);
    }

    async connectSerial() {
        if (!("serial" in navigator)) {
            alert("Web Serial API is not supported. Use Chrome/Edge on localhost or HTTPS.");
            return;
        }

        try {
            const port = await navigator.serial.requestPort();
            await port.open({ baudRate: 115200 });

            this.dashboardView.updateSystemStatus("USB Connected", "success");

            const textDecoder = new TextDecoderStream();
            port.readable.pipeTo(textDecoder.writable);
            this.serialReader = textDecoder.readable.getReader();

            let buffer = "";

            while (true) {
                const { value, done } = await this.serialReader.read();
                if (done) break;

                buffer += value;
                const lines = buffer.split("\n");
                buffer = lines.pop();

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed) continue;

                    try {
                        this.handleHardwareData(JSON.parse(trimmed));
                    } catch {
                        // ignore invalid/partial frames
                    }
                }
            }
        } catch (error) {
            console.error("Serial connection error:", error);
            this.dashboardView.updateSystemStatus("USB Error (Click Setup)", "danger");
        }
    }

    async handleHardwareData(raw) {
        const sample = this.model.merge(raw);

        this.dashboardView.updateCards(sample);
        this.chartView.pushSample({ ...sample, time: new Date() });

        const now = Date.now();
        if (now - this.dbSaveThrottle < CONFIG.hardware.dbSaveThrottleMs) return;

        this.dbSaveThrottle = now;

        try {
            await this.apiService.insertReading(sample);
            this.onSaved?.();
        } catch (error) {
            console.warn("Could not save hardware reading:", error.message);
        }
    }
}
