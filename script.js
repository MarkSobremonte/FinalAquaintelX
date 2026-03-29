// Initialize Chart.js
document.addEventListener('DOMContentLoaded', () => {

    // Enforce authentication
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        window.location.replace('login.html');
        return; // Stop rendering
    }

    const ctx = document.getElementById('trendsChart').getContext('2d');
    
    // Gradient for the line chart
    const gradientFill = ctx.createLinearGradient(0, 0, 0, 300);
    gradientFill.addColorStop(0, 'rgba(0, 229, 255, 0.4)');
    gradientFill.addColorStop(1, 'rgba(0, 229, 255, 0.0)');

    const gradientFill2 = ctx.createLinearGradient(0, 0, 0, 300);
    gradientFill2.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
    gradientFill2.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

    Chart.defaults.color = '#94a3b8';
    Chart.defaults.font.family = "'Outfit', sans-serif";

    const LIVE_CHART_MAX_POINTS = 36;

    const gradientFill3 = ctx.createLinearGradient(0, 0, 0, 300);
    gradientFill3.addColorStop(0, 'rgba(245, 158, 11, 0.35)');
    gradientFill3.addColorStop(1, 'rgba(245, 158, 11, 0.0)');

    const gradientFill4 = ctx.createLinearGradient(0, 0, 0, 300);
    gradientFill4.addColorStop(0, 'rgba(52, 211, 153, 0.35)');
    gradientFill4.addColorStop(1, 'rgba(52, 211, 153, 0.0)');

    let chartTimeLabels = [];
    let tempSeries = [];
    let turbSeries = [];
    let tdsSeries = [];
    let phSeries = [];

    const trendsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartTimeLabels,
            datasets: [
                {
                    label: 'Temperature (°C)',
                    data: tempSeries,
                    borderColor: '#f59e0b',
                    backgroundColor: gradientFill3,
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    yAxisID: 'yTemp'
                },
                {
                    label: 'Turbidity (NTU)',
                    data: turbSeries,
                    borderColor: '#00e5ff',
                    backgroundColor: gradientFill,
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    yAxisID: 'yTurb'
                },
                {
                    label: 'TDS (ppm)',
                    data: tdsSeries,
                    borderColor: '#34d399',
                    backgroundColor: gradientFill4,
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    yAxisID: 'yTds'
                },
                {
                    label: 'pH',
                    data: phSeries,
                    borderColor: '#8b5cf6',
                    backgroundColor: gradientFill2,
                    borderWidth: 2,
                    tension: 0.35,
                    fill: true,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    yAxisID: 'yPh'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 0 },
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 14,
                        font: { size: 11, weight: '500' }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 22, 36, 0.9)',
                    titleColor: '#e2e8f0',
                    bodyColor: '#e2e8f0',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    boxPadding: 6,
                    usePointStyle: true
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                    ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 8 }
                },
                yTemp: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: { display: true, text: '°C', color: '#94a3b8', font: { size: 11 } },
                    grid: { color: 'rgba(255, 255, 255, 0.05)', drawBorder: false },
                    suggestedMin: 10,
                    suggestedMax: 35
                },
                yTds: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    offset: true,
                    title: { display: true, text: 'ppm', color: '#94a3b8', font: { size: 11 } },
                    grid: { drawOnChartArea: false },
                    suggestedMin: 0,
                    suggestedMax: 500
                },
                yTurb: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: { display: true, text: 'NTU', color: '#94a3b8', font: { size: 11 } },
                    grid: { drawOnChartArea: false },
                    suggestedMin: 0,
                    suggestedMax: 5
                },
                yPh: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    offset: true,
                    title: { display: true, text: 'pH', color: '#94a3b8', font: { size: 11 } },
                    grid: { drawOnChartArea: false },
                    suggestedMin: 0,
                    suggestedMax: 14
                }
            }
        }
    });

    function pushLiveChartSample(sample) {
        const t = sample.time instanceof Date ? sample.time : new Date();
        const label = t.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        chartTimeLabels.push(label);
        tempSeries.push(sample.temperature);
        turbSeries.push(sample.turbidity);
        tdsSeries.push(sample.tds);
        phSeries.push(sample.ph);

        while (chartTimeLabels.length > LIVE_CHART_MAX_POINTS) {
            chartTimeLabels.shift();
            tempSeries.shift();
            turbSeries.shift();
            tdsSeries.shift();
            phSeries.shift();
        }

        trendsChart.update('none');
    }

    // ==========================================
    // THEME TOGGLE
    // ==========================================
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // Check saved theme
    const currentTheme = localStorage.getItem('theme') || 'dark';
    if (currentTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        themeIcon.className = 'ph ph-moon';
        updateChartTheme('light');
    }

    themeBtn.addEventListener('click', () => {
        let theme = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        // Update Icon
        themeIcon.className = theme === 'light' ? 'ph ph-moon' : 'ph ph-sun';
        
        // Update Chart
        updateChartTheme(theme);
    });

    function updateChartTheme(theme) {
        if (!trendsChart) return;

        const yGrids = ['yTemp', 'yTds', 'yTurb', 'yPh'];
        
        if (theme === 'light') {
            Chart.defaults.color = '#64748b'; // --text-muted
            trendsChart.options.plugins.tooltip.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            trendsChart.options.plugins.tooltip.titleColor = '#0f172a';
            trendsChart.options.plugins.tooltip.bodyColor = '#0f172a';
            trendsChart.options.plugins.tooltip.borderColor = 'rgba(0,0,0,0.1)';
            
            trendsChart.options.scales.x.grid.color = 'rgba(0, 0, 0, 0.05)';
            yGrids.forEach((id) => {
                const g = trendsChart.options.scales[id]?.grid;
                if (g && 'color' in g) g.color = 'rgba(0, 0, 0, 0.05)';
            });
            
            trendsChart.update();
        } else {
            Chart.defaults.color = '#94a3b8';
            trendsChart.options.plugins.tooltip.backgroundColor = 'rgba(15, 22, 36, 0.9)';
            trendsChart.options.plugins.tooltip.titleColor = '#e2e8f0';
            trendsChart.options.plugins.tooltip.bodyColor = '#e2e8f0';
            trendsChart.options.plugins.tooltip.borderColor = 'rgba(255,255,255,0.1)';
            
            trendsChart.options.scales.x.grid.color = 'rgba(255, 255, 255, 0.05)';
            yGrids.forEach((id) => {
                const g = trendsChart.options.scales[id]?.grid;
                if (g && 'color' in g) g.color = 'rgba(255, 255, 255, 0.05)';
            });
            
            trendsChart.update();
        }
    }

    // ==========================================
    // HARDWARE INTEGRATION (TELEMETRY MANAGER)
    // ==========================================
    function normalizeTelemetry(raw) {
        const r = raw && typeof raw === 'object' ? raw : {};
        const pick = (...keys) => {
            for (const k of keys) {
                if (r[k] === undefined || r[k] === null || r[k] === '') continue;
                const v = Number(r[k]);
                return Number.isFinite(v) ? v : undefined;
            }
            return undefined;
        };
        return {
            temperature: pick('temperature', 'temp', 'Temperature', 'TEMP'),
            turbidity: pick('turbidity', 'turb', 'Turbidity', 'ntu', 'NTU', 'turbidity_ntu'),
            tds: pick('tds', 'TDS', 'tds_ppm', 'TDS_ppm', 'ec_ppm'),
            ph: pick('ph', 'pH', 'PH')
        };
    }

    class HardwareConnection {
        constructor() {
            this.mode = localStorage.getItem('hw_mode') || 'WEBSOCKET';
            this.websocketUrl = localStorage.getItem('hw_url') || 'ws://192.168.1.100:81';
            this.restEndpoint = localStorage.getItem('hw_rest_url') || 'http://192.168.1.100/data';
            this.pollingInterval = 1000;

            this.lastSample = {};

            // DOM Elements
            this.ui = {
                temp: document.getElementById('temp-val'),
                turb: document.getElementById('turb-val'),
                tds:  document.getElementById('tds-val'),
                ph:   document.getElementById('ph-val')
            };

            this.setupInteractiveStatus();
            this.init();
        }

        setupInteractiveStatus() {
            const statusEl = document.querySelector('.system-status');
            statusEl.style.cursor = 'pointer';
            statusEl.title = 'Click to configure hardware connection';
            
            statusEl.addEventListener('click', () => {
                const hint = 'WebSocket (ws://…), REST JSON (http://…), or MOCK';
                const current = this.mode === 'REST' ? this.restEndpoint : this.websocketUrl;
                const url = prompt(`Enter hardware URL (${hint}):`, current);
                if (!url || !url.trim()) return;
                const trimmed = url.trim();
                if (trimmed.toUpperCase() === 'MOCK') {
                    this.mode = 'MOCK';
                    localStorage.setItem('hw_mode', 'MOCK');
                } else if (/^https?:\/\//i.test(trimmed)) {
                    this.mode = 'REST';
                    this.restEndpoint = trimmed;
                    localStorage.setItem('hw_mode', 'REST');
                    localStorage.setItem('hw_rest_url', trimmed);
                } else {
                    this.mode = 'WEBSOCKET';
                    this.websocketUrl = trimmed;
                    localStorage.setItem('hw_mode', 'WEBSOCKET');
                    localStorage.setItem('hw_url', trimmed);
                }
                this.init();
            });
        }

        init() {
            // Clean up old connections if re-initializing
            if (this.ws) { this.ws.onclose = null; this.ws.close(); }
            if (this.pollingIntervalId) clearInterval(this.pollingIntervalId);
            if (this.mockIntervalId) clearInterval(this.mockIntervalId);

            document.querySelector('.status-indicator').classList.remove('active');
            document.querySelector('.system-status span').textContent = "Connecting...";
            document.querySelector('.status-indicator').style.backgroundColor = "var(--warning)";

            if (this.mode === 'WEBSOCKET') {
                this.connectWebSocket();
            } else if (this.mode === 'REST') {
                this.startRestPolling();
            } else {
                this.startMockData();
            }
        }

        connectWebSocket() {
            console.log(`Attempting to connect to hardware via WebSocket at ${this.websocketUrl}...`);
            try {
                this.ws = new WebSocket(this.websocketUrl);

                this.ws.onopen = () => {
                    console.log("Hardware connected successfully.");
                    document.querySelector('.status-indicator').classList.add('active');
                    document.querySelector('.status-indicator').style.backgroundColor = "var(--success)";
                    document.querySelector('.system-status span').textContent = "Hardware Connected";
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.updateDashboard(data);
                    } catch (e) {
                        console.error("Error parsing hardware data:", e);
                    }
                };

                this.ws.onclose = () => {
                    console.warn(`Hardware disconnected from ${this.websocketUrl}. Reconnecting in 5s...`);
                    document.querySelector('.status-indicator').classList.remove('active');
                    document.querySelector('.status-indicator').style.backgroundColor = "var(--danger)";
                    document.querySelector('.system-status span').textContent = "Connection Lost (Click to Edit)";
                    setTimeout(() => { if(this.mode === 'WEBSOCKET') this.connectWebSocket(); }, 5000);
                };
                
                this.ws.onerror = (error) => {
                    console.error("WebSocket Error:", error);
                    // onclose will handle reconnection
                };
            } catch (err) {
                console.error("Invalid WebSocket URL:", err);
                document.querySelector('.status-indicator').style.backgroundColor = "var(--danger)";
                document.querySelector('.system-status span').textContent = "Invalid IP (Click to Edit)";
            }
        }

        startRestPolling() {
            console.log("Starting REST polling to hardware...");
            document.querySelector('.status-indicator').classList.add('active');
            document.querySelector('.status-indicator').style.backgroundColor = "var(--success)";
            document.querySelector('.system-status span').textContent = "Polling Hardware";

            const poll = async () => {
                try {
                    const response = await fetch(this.restEndpoint);
                    if (!response.ok) throw new Error("Hardware unavailable");
                    const data = await response.json();
                    this.updateDashboard(data);
                } catch (error) {
                    console.error("REST Polling Error:", error);
                }
            };
            poll();
            this.pollingIntervalId = setInterval(poll, this.pollingInterval);
        }

        startMockData() {
            console.log("Running in MOCK mode. No hardware connected.");
            document.querySelector('.status-indicator').classList.add('active');
            document.querySelector('.status-indicator').style.backgroundColor = "var(--primary)";
            document.querySelector('.system-status span').textContent = "Mock Data (Click to Edit)";

            let mockTemp = 22.4, mockTurb = 1.2, mockTds = 145, mockPh = 7.2;

            this.mockIntervalId = setInterval(() => {
                mockTemp += Math.random() * 0.16 - 0.08;
                mockTurb += Math.random() * 0.06 - 0.03;
                mockTds += Math.random() * 4 - 2;
                mockPh += Math.random() * 0.03 - 0.015;

                this.updateDashboard({
                    temperature: mockTemp,
                    turbidity: Math.max(0, mockTurb),
                    tds: Math.max(0, mockTds),
                    ph: Math.min(14, Math.max(0, mockPh))
                });
            }, this.pollingInterval);
        }

        mergeSample(data) {
            const n = normalizeTelemetry(data);
            const m = { ...this.lastSample };
            if (n.temperature !== undefined) m.temperature = n.temperature;
            if (n.turbidity !== undefined) m.turbidity = n.turbidity;
            if (n.tds !== undefined) m.tds = n.tds;
            if (n.ph !== undefined) m.ph = n.ph;
            this.lastSample = m;
            return m;
        }

        updateDashboard(data) {
            const live = this.mergeSample(data);

            const updateMetric = (el, value, suffix, decimals = 1) => {
                if (value === undefined || value === null) return;
                const num = parseFloat(value);
                if (!Number.isFinite(num)) return;
                const formatted = num.toFixed(decimals);
                const currentNum = parseFloat(el.textContent);
                const prev = Number.isFinite(currentNum) ? currentNum.toFixed(decimals) : null;
                if (formatted !== prev) {
                    el.innerHTML = `${formatted}<span class="unit">${suffix}</span>`;
                    el.classList.remove('value-update');
                    void el.offsetWidth;
                    el.classList.add('value-update');
                }
            };

            updateMetric(this.ui.temp, live.temperature, '°C');
            updateMetric(this.ui.turb, live.turbidity, 'NTU', 2);
            updateMetric(this.ui.tds, live.tds, 'ppm', 0);

            if (live.ph !== undefined && live.ph !== null) {
                const phFormatted = live.ph.toFixed(2);
                const phCurrent = parseFloat(this.ui.ph.textContent).toFixed(2);
                if (phFormatted !== phCurrent) {
                    this.ui.ph.textContent = phFormatted;
                    this.ui.ph.classList.remove('value-update');
                    void this.ui.ph.offsetWidth;
                    this.ui.ph.classList.add('value-update');
                }
            }

            if (live.temperature !== undefined) {
                pushLiveChartSample({ ...live, time: new Date() });

                this.analyzeWaterQuality({
                    temp: live.temperature,
                    turb: live.turbidity,
                    tds: live.tds,
                    ph: live.ph
                });
            }
        }

        analyzeWaterQuality(metrics) {
            const listEl = document.getElementById('ai-insights-list');
            if (!listEl) return;
            
            let insights = [];
            
            // Temperature analysis
            if (metrics.temp < 15) {
                insights.push({ type: 'warning', title: 'Low Temperature Alert', desc: `Water is unusually cold (${metrics.temp.toFixed(1)}°C).` });
            } else if (metrics.temp > 30) {
                insights.push({ type: 'warning', title: 'High Temperature Alert', desc: `Water is unusually warm (${metrics.temp.toFixed(1)}°C). Elevated risk of bacterial growth.` });
            }

            // pH analysis
            if (metrics.ph < 6.5) {
                insights.push({ type: 'warning', title: 'Acidic Water Detected', desc: `pH level dropped to ${metrics.ph.toFixed(2)}. Heavy metal leaching risk is elevated.` });
            } else if (metrics.ph > 8.5) {
                insights.push({ type: 'warning', title: 'Alkaline Water Detected', desc: `pH level rose to ${metrics.ph.toFixed(2)}. Hard water scale buildup is highly likely.` });
            }
            
            // Turbidity analysis
            if (metrics.turb > 5.0) {
                insights.push({ type: 'warning', title: 'Critical Turbidity', desc: `Water clarity is extremely poor (${metrics.turb.toFixed(2)} NTU). Immediate physical filter check required.` });
            } else if (metrics.turb > 2.0) {
                insights.push({ type: 'warning', title: 'Elevated Turbidity', desc: `Minor sediment spike detected (${metrics.turb.toFixed(2)} NTU).` });
            }
            
            // TDS analysis
            if (metrics.tds > 500) {
                insights.push({ type: 'warning', title: 'TDS Threshold Exceeded', desc: `Dissolved solids are very high (${Math.round(metrics.tds)} ppm). Osmosis membrane may be failing.` });
            }
            
            // If no issues, show optimal state
            if (insights.length === 0) {
                insights.push({ type: 'normal', title: 'Optimal Conditions', desc: 'All telemetry metrics indicate premium water purity. No physical or chemical anomalies detected by the system.' });
            } else {
                // Limit to top 2 most urgent insights
                insights = insights.slice(0, 2);
            }
            
            // Update the DOM
            listEl.innerHTML = insights.map(i => `
                <div class="insight-item ${i.type}">
                    <i class="ph ${i.type === 'normal' ? 'ph-check-circle' : 'ph-warning-circle'} insight-icon"></i>
                    <div class="insight-content">
                        <h4>${i.title}</h4>
                        <p>${i.desc}</p>
                    </div>
                </div>
            `).join('');
        }
    }

    // Start the connection manager
    const hardwareTracker = new HardwareConnection();

    // ==========================================
    // SPA ROUTING & UI INTERACTIONS
    // ==========================================
    const navItems = document.querySelectorAll('.nav-item');
    const pageSections = document.querySelectorAll('.page-section');
    const mainTitle = document.getElementById('main-title');
    const mainSubtitle = document.getElementById('main-subtitle');

    const pageTitles = {
        'analytics': { title: 'Live Analytics', subtitle: 'Real-time telemetry and anomaly detection' },
        'history': { title: 'History & Logs', subtitle: 'Historical sensor data and exportable reports' },
        'about': { title: 'About AquaIntelX', subtitle: 'System architecture and mission' },
        'contact': { title: 'Contact Support', subtitle: 'Technical support and hardware requests' }
    };

    // ==========================================
    // MOBILE NAV TOGGLE
    // ==========================================
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const mobileOverlay = document.getElementById('mobile-overlay');

    const toggleMenu = () => {
        sidebar.classList.toggle('open');
        mobileOverlay.classList.toggle('open');
    };

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMenu);
        closeSidebarBtn.addEventListener('click', toggleMenu);
        mobileOverlay.addEventListener('click', toggleMenu);
    }

    // Handle navigation interaction
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const targetId = item.getAttribute('data-target');
            if (!targetId) return; 

            e.preventDefault();
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            pageSections.forEach(section => {
                section.classList.remove('active');
            });
            document.getElementById(targetId).classList.add('active');

            if(pageTitles[targetId]) {
                mainTitle.textContent = pageTitles[targetId].title;
                mainSubtitle.textContent = pageTitles[targetId].subtitle;
            }

            // Closes menu nicely on mobile after selection
            if(window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });

    // Handle explicit log out
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('isAuthenticated');
        });
    }

    // Form submission simulation
    const contactForm = document.getElementById('contactForm');
    if(contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('.submit-btn');
            const originalText = btn.textContent;
            btn.innerHTML = '<i class="ph ph-spinner-gap" style="animation: spin 1s linear infinite;"></i> Sending...';
            
            setTimeout(() => {
                btn.innerHTML = '<i class="ph ph-check"></i> Sent Successfully';
                btn.style.backgroundColor = 'var(--success)';
                btn.style.boxShadow = '0 0 15px rgba(16, 185, 129, 0.4)';
                contactForm.reset();
                
                setTimeout(() => {
                    btn.textContent = originalText;
                    btn.style.backgroundColor = '';
                    btn.style.boxShadow = '';
                }, 3000);
            }, 1500);
        });
    }
});
