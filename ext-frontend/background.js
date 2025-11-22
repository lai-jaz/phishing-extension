let latestScanResult = null;

console.log("Background script loaded at:", new Date().toLocaleString());

chrome.storage.local.set({
    blacklist: ["phishing.com", "malicious.example", "scam-site.tk"],
    logs: []
}, () => {
    if (chrome.runtime.lastError) {
        console.error("Init error:", chrome.runtime.lastError);
    } else {
        console.log("Storage FORCE initialized!");
        chrome.storage.local.get(null, (data) => {
            console.log("Verification - Storage now contains:", data);
        });
    }
});


function scanURL(url) {
    let score = 0;
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;

        if (url.length > 75) score += 15;
        if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) score += 20;

        const suspiciousTLDs = [".tk", ".ml", ".ga", ".cf", ".xyz", ".biz", ".info", ".top"];
        if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) score += 15;

        const hyphenCount = (hostname.match(/-/g) || []).length;
        if (hyphenCount > 1) score += 10;

        if (url.includes("@")) score += 15;
        if (hostname.split(".").length > 3) score += 10;
        if (!url.startsWith("https")) score += 15;
        if (hostname.includes("xn--")) score += 20;

        const keywords = ["login", "secure", "account", "verify", "update", "password"];
        if (keywords.some(word => hostname.toLowerCase().includes(word))) score += 10;

    } catch (e) {
        console.error("Invalid URL:", e);
    }

    let status = "Safe";
    if (score >= 40 && score < 70) status = "Suspicious";
    else if (score >= 70) status = "Dangerous";

    return { url, score, status };
}

function logURL(scanResult) {
    const entry = { ...scanResult, timestamp: new Date().toLocaleString() };
    
    chrome.storage.local.get(["logs"], (data) => {
        let logs = data.logs || [];
        
        if (!Array.isArray(logs)) {
            console.warn("Logs was not an array, resetting");
            logs = [];
        }
        
        logs.push(entry);
        
        chrome.storage.local.set({ logs: logs }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error saving log:", chrome.runtime.lastError);
            } else {
                console.log("Log saved! Total:", logs.length, "Entry:", entry);
            }
        });
    });
}


chrome.runtime.onInstalled.addListener((details) => {
    console.log("onInstalled triggered! Reason:", details.reason);
    
    chrome.storage.local.set({
        blacklist: ["phishing.com", "malicious.example", "scam-site.tk"],
        logs: []
    }, () => {
        console.log("Storage initialized via onInstalled");
    });
});


chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
            return;
        }

        console.log("Auto-scanning:", tab.url);
        latestScanResult = scanURL(tab.url);
        console.log("Result:", latestScanResult);

        logURL(latestScanResult);

        chrome.runtime.sendMessage({
            type: "SCAN_RESULT",
            data: latestScanResult
        }).catch((err) => {
            console.log("Popup not open:", err.message);
        });

        chrome.storage.local.get(["blacklist"], (data) => {
            const blacklist = data.blacklist || [];
            console.log("Checking against blacklist:", blacklist);
            
            try {
                const hostname = new URL(tab.url).hostname;
                
                for (const blocked of blacklist) {
                    if (hostname.includes(blocked)) {
                        chrome.tabs.update(tabId, { url: "https://google.com" });
                        console.warn("BLOCKED URL:", tab.url);
                        return;
                    }
                }
            } catch (e) {
                console.error("Error checking blacklist:", e);
            }
        });
    }
});


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("Message received:", msg.type);
    
    if (msg.type === "MANUAL_SCAN") {
        console.log("Manual scan for:", msg.url);
        latestScanResult = scanURL(msg.url);
        console.log("Manual result:", latestScanResult);
        
        logURL(latestScanResult);

        chrome.runtime.sendMessage({
            type: "SCAN_RESULT",
            data: latestScanResult
        }).catch(() => {});
        
        sendResponse({ success: true });
        return true;
    }

    if (msg.type === "GET_SCAN_RESULT") {
        console.log("Returning latest scan:", latestScanResult);
        sendResponse(latestScanResult);
        return true;
    }
});

console.log("Background script fully initialized!");
