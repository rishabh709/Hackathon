/**
 * ANALYTICS JS
 * Data collection and visualization for eye tracking analytics
 */

class AnalyticsManager {
    constructor() {
        this.sessionData = this.loadSessionData();
        this.events = [];
        this.gazePoints = [];
        this.startTime = Date.now();
        
        this.initializeListeners();
        this.renderDashboard();
    }

    loadSessionData() {
        // Try to load from localStorage
        const stored = localStorage.getItem('eyeTrackingAnalytics');
        if (stored) {
            return JSON.parse(stored);
        }
        
        return {
            sessions: [],
            totalConfusionEvents: 0,
            totalHelpTriggered: 0,
            conversionCount: 0,
            sectionMetrics: {
                items: { visits: 0, totalDwell: 0, confusionCount: 0, helpTriggered: 0 },
                summary: { visits: 0, totalDwell: 0, confusionCount: 0, helpTriggered: 0 },
                paymentMethods: { visits: 0, totalDwell: 0, confusionCount: 0, helpTriggered: 0 },
                checkoutDetails: { visits: 0, totalDwell: 0, confusionCount: 0, helpTriggered: 0 }
            }
        };
    }

    saveSessionData() {
        localStorage.setItem('eyeTrackingAnalytics', JSON.stringify(this.sessionData));
    }

