export class StatsView {
    constructor() {
        this.elements = document.querySelectorAll("#db-stats-summary");
    }

    render(data, range = "24h") {
        if (!data || !this.elements.length) return;

        const fmtRow = (label, avg, min, max, unit) => `
            <tr>
                <td style="font-weight:500;color:var(--text-main)">${label}</td>
                <td>${avg ?? "—"} ${unit}</td>
                <td>${min ?? "—"} ${unit}</td>
                <td>${max ?? "—"} ${unit}</td>
            </tr>
        `;

        const html = `
            <table style="width:100%;font-size:14px;border-collapse:collapse;">
                <thead>
                    <tr style="color:var(--text-muted);font-size:12px;text-transform:uppercase;letter-spacing:.5px;">
                        <th style="text-align:left;padding:8px 0;">Parameter</th>
                        <th>Avg</th>
                        <th>Min</th>
                        <th>Max</th>
                    </tr>
                </thead>
                <tbody>
                    ${fmtRow("Temperature", data.avg_temp, data.min_temp, data.max_temp, "°C")}
                    ${fmtRow("Turbidity", data.avg_turb, data.min_turb, data.max_turb, "NTU")}
                    ${fmtRow("TDS", data.avg_tds, data.min_tds, data.max_tds, "ppm")}
                    ${fmtRow("pH", data.avg_ph, data.min_ph, data.max_ph, "")}
                </tbody>
            </table>
            <p style="margin-top:12px;font-size:13px;color:var(--text-muted);">
                <i class="ph ph-database"></i> ${data.total_readings ?? 0} readings in last ${range} &nbsp;|&nbsp;
                <span style="color:var(--warning)">${data.warning_count ?? 0} warnings</span> &nbsp;
                <span style="color:var(--danger)">${data.critical_count ?? 0} critical</span>
            </p>
        `;

        this.elements.forEach((element) => {
            element.innerHTML = html;
        });
    }
}
