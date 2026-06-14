import { formatDateTime } from "../utils/formatters.js";

export class HistoryView {
    constructor(apiService) {
        this.api = apiService;
        this.tbody = document.getElementById("history-table-body");
        this.pagination = document.getElementById("history-pagination");
        this.currentPage = 1;
    }

    async load(page = 1) {
        if (!this.tbody) return;

        this.tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted);">
                    <i class="ph ph-spinner-gap" style="animation:spin 1s linear infinite;font-size:1.5rem;display:block;margin-bottom:.5rem;"></i>
                    Loading data from database...
                </td>
            </tr>
        `;

        try {
            const data = await this.api.getHistory(page, 50);

            if (!data.success || !data.data || !data.data.length) {
                this.renderEmpty();
                return;
            }

            this.currentPage = data.meta?.page || page;
            this.renderRows(data.data);
            this.renderPagination(data.meta || null);
        } catch (error) {
            this.renderError(error.message);
        }
    }

    renderRows(rows) {
        this.tbody.innerHTML = rows.map((row) => {
            const badge = `<span class="status-badge ${row.status}">${row.status}</span>`;
            const fmt = (value, decimals = 1) => value !== null ? Number(value).toFixed(decimals) : "—";

            return `
                <tr>
                    <td>${formatDateTime(row.recorded_at)}</td>
                    <td>${row.sensor_node || "NODE-01"}</td>
                    <td>${fmt(row.temperature, 1)}</td>
                    <td>${fmt(row.turbidity, 2)}</td>
                    <td>${fmt(row.ph, 2)}</td>
                    <td>${fmt(row.tds, 0)}</td>
                    <td>${badge}</td>
                </tr>
            `;
        }).join("");
    }

    renderPagination(meta) {
        if (!this.pagination || !meta) return;

        this.pagination.innerHTML = `
            <span style="color:var(--text-muted);font-size:14px;">
                Page ${meta.page} of ${meta.total_pages} &nbsp;|&nbsp; ${meta.total} readings
            </span>
            <div style="display:flex;gap:8px;">
                <button class="btn btn-outline" ${meta.page <= 1 ? "disabled" : ""} onclick="window._loadHistory(${meta.page - 1})">
                    <i class="ph ph-caret-left"></i> Prev
                </button>
                <button class="btn btn-outline" ${meta.page >= meta.total_pages ? "disabled" : ""} onclick="window._loadHistory(${meta.page + 1})">
                    Next <i class="ph ph-caret-right"></i>
                </button>
            </div>
        `;
    }

    renderEmpty() {
        this.tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted);">
                    <i class="ph ph-plugs" style="font-size:2rem;margin-bottom:.5rem;display:block;"></i>
                    No historical data yet. Connect hardware to start logging.
                </td>
            </tr>
        `;
    }

    renderError(message) {
        this.tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;padding:2rem;color:var(--danger);">
                    <i class="ph ph-warning" style="font-size:1.5rem;display:block;margin-bottom:.5rem;"></i>
                    Could not load data: ${message}
                </td>
            </tr>
        `;
    }
}
