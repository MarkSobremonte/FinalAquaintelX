import { formatNumber } from "../utils/formatters.js";

export class DashboardView {
    constructor() {
        this.elements = {
            temp: document.getElementById("temp-val"),
            turb: document.getElementById("turb-val"),
            tds: document.getElementById("tds-val"),
            ph: document.getElementById("ph-val"),
            systemStatus: document.querySelector(".system-status span"),
            statusIndicator: document.querySelector(".status-indicator")
        };
    }

    updateMetric(element, value, suffix, decimals = 1) {
        if (!element) return;

        const formatted = formatNumber(value, decimals);
        element.innerHTML = `${formatted}<span class="unit">${suffix}</span>`;

        element.classList.remove("value-update");
        void element.offsetWidth;
        element.classList.add("value-update");
    }

    updateCards(reading) {
        if (!reading) return;

        this.updateMetric(this.elements.temp, reading.temperature, "°C", 1);
        this.updateMetric(this.elements.turb, reading.turbidity, "NTU", 2);
        this.updateMetric(this.elements.tds, reading.tds, "ppm", 0);

        if (this.elements.ph) {
            this.elements.ph.textContent = formatNumber(reading.ph, 2);

            this.elements.ph.classList.remove("value-update");
            void this.elements.ph.offsetWidth;
            this.elements.ph.classList.add("value-update");
        }

        //this.updateMetricTrendText("Latest database reading");
    }

    updateMetricTrendText(text) {
        document.querySelectorAll(".metric-card .metric-trend").forEach((trend) => {
            trend.innerHTML = `
                <i class="ph ph-database"></i>
                <span>${text}</span>
            `;
        });
    }

    updateSystemStatus(text, state = "success") {
        if (this.elements.systemStatus) {
            this.elements.systemStatus.textContent = text;
        }

        if (!this.elements.statusIndicator) return;

        this.elements.statusIndicator.classList.toggle("active", state === "success");

        const colors = {
            success: "var(--success)",
            warning: "var(--warning)",
            danger: "var(--danger)"
        };

        this.elements.statusIndicator.style.backgroundColor = colors[state] || colors.success;
    }
}
