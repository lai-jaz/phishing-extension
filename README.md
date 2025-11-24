# Phishing Detection Browser Extension

A lightweight browser extension that detects suspicious or potentially malicious websites using URL analysis and heuristic checks. This tool helps users stay safe by alerting them when a website exhibits common phishing characteristics.

---

## Features

- **Real‑time URL Analysis**  
  Automatically checks the current tab’s URL for phishing indicators.

- **Suspicious URL Detection**  
  Flags URLs that match phishing patterns such as:
  - Overly long URLs
  - IP‑based URLs
  - Special‑character–encoded URLs
  - Brand impersonation (e.g., "faceb00k", "g00gle")
  - Unusual or suspicious domain structures

- **Alerts & Warnings**  
  Displays a clear warning when a suspicious site is detected.

- **Privacy‑Friendly**  
  No tracking, data storage, or external requests.

---

## Installation (Developer Mode)
### Chrome / Edge
1. Open `chrome://extensions`
2. Enable **Developer Mode**
3. Click **Load unpacked**
4. Select your project folder
## How It Works

The extension uses multiple detection strategies to classify URLs:

- URL length heuristics  
- Suspicious keyword detection  
- Brand‑spoofing patterns  
- IP address in place of domain  
- Encoded/special characters  
- Excessive subdomains  
- Typo‑squatting (e.g., letter swapping or repetition)

If any checks match known phishing indicators, the extension flags the page as **Suspicious**.

---


