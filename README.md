# PhishBait: Phishing Detection Browser Extension

**Group Members:** Tayyaba Tanveer 22L-7860, Laiba Ijaz 22L-7855, Fatima Khan 22L-7890 BSSE-7C

A browser extension that detects suspicious or potentially malicious websites in real-time using URL heuristics, blacklist checks, and Google Safe Browsing API. Unsafe websites are blocked, highlighted, and logged.

---

## Features

- **Real-time URL Scanning**  
  Automatically scans each tab’s URL after the page loads.

- **Suspicious URL Detection**  
  Flags URLs based on:
  - URL length > 75 characters
  - IP address used as domain
  - Suspicious TLDs (e.g., .tk, .ml, .cf)
  - Multiple hyphens in hostname
  - '@' symbol in URL
  - Excessive subdomains
  - Non-HTTPS URLs
  - Punycode domains
  - Suspicious keywords in path (login, secure, account, verify, update, password)

- **Blacklist Enforcement**  
  Automatically blocks blacklisted domains and redirects users to a safe page (Google).

- **Manual Scanning**  
  Users can enter a URL in the popup and scan it manually.

- **Logging**  
  All scans are logged with timestamp, URL, score, and status. Logs are viewable in the popup.

- **Visual Alerts**  
  Notifications for Suspicious, Dangerous, or Invalid URLs. Dangerous sites are highlighted with a red border.

- **Popup Interface**  
  Displays blocked URL count, logs, blacklist, and manual scan results.

---

## Installation (Developer Mode)

### Chrome / Edge
1. Open `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select your extension folder

---

## How It Works

- **Background Script (`background.js`)**  
  - Initializes storage with blacklist and logs  
  - Auto-scans URLs on tab updates  
  - Calculates URL risk scores using heuristics  
  - Checks Google Safe Browsing API  
  - Sends results to popup and content scripts  
  - Triggers notifications for unsafe URLs  
  - Handles manual scans

- **Popup (`popup.html`, `popup.js`, `popup.css`)**  
  - Displays blocked URL count  
  - Shows logs and blacklist in collapsible sections  
  - Allows manual URL scans and displays results

- **Manifest (`manifest.json`)**  
  - Defines permissions: storage, tabs, notifications, scripting, webRequest  
  - Registers background service worker  
  - Configures popup interface

---

## URL Scoring

| Criterion | Points |
|-----------|--------|
| URL length > 75 characters | 15 |
| IP address as domain | 20 |
| Suspicious TLDs (.tk, .ml, .ga, .cf, .xyz, .biz, .info, .top) | 15 |
| More than 1 hyphen in hostname | 10 |
| URL contains "@" | 15 |
| More than 3 subdomains | 10 |
| Non-HTTPS | 15 |
| Punycode domain | 20 |
| Suspicious keywords in path | 10 |

**Score Interpretation**:  
- Safe: < 40 points  
- Suspicious: 40–69 points  
- Dangerous: ≥ 70 points



