import { CONFIG } from "../config.js";
import { formatTime } from "../utils/formatters.js";

export class ChartView {
    constructor() {
        this.ctx = document.getElementById("trendsChart")?.getContext("2d");

        this.labels = [];
        this.tempSeries = [];
        this.turbSeries = [];
        this.tdsSeries = [];
        this.phSeries = [];

        this.chart = this.ctx ? this.createChart() : null;
    }

    createChart() {
        Chart.defaults.color = "#94a3b8";
        Chart.defaults.font.family = "'Outfit', sans-serif";

        return new Chart(this.ctx, {
            type: "line",
            data: {
                labels: this.labels,
                datasets: [
                    {
                        label: "Temperature (°C)",
                        data: this.tempSeries,
                        borderColor: "#f59e0b",
                        backgroundColor: "rgba(245, 158, 11, 0.15)",
                        borderWidth: 2,
                        tension: 0.35,
                        fill: false,
                        pointRadius: 2,
                        pointHoverRadius: 5,
                        spanGaps: true,
                        yAxisID: "yTemp"
                    },
                    {
                        label: "Turbidity (NTU)",
                        data: this.turbSeries,
                        borderColor: "#00e5ff",
                        backgroundColor: "rgba(0, 229, 255, 0.15)",
                        borderWidth: 2,
                        tension: 0.35,
                        fill: false,
                        pointRadius: 2,
                        pointHoverRadius: 5,
                        spanGaps: true,
                        yAxisID: "yTurb"
                    },
                    {
                        label: "TDS (ppm)",
                        data: this.tdsSeries,
                        borderColor: "#34d399",
                        backgroundColor: "rgba(52, 211, 153, 0.15)",
                        borderWidth: 2,
                        tension: 0.35,
                        fill: false,
                        pointRadius: 2,
                        pointHoverRadius: 5,
                        spanGaps: true,
                        yAxisID: "yTds"
                    },
                    {
                        label: "pH",
                        data: this.phSeries,
                        borderColor: "#8b5cf6",
                        backgroundColor: "rgba(139, 92, 246, 0.15)",
                        borderWidth: 2,
                        tension: 0.35,
                        fill: false,
                        pointRadius: 2,
                        pointHoverRadius: 5,
                        spanGaps: true,
                        yAxisID: "yPh"
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 0
                },
                interaction: {
                    mode: "index",
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: "top",
                        labels: {
                            usePointStyle: true,
                            padding: 14,
                            font: {
                                size: 11,
                                weight: "500"
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: "rgba(15, 22, 36, 0.95)",
                        titleColor: "#e2e8f0",
                        bodyColor: "#e2e8f0",
                        borderColor: "rgba(255,255,255,0.1)",
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                        usePointStyle: true
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: "rgba(255, 255, 255, 0.05)",
                            drawBorder: false
                        },
                        ticks: {
                            maxRotation: 0,
                            autoSkip: true,
                            maxTicksLimit: 8
                        }
                    },
                    yTemp: {
                        type: "linear",
                        display: true,
                        position: "left",
                        title: {
                            display: true,
                            text: "°C",
                            color: "#94a3b8",
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            color: "rgba(255, 255, 255, 0.05)",
                            drawBorder: false
                        },
                        suggestedMin: 10,
                        suggestedMax: 35
                    },
                    yTds: {
                        type: "linear",
                        display: true,
                        position: "left",
                        offset: true,
                        title: {
                            display: true,
                            text: "ppm",
                            color: "#94a3b8",
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        suggestedMin: 0,
                        suggestedMax: 500
                    },
                    yTurb: {
                        type: "linear",
                        display: true,
                        position: "right",
                        title: {
                            display: true,
                            text: "NTU",
                            color: "#94a3b8",
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        suggestedMin: 0,
                        suggestedMax: 5
                    },
                    yPh: {
                        type: "linear",
                        display: true,
                        position: "right",
                        offset: true,
                        title: {
                            display: true,
                            text: "pH",
                            color: "#94a3b8",
                            font: {
                                size: 11
                            }
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        suggestedMin: 0,
                        suggestedMax: 14
                    }
                }
            }
        });
    }

    setXAxisByRange(range = "24h") {
        if (!this.chart) return;

        if (range === "24h") {
            this.chart.options.scales.x.ticks.autoSkip = true;
            this.chart.options.scales.x.ticks.maxTicksLimit = 8;
        } else if (range === "7d") {
            this.chart.options.scales.x.ticks.autoSkip = true;
            this.chart.options.scales.x.ticks.maxTicksLimit = 7;
        } else if (range === "30d") {
            this.chart.options.scales.x.ticks.autoSkip = true;
            this.chart.options.scales.x.ticks.maxTicksLimit = 10;
        } else {
            this.chart.options.scales.x.ticks.autoSkip = true;
            this.chart.options.scales.x.ticks.maxTicksLimit = 8;
        }
    }

    formatLabelByRange(value, range = "24h") {
        const date = value instanceof Date
            ? value
            : new Date(String(value || "").replace(" ", "T"));

        if (Number.isNaN(date.getTime())) {
            return String(value || "");
        }

        if (range === "24h") {
            return date.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit"
            });
        }

        if (range === "7d") {
            return date.toLocaleString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit"
            });
        }

        if (range === "30d") {
            return date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric"
            });
        }

        return date.toLocaleString();
    }

    getBucketSizeMs(range = "24h") {
        if (range === "24h") {
            return 30 * 60 * 1000; // 30 minutes
        }

        if (range === "7d") {
            return 6 * 60 * 60 * 1000; // 6 hours
        }

        if (range === "30d") {
            return 24 * 60 * 60 * 1000; // 1 day
        }

        return 30 * 60 * 1000;
    }

    aggregateRows(rows = [], range = "24h") {
        const bucketSize = this.getBucketSizeMs(range);
        const buckets = new Map();

        rows.forEach((row) => {
            const date = new Date(String(row.recorded_at || "").replace(" ", "T"));
            const time = date.getTime();

            if (Number.isNaN(time)) return;

            const temperature = Number(row.temperature);
            const turbidity = Number(row.turbidity);
            const tds = Number(row.tds);
            const ph = Number(row.ph);

            if (
                !Number.isFinite(temperature) ||
                !Number.isFinite(turbidity) ||
                !Number.isFinite(tds) ||
                !Number.isFinite(ph)
            ) {
                return;
            }

            const bucketTime = Math.floor(time / bucketSize) * bucketSize;

            if (!buckets.has(bucketTime)) {
                buckets.set(bucketTime, {
                    time: bucketTime,
                    count: 0,
                    temperature: 0,
                    turbidity: 0,
                    tds: 0,
                    ph: 0
                });
            }

            const bucket = buckets.get(bucketTime);

            bucket.count += 1;
            bucket.temperature += temperature;
            bucket.turbidity += turbidity;
            bucket.tds += tds;
            bucket.ph += ph;
        });

        return Array.from(buckets.values())
            .sort((a, b) => a.time - b.time)
            .map((bucket) => ({
                recorded_at: new Date(bucket.time),
                temperature: bucket.temperature / bucket.count,
                turbidity: bucket.turbidity / bucket.count,
                tds: bucket.tds / bucket.count,
                ph: bucket.ph / bucket.count
            }));
    }

    pushSample(sample) {
        if (!this.chart || !sample) return;

        const temperature = Number(sample.temperature);
        const turbidity = Number(sample.turbidity);
        const tds = Number(sample.tds);
        const ph = Number(sample.ph);

        if (
            !Number.isFinite(temperature) ||
            !Number.isFinite(turbidity) ||
            !Number.isFinite(tds) ||
            !Number.isFinite(ph)
        ) {
            return;
        }

        this.setXAxisByRange("24h");

        this.labels.push(formatTime(new Date()));
        this.tempSeries.push(temperature);
        this.turbSeries.push(turbidity);
        this.tdsSeries.push(tds);
        this.phSeries.push(ph);

        while (this.labels.length > CONFIG.chart.maxLivePoints) {
            this.labels.shift();
            this.tempSeries.shift();
            this.turbSeries.shift();
            this.tdsSeries.shift();
            this.phSeries.shift();
        }

        this.chart.update("none");
    }

    replaceData(rows = [], range = "24h") {
        if (!this.chart) return;

        this.labels.length = 0;
        this.tempSeries.length = 0;
        this.turbSeries.length = 0;
        this.tdsSeries.length = 0;
        this.phSeries.length = 0;

        this.setXAxisByRange(range);

        const sortedRows = [...rows].sort((a, b) => {
            const timeA = new Date(String(a.recorded_at || "").replace(" ", "T")).getTime();
            const timeB = new Date(String(b.recorded_at || "").replace(" ", "T")).getTime();

            return timeA - timeB;
        });

        const chartRows = this.aggregateRows(sortedRows, range);

        chartRows.forEach((row) => {
            this.labels.push(this.formatLabelByRange(row.recorded_at, range));
            this.tempSeries.push(Number(row.temperature.toFixed(2)));
            this.turbSeries.push(Number(row.turbidity.toFixed(2)));
            this.tdsSeries.push(Number(row.tds.toFixed(0)));
            this.phSeries.push(Number(row.ph.toFixed(2)));
        });

        this.chart.update("none");
    }

    updateTheme(theme) {
        if (!this.chart) return;

        const yGrids = ["yTemp", "yTds", "yTurb", "yPh"];

        if (theme === "light") {
            Chart.defaults.color = "#64748b";

            this.chart.options.plugins.tooltip.backgroundColor = "rgba(255, 255, 255, 0.95)";
            this.chart.options.plugins.tooltip.titleColor = "#0f172a";
            this.chart.options.plugins.tooltip.bodyColor = "#0f172a";
            this.chart.options.plugins.tooltip.borderColor = "rgba(0,0,0,0.1)";
            this.chart.options.scales.x.grid.color = "rgba(0, 0, 0, 0.05)";

            yGrids.forEach((id) => {
                const grid = this.chart.options.scales[id]?.grid;

                if (grid && "color" in grid) {
                    grid.color = "rgba(0, 0, 0, 0.05)";
                }
            });
        } else {
            Chart.defaults.color = "#94a3b8";

            this.chart.options.plugins.tooltip.backgroundColor = "rgba(15, 22, 36, 0.95)";
            this.chart.options.plugins.tooltip.titleColor = "#e2e8f0";
            this.chart.options.plugins.tooltip.bodyColor = "#e2e8f0";
            this.chart.options.plugins.tooltip.borderColor = "rgba(255,255,255,0.1)";
            this.chart.options.scales.x.grid.color = "rgba(255, 255, 255, 0.05)";

            yGrids.forEach((id) => {
                const grid = this.chart.options.scales[id]?.grid;

                if (grid && "color" in grid) {
                    grid.color = "rgba(255, 255, 255, 0.05)";
                }
            });
        }

        this.chart.update("none");
    }
}