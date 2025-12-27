# Eye Tracking Assistant - New Features

## Features Added

### 1. **Consent Modal** ✅
- Clear, user-friendly modal that appears on first interaction
- Explains that camera is used to detect eye gaze
- Explicitly states: "No images are stored"
- Option to disable anytime
- Users must consent before tracking begins
- **Files modified**: `index.html`, `style.css`, `script.js`

### 2. **Dwell Time Tracking** ✅
- Tracks how long users spend looking at each section
- Measures total cumulative dwell time per section
- Logged to console for debugging: `[DWELL] section: Xs total`
- Used to trigger struggle detection
- **Threshold**: 5 seconds for struggle detection
- **Files modified**: `script.js`

### 3. **Revisit Count** ✅
- Counts how many times a user returns to each section
- Useful indicator of user confusion or interest
- Logged to console: `[REVISIT] section: X visits`
- Triggers auto-expand when threshold reached + struggle detected
- **Threshold**: 2+ revisits
- **Files modified**: `script.js`

### 4. **Auto-Expand Collapsed Sections** ✅
- Automatically shows helpful tooltips when user struggles
- Triggers when:
  - User spends 5+ seconds on a section (struggle detected)
  - AND user has revisited 2+ times
- Highlights the section with a visual indicator (red outline for 3 seconds)
- Provides contextual help for different sections:
  - Items: Product information guidance
  - Summary: Order total breakdown guidance
  - Payment Methods: Payment option guidance
  - Checkout Details: Field-by-field input guidance
- **Files modified**: `script.js`, `style.css`

### 5. **Human Escalation** ✅
- Purple button in bottom-left: "Would you like to chat with our team?"
- Provides helpful guidance when clicked:
  - How to hover over form fields
  - Information about auto-expand features
  - Support email contact
- Non-intrusive, always accessible
- **Files modified**: `index.html`, `style.css`, `script.js`

### 6. **Eye Tracking Indicator** ✅
- Green eye icon in bottom-right corner
- **States**:
  - Gray = Tracking Off
  - Green = Tracking Active
- **Interactive**: Click to pause/resume tracking
- Visual feedback on hover (scales up)
- Tooltip: "Click to pause tracking" / "Click to resume tracking"
- Box shadow effect indicates active state
- **Files modified**: `index.html`, `style.css`, `script.js`

---

## Technical Details

### New State Variables (script.js)
- `isTrackingActive` - Boolean to pause/resume tracking
- `consentGiven` - Boolean to track consent status
- `dwellTimeMap` - Map storing dwell time per section
- `revisitCountMap` - Map counting visits per section
- `strugglingMap` - Map marking sections where user struggles

### New Constants (script.js)
- `REVISIT_THRESHOLD = 2` - Visits before auto-expand triggers
- `STRUGGLE_DWELL_TIME = 5000` - Milliseconds before struggle detected

### New Functions (script.js)
- `initConsentModal()` - Initialize consent flow
- `startTrackingInit()` - Begin tracking after consent
- `trackDwellTime(section, dwellTime)` - Log dwell time
- `trackRevisit(section)` - Count section visits
- `detectStruggle(section)` - Identify user confusion
- `autoExpandSection(section)` - Show help automatically
- `highlightSection(section)` - Visual feedback

### New Styles (style.css)
- `.modal-overlay` - Consent modal backdrop
- `.modal-content` - Modal dialog box
- `.btn-accept` / `.btn-decline` - Modal buttons
- `.tracking-indicator` - Eye icon in corner
- `.escalate-btn` - Human escalation button

---

## User Flow

1. **Page Load** → Consent modal appears
2. **User Clicks "I Agree"** → Modal closes, ready for tracking
3. **Click Start Button** → Eye tracking begins
4. **Eye Indicator Turns Green** → Tracking active
5. **User Looks at Sections** → Dwell time tracked
6. **User Leaves & Returns** → Revisit count incremented
7. **5+ Sec Dwell + 2+ Revisits** → Auto-expand triggers
8. **Helpful Tooltips Appear** → Section highlighted
9. **Click Eye Icon** → Pause/Resume tracking anytime
10. **Click Team Button** → Get human support options

---

## Testing Checklist

- [ ] Consent modal appears on page load
- [ ] Modal buttons (Accept/Decline) work correctly
- [ ] Tracking starts after consent given
- [ ] Eye indicator shows correct state (gray/green)
- [ ] Eye indicator pause/resume works
- [ ] Dwell time logs appear in console
- [ ] Revisit count logs appear in console
- [ ] Auto-expand triggers after struggle threshold
- [ ] Tooltips display correctly for each section
- [ ] Section highlighting works (red outline)
- [ ] Human escalation button shows message
- [ ] No images stored or transmitted