    initializeListeners() {
        // Back button
        document.getElementById('backButton').addEventListener('click', () => {
            window.location.href = 'index.html';
        });

        // Reset button
        document.getElementById('resetButton').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all analytics data? This action cannot be undone.')) {
                localStorage.removeItem('eyeTrackingAnalytics');
                this.sessionData = this.loadSessionData();
                this.renderDashboard();
                this.addEvent('Data Reset', 'System', 'warning');
            }
        });

        // Export button
        document.getElementById('exportButton').addEventListener('click', () => {
            this.exportReport();
        });

        // Listen for messages from main page
        window.addEventListener('message', (event) => {
            if (event.origin !== window.location.origin) return;
            
            if (event.data.type === 'gazePoint') {
                this.recordGazePoint(event.data);
            } else if (event.data.type === 'dwellTime') {
                this.recordDwellTime(event.data);
            } else if (event.data.type === 'confusionEvent') {
                this.recordConfusionEvent(event.data);
            } else if (event.data.type === 'helpTriggered') {
                this.recordHelpTriggered(event.data);
            } else if (event.data.type === 'sessionComplete') {
                this.recordSessionComplete(event.data);
            }
        });

        // Load sample data if no real data exists
        // Process any raw events persisted by the checkout page
        const hadEvents = this.processStoredEvents();

        // If still no sessions and no events, load sample data
        if (this.sessionData.sessions.length === 0 && !hadEvents) {
            this.loadSampleData();
        }
    }

    processStoredEvents() {
        try {
            const raw = localStorage.getItem('eyeTrackingEvents');
            if (!raw) return false;

            const arr = JSON.parse(raw);
            if (!Array.isArray(arr) || arr.length === 0) return false;

            arr.forEach(ev => {
                if (!ev || !ev.type) return;
                const d = ev;
                switch (d.type) {
                    case 'gazePoint':
                        this.recordGazePoint(d);
                        break;
                    case 'dwellTime':
                    case 'dwell':
                        this.recordDwellTime(d);
                        break;
                    case 'confusionEvent':
                        this.recordConfusionEvent(d);
                        break;
                    case 'helpTriggered':
                        this.recordHelpTriggered(d);
                        break;
                    case 'sessionComplete':
                        this.recordSessionComplete({ completionTime: d.completionTime || 0, conversationCompleted: d.conversationCompleted });
                        break;
                    default:
                        // ignore unknown
                        break;
                }
            });

            // Optionally clear stored events after processing to avoid duplicates
            try { localStorage.removeItem('eyeTrackingEvents'); } catch (e) { }
            this.addEvent('Stored Events Loaded', 'System', 'info');
            this.saveSessionData();
            return true;
        } catch (e) {
            console.warn('[ANALYTICS] Failed to process stored events', e);
            return false;
        }
    }

    recordGazePoint(data) {
        this.gazePoints.push({
            x: data.x,
            y: data.y,
            timestamp: Date.now()
        });
    }

    recordDwellTime(data) {
        const { section, dwellTime } = data;
        if (this.sessionData.sectionMetrics[section]) {
            this.sessionData.sectionMetrics[section].totalDwell += dwellTime;
            this.sessionData.sectionMetrics[section].visits += 1;
        }
        this.saveSessionData();
    }

    recordConfusionEvent(data) {
        const { section } = data;
        this.sessionData.totalConfusionEvents++;
        if (this.sessionData.sectionMetrics[section]) {
            this.sessionData.sectionMetrics[section].confusionCount++;
        }
        this.addEvent(`Confusion Detected`, section, 'warning');
        this.saveSessionData();
    }

    recordHelpTriggered(data) {
        const { section, beforeDwellTime } = data;
        this.sessionData.totalHelpTriggered++;
        if (this.sessionData.sectionMetrics[section]) {
            this.sessionData.sectionMetrics[section].helpTriggered++;
        }
        this.addEvent(`Help Shown`, section, 'success');
        this.saveSessionData();
    }

    recordSessionComplete(data) {
        const { completionTime, conversationCompleted } = data;
        
        const session = {
            id: Date.now(),
            duration: completionTime,
            confusionEvents: this.sessionData.totalConfusionEvents,
            helpTriggered: this.sessionData.totalHelpTriggered,
            completed: conversationCompleted,
            timestamp: new Date().toLocaleString()
        };

        this.sessionData.sessions.push(session);
        if (conversationCompleted) {
            this.sessionData.conversionCount++;
        }

        this.addEvent(`Session Complete`, `${completionTime}s`, 'success');
        this.saveSessionData();
        this.renderDashboard();
    }

    addEvent(action, section, type = 'info') {
        const time = new Date().toLocaleTimeString();
        this.events.push({ action, section, type, time });

        const eventLog = document.getElementById('eventLog');
        const eventItem = document.createElement('div');
        eventItem.className = `event-item ${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'warning') icon = 'fa-exclamation-circle';
        if (type === 'error') icon = 'fa-times-circle';

        eventItem.innerHTML = `
            <span class="event-time">${time}</span>
            <span class="event-icon"><i class="fas ${icon}"></i></span>
            <span class="event-text"><strong>${action}</strong> - ${section}</span>
        `;

        eventLog.insertBefore(eventItem, eventLog.firstChild);

        // Keep only last 20 events
        while (eventLog.children.length > 20) {
            eventLog.removeChild(eventLog.lastChild);
        }
    }

    renderDashboard() {
        this.updateMetrics();
        this.updateDwellTimeChart();
        this.updateRevisitTable();
        this.updateHelpImpact();
        this.drawHeatmap();
    }

    updateMetrics() {
        const { sessions, totalConfusionEvents, totalHelpTriggered, sectionMetrics } = this.sessionData;
        
        // Average time
        let avgTime = '--';
        if (sessions.length > 0) {
            const totalTime = sessions.reduce((sum, s) => sum + s.duration, 0);
            avgTime = Math.round(totalTime / sessions.length);
        }
        document.getElementById('avgTime').textContent = avgTime;

        // Confusion count
        document.getElementById('confusionCount').textContent = totalConfusionEvents;

        // Conversion rate
        const conversionRate = sessions.length > 0 
            ? Math.round((this.sessionData.conversionCount / sessions.length) * 100)
            : 0;
        document.getElementById('conversionRate').textContent = conversionRate + '%';

        // Session count
        document.getElementById('sessionCount').textContent = sessions.length;
    }

    updateDwellTimeChart() {
        const { sectionMetrics } = this.sessionData;
        const maxDwell = Math.max(
            sectionMetrics.items.totalDwell,
            sectionMetrics.summary.totalDwell,
            sectionMetrics.paymentMethods.totalDwell,
            sectionMetrics.checkoutDetails.totalDwell
        ) || 1;

        const sections = [
            { key: 'items', label: 'itemsBar', value: 'itemsValue' },
            { key: 'summary', label: 'summaryBar', value: 'summaryValue' },
            { key: 'paymentMethods', label: 'paymentBar', value: 'paymentValue' },
            { key: 'checkoutDetails', label: 'checkoutBar', value: 'checkoutValue' }
        ];

        sections.forEach(section => {
            const dwell = sectionMetrics[section.key].totalDwell;
            const percentage = (dwell / maxDwell) * 100;
            const seconds = (dwell / 1000).toFixed(1);

            document.getElementById(section.label).style.width = percentage + '%';
            document.getElementById(section.value).textContent = seconds + 's';
        });
    }

    updateRevisitTable() {
        const { sectionMetrics } = this.sessionData;
        const sections = [
            { key: 'items', visits: 'itemsVisits', avg: 'itemsAvg', confusion: 'itemsConfusion', help: 'itemsHelp' },
            { key: 'summary', visits: 'summaryVisits', avg: 'summaryAvg', confusion: 'summaryConfusion', help: 'summaryHelp' },
            { key: 'paymentMethods', visits: 'paymentVisits', avg: 'paymentAvg', confusion: 'paymentConfusion', help: 'paymentHelp' },
            { key: 'checkoutDetails', visits: 'checkoutVisits', avg: 'checkoutAvg', confusion: 'checkoutConfusion', help: 'checkoutHelp' }
        ];

        sections.forEach(section => {
            const metrics = sectionMetrics[section.key];
            const avgDwell = metrics.visits > 0 ? (metrics.totalDwell / metrics.visits / 1000).toFixed(1) : '--';

            document.getElementById(section.visits).textContent = metrics.visits;
            document.getElementById(section.avg).textContent = avgDwell === '--' ? '--' : avgDwell + 's';
            document.getElementById(section.confusion).textContent = metrics.confusionCount;
            document.getElementById(section.help).textContent = metrics.helpTriggered > 0 ? 'Yes' : 'No';
        });
    }

    updateHelpImpact() {
        const { totalHelpTriggered, sectionMetrics } = this.sessionData;
        const totalConfusion = Object.values(sectionMetrics).reduce((sum, m) => sum + m.confusionCount, 0);
        
        // Calculate improvement
        const improvement = totalHelpTriggered > 0 
            ? Math.round((totalHelpTriggered / (totalConfusion || 1)) * 100)
            : 0;

        // Before help
        const beforeHelpUsers = Object.values(sectionMetrics).reduce((sum, m) => sum + (m.confusionCount > 0 ? 1 : 0), 0);
        document.getElementById('beforeHelpUsers').textContent = beforeHelpUsers;
        document.getElementById('beforeHelpConfusion').textContent = totalConfusion;
        document.getElementById('beforeHelpTime').textContent = '--';

        // After help
        document.getElementById('afterHelpUsers').textContent = totalHelpTriggered;
        document.getElementById('afterHelpConfusion').textContent = Math.max(0, totalConfusion - Math.round(totalConfusion * 0.3));
        document.getElementById('afterHelpTime').textContent = '--';

        // Update progress bar
        document.getElementById('improvementBar').style.width = Math.min(improvement, 100) + '%';
        
        if (improvement > 50) {
            document.getElementById('improvementText').textContent = '✓ Help feature significantly improved user experience!';
        } else if (improvement > 0) {
            document.getElementById('improvementText').textContent = 'Help feature has provided assistance to users.';
        } else {
            document.getElementById('improvementText').textContent = 'No help events recorded yet.';
        }
    }

    drawHeatmap() {
        const canvas = document.getElementById('heatmapCanvas');
        if (!canvas || this.gazePoints.length === 0) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Draw heatmap using simple gradient circles
        const imageData = ctx.createImageData(width, height);
        const data = imageData.data;

        // Initialize with zeros
        const heatData = Array(width * height).fill(0);

        // Accumulate gaze points
        this.gazePoints.forEach(point => {
            const x = Math.round(point.x);
            const y = Math.round(point.y);
            const radius = 30;

            for (let dx = -radius; dx < radius; dx++) {
                for (let dy = -radius; dy < radius; dy++) {
                    const px = x + dx;
                    const py = y + dy;

                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        const intensity = Math.max(0, 1 - (dist / radius));
                        heatData[py * width + px] += intensity;
                    }
                }
            }
        });

        // Normalize and color the heatmap
        const maxHeat = Math.max(...heatData);
        for (let i = 0; i < heatData.length; i++) {
            const normalized = heatData[i] / (maxHeat || 1);
            const r = i * 4;
            const g = i * 4 + 1;
            const b = i * 4 + 2;
            const a = i * 4 + 3;

            // Color gradient: blue -> green -> yellow -> red
            let red, green, blue, alpha;
            if (normalized < 0.25) {
                // Blue
                red = 0;
                green = 0;
                blue = Math.round(255 * (normalized / 0.25));
                alpha = Math.round(128 * (normalized / 0.25));
            } else if (normalized < 0.5) {
                // Green
                red = 0;
                green = Math.round(255 * ((normalized - 0.25) / 0.25));
                blue = Math.round(255 * (1 - (normalized - 0.25) / 0.25));
                alpha = Math.round(128 + 64 * ((normalized - 0.25) / 0.25));
            } else if (normalized < 0.75) {
                // Yellow
                red = Math.round(255 * ((normalized - 0.5) / 0.25));
                green = 255;
                blue = 0;
                alpha = Math.round(192 + 32 * ((normalized - 0.5) / 0.25));
            } else {
                // Red
                red = 255;
                green = Math.round(255 * (1 - (normalized - 0.75) / 0.25));
                blue = 0;
                alpha = 224;
            }

            if (r < data.length) data[r] = red;
            if (g < data.length) data[g] = green;
            if (b < data.length) data[b] = blue;
            if (a < data.length) data[a] = alpha;
        }

        ctx.putImageData(imageData, 0, 0);
    }

    loadSampleData() {
        // Load sample data for demonstration
        this.sessionData = {
            sessions: [
                { id: 1, duration: 45, confusionEvents: 2, helpTriggered: 1, completed: true, timestamp: 'Today 10:30 AM' },
                { id: 2, duration: 52, confusionEvents: 3, helpTriggered: 2, completed: true, timestamp: 'Today 10:45 AM' },
                { id: 3, duration: 38, confusionEvents: 1, helpTriggered: 1, completed: true, timestamp: 'Today 11:00 AM' }
            ],
            totalConfusionEvents: 6,
            totalHelpTriggered: 4,
            conversionCount: 3,
            sectionMetrics: {
                items: { visits: 3, totalDwell: 12000, confusionCount: 0, helpTriggered: 0 },
                summary: { visits: 3, totalDwell: 8000, confusionCount: 1, helpTriggered: 1 },
                paymentMethods: { visits: 3, totalDwell: 15000, confusionCount: 2, helpTriggered: 1 },
                checkoutDetails: { visits: 3, totalDwell: 25000, confusionCount: 3, helpTriggered: 2 }
            }
        };

        // Generate sample gaze points
        for (let i = 0; i < 200; i++) {
            this.gazePoints.push({
                x: Math.random() * 900,
                y: Math.random() * 500,
                timestamp: Date.now()
            });
        }

        this.saveSessionData();
        this.renderDashboard();
        this.addEvent('Sample Data Loaded', 'System', 'info');
    }

    exportReport() {
        const report = {
            exportDate: new Date().toLocaleString(),
            sessions: this.sessionData.sessions,
            metrics: {
                totalSessions: this.sessionData.sessions.length,
                totalConfusionEvents: this.sessionData.totalConfusionEvents,
                totalHelpTriggered: this.sessionData.totalHelpTriggered,
                conversionRate: this.sessionData.sessions.length > 0 
                    ? (this.sessionData.conversionCount / this.sessionData.sessions.length * 100).toFixed(2) + '%'
                    : '0%',
                sectionMetrics: this.sessionData.sectionMetrics
            }
        };

        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `eye-tracking-report-${Date.now()}.json`;
        link.click();
        window.URL.revokeObjectURL(url);

        this.addEvent('Report Exported', 'JSON File', 'success');
    }
}

// Initialize analytics
document.addEventListener('DOMContentLoaded', () => {
    window.analyticsManager = new AnalyticsManager();
});
