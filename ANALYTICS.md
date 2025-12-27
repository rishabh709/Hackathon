# Analytics Dashboard - Testing Page

## Overview
A comprehensive analytics dashboard has been created to track and visualize eye-tracking data from the checkout interface. The dashboard displays real-time metrics, heatmaps, and impact analysis of the help features.

## Files Created

### 1. **analytics.html** (241 lines)
Main analytics dashboard page with multiple sections:

#### Sections:
- **Key Performance Metrics** - 4 cards showing:
  - Average time to complete payment
  - Confusion events triggered
  - Conversion rate
  - Total sessions tracked

- **Gaze Heatmap Visualization**
  - Interactive canvas-based heatmap
  - Shows where users looked most during checkout
  - Color gradient (cold → hot) indicates gaze intensity
  - Legend explaining color meanings

- **Help Impact Analysis**
  - Before/After comparison cards
  - Shows metrics before help is shown vs. after
  - Progress indicator for improvement metrics
  - Quantifies impact of auto-help feature

- **Dwell Time by Section**
  - Bar charts for each section (Items, Summary, Payment, Checkout)
  - Visual representation of time spent per section
  - Sortable and comparative view

- **Revisit Analysis Table**
  - Detailed table with columns:
    - Section name
    - Total visits count
    - Average dwell time
    - Confusion events
    - Help triggered (Yes/No)

- **Event Timeline/Log**
  - Real-time event log showing:
    - Timestamps
    - Event type (Confusion, Help, Session Complete)
    - Section information
  - Color-coded by event type (success, warning, info)
  - Scrollable with max 20 recent events

#### Header Controls:
- Back to Checkout button
- Reset Data button (with confirmation)
- Export Report button (downloads JSON)

---

### 2. **analytics.css** (359 lines)
Complete styling for the analytics dashboard:

#### Key Features:
- Modern gradient backgrounds (purple/blue theme)
- Responsive grid layouts
- Metric cards with hover effects
- Styled data tables
- Progress bars and charts
- Color-coded event indicators
- Mobile-responsive design

#### Color Scheme:
- Primary: #667eea (purple-blue)
- Secondary: #764ba2 (deep purple)
- Success: #1ed637 (green)
- Warning: #ff9800 (orange)
- Background: Gradient from light to medium blue

---

### 3. **analytics.js** (361 lines)
JavaScript class `AnalyticsManager` handling all data collection and visualization:

#### Key Features:

**Data Management:**
- `loadSessionData()` - Load from localStorage
- `saveSessionData()` - Persist analytics data
- `recordGazePoint()` - Track eye gaze coordinates
- `recordDwellTime()` - Log time spent per section
- `recordConfusionEvent()` - Track confusion triggers
- `recordHelpTriggered()` - Log when help is shown
- `recordSessionComplete()` - Save complete session data

**Visualization:**
- `drawHeatmap()` - Render gaze intensity heatmap using canvas
- `updateMetrics()` - Update KPI cards
- `updateDwellTimeChart()` - Draw section dwell bar charts
- `updateRevisitTable()` - Populate analytics table
- `updateHelpImpact()` - Calculate before/after metrics
- `renderDashboard()` - Refresh all visualizations

**Utilities:**
- `addEvent()` - Log event to timeline
- `exportReport()` - Download JSON report
- `loadSampleData()` - Pre-load demo data for testing

**Message Bridge:**
- Listens for messages from main checkout page
- Handles: gazePoint, dwellTime, confusionEvent, helpTriggered, sessionComplete

---

## How It Works

### Data Flow:

1. **Main Page (index.html)** → Collects eye-tracking data
2. **script.js** → Sends analytics events via `sendAnalyticsEvent()`
3. **window.postMessage()** → Communicates between pages
4. **analytics.js** → Receives and processes events
5. **localStorage** → Persists data between sessions
6. **analytics.html** → Displays visualizations

### Heatmap Generation:
- Accumulates gaze points with gaussian blur effect
- Normalizes intensity values
- Maps to color gradient (blue → green → yellow → red)
- Renders on canvas overlay

### Metrics Calculation:
- **Average Time**: Sum of session durations / session count
- **Conversion Rate**: Completed sessions / total sessions × 100
- **Dwell Time**: Cumulative time per section
- **Confusion Events**: Count of detected confusion triggers
- **Help Impact**: Percentage improvement after help shown

---

## Access Points

### From Checkout Page:
1. **New Analytics Icon** (bottom-right, below eye indicator)
   - Purple chart icon
   - Opens analytics.html in new tab
   - Always accessible

2. **Direct URL**: 
   - Navigate to `analytics.html` directly
   - Opens standalone dashboard

### Navigation:
- "Back to Checkout" button returns to main page
- "Reset Data" clears all stored analytics
- "Export Report" downloads JSON file with all data

---

## Features

✅ **Heatmap Visualization**
- Interactive canvas-based rendering
- Color-coded intensity levels
- Shows gaze concentration areas
- Real-time updates as data comes in

✅ **Performance Metrics**
- Average completion time
- Confusion event tracking
- Conversion rate before/after help
- Session count monitoring

✅ **Impact Analysis**
- Before/After comparison cards
- Improvement percentage indicator
- Help effectiveness metrics
- User assistance statistics

✅ **Detailed Analytics**
- Per-section dwell time breakdown
- Revisit count analysis
- Confusion event per section
- Help trigger status

✅ **Event Logging**
- Real-time event timeline
- Colored event indicators
- Timestamp tracking
- Event type categorization

✅ **Data Management**
- localStorage persistence
- Export to JSON format
- Reset functionality
- Sample data for testing

---

## Sample Data

The dashboard includes a `loadSampleData()` function that pre-loads demonstration data if no real data exists:

**Sample Metrics:**
- 3 sessions tracked
- 6 total confusion events
- 4 help triggers
- 3 conversions (100% conversion rate)
- Avg. completion time: 45 seconds

**Section Breakdown:**
- Items: 12s dwell (0 confusion)
- Summary: 8s dwell (1 confusion, 1 help)
- Payment Methods: 15s dwell (2 confusion, 1 help)
- Checkout Details: 25s dwell (3 confusion, 2 helps)

---

## Integration with Main App

### Updates to script.js:

1. **New Function**: `sendAnalyticsEvent(type, data)`
   - Sends postMessage to analytics window
   - Graceful failure if window not open

2. **Analytics Link**: Button added to main page
   - Opens analytics dashboard
   - Positioned at bottom-right
   - Purple gradient styling

3. **Event Tracking**:
   - `trackDwellTime()` → sends dwellTime event
   - `detectSectionConfusion()` → sends confusionEvent
   - `autoExpandSection()` → sends helpTriggered

### Updates to style.css:

1. **Analytics Link Styling**
   - Fixed position, bottom-right
   - 50px circular button
   - Hover effects and animations
   - Positioned above eye indicator

---

## Testing Instructions

1. **Open Checkout Page**
   - Click "I Agree" on consent modal
   - Start eye tracking
   - Interact with checkout sections

2. **Open Analytics Dashboard**
   - Click purple chart icon (bottom-right of checkout page)
   - Or open `analytics.html` directly
   - Dashboard loads with sample data initially

3. **View Metrics**
   - Top cards show key metrics
   - Heatmap updates as gaze data arrives
   - Table shows section details
   - Timeline logs all events

4. **Test Features**
   - Export: Click "Export Report" to download JSON
   - Reset: Click "Reset Data" to clear stored data
   - Back: Click "Back to Checkout" to return

5. **Monitor in Real-Time**
   - Keep both pages open
   - Interact with checkout
   - Watch analytics update in real-time
   - Check browser console for debug logs

---

## Customization

### Thresholds (in analytics.js):
```javascript
// Modify these to adjust behavior:
const DWELL_TIME = 3000;           // 3 seconds
const CONFUSION_WINDOW = 3000;     // 3 seconds
const STRUGGLE_DWELL_TIME = 5000;  // 5 seconds
const EXTERNAL_HELP_TIME = 600000; // 10 minutes
const REVISIT_THRESHOLD = 2;       // 2 visits
```

### Heatmap Colors:
Edit `drawHeatmap()` in analytics.js to change color gradient

### Metrics:
All calculations in `updateMetrics()` and `updateHelpImpact()` functions

---

## Future Enhancements

Possible additions:
- Real-time charts with Chart.js
- User segmentation analysis
- A/B testing comparison
- Export to CSV/PDF
- Database integration
- User behavior predictions
- Session playback/replay
- Multi-user comparison
