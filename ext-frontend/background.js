let latestScanResult = null;
let redirectURL = "https://google.com";
console.log("Background script loaded at:", new Date().toLocaleString());

const API_KEY = "AIzaSyAWMOXnJlzUdQcclAV6oXBvfk46ehgO-mY";

// google api check function
async function checkGoogleSafeBrowsing(url) {
    const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`;

    const body = {
        client: {
            clientId: "my-chrome-extension",
            clientVersion: "1.0"
        },
        threatInfo: {
            threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
            platformTypes: ["ANY_PLATFORM"],
            threatEntryTypes: ["URL"],
            threatEntries: [{ url }]
        }
    };

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" }
        });

        const data = await response.json();

        if (data && data.matches && data.matches.length > 0) {
            return { dangerous: true, threats: data.matches };
        } else {
            return { dangerous: false, threats: [] };
        }
    } catch (err) {
        console.error("Safe Browsing API error:", err);
        return { dangerous: false, threats: [] };
    }
}



chrome.storage.local.get(["blacklist", "logs"], (data) => {
    const updates = {};
    
    if (!data.blacklist || data.blacklist.length === 0) {
        updates.blacklist = ["phishing.com", "malicious.example", "scam-site.tk"];
    }
    
    if (!data.logs) {
        updates.logs = [];
    }
    
    if (Object.keys(updates).length > 0) {
        chrome.storage.local.set(updates, () => {
            if (chrome.runtime.lastError) {
                console.error("Init error:", chrome.runtime.lastError);
            } else {
                console.log("Storage initialized!");
            }
        });
    } else {
        console.log("Storage OK. Logs:", data.logs?.length || 0);
    }
});

function scanURL(url) {
    let score = 0;
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;

        if ((hostname + parsedUrl.pathname).length > 75) score += 15;
        if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) score += 20;

        const suspiciousTLDs = [".tk", ".ml", ".ga", ".cf", ".xyz", ".biz", ".info", ".top"];
        if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) score += 15;

        const hyphenCount = (hostname.match(/-/g) || []).length;
        if (hyphenCount > 1) score += 10;

        if (parsedUrl.href.split(parsedUrl.hostname)[1].includes("@")) score += 15;
        if (hostname.split(".").length > 3) score += 10;
        if (parsedUrl.protocol !== "https:") score += 15;
        if (hostname.includes("xn--")) score += 20;

        const keywords = ["login", "secure", "account", "verify", "update", "password"];
        if (keywords.some(word => parsedUrl.pathname.toLowerCase().includes(word))) score += 10;

    } catch (e) {
        console.error("Invalid URL:", e);
        showUnsafeNotification(url, score, "Invalid URL!");
        return { url, score: 0, status: "Invalid URL" };
    }

    let status = "Safe";
    if (score >= 40 && score < 70) 
    {
        status = "Suspicious"
        showUnsafeNotification(url, score, "Suspicious Website Detected!");
    }
    else if (score >= 70) 
    {
        status = "Dangerous"
        showUnsafeNotification(url, score, "Dangerous Website Detected!");
    };

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
    
    chrome.storage.local.get(["blacklist", "logs"], (data) => {
        const updates = {};
        
        if (!data.blacklist || data.blacklist.length === 0) {
            updates.blacklist = ["phishing.com", "malicious.example", "scam-site.tk"];
        }
        
        if (!data.logs) {
            updates.logs = [];
        }
        
        if (Object.keys(updates).length > 0) {
            chrome.storage.local.set(updates, () => {
                console.log("Storage initialized via onInstalled");
            });
        }
    });
});


chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        if (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://")) {
            return;
        }

        console.log("Auto-scanning:", tab.url);
        latestScanResult = scanURL(tab.url);
        console.log("Result:", latestScanResult);

        const gsResult = await checkGoogleSafeBrowsing(tab.url);
        if (gsResult.dangerous) {
            latestScanResult.status = "Dangerous";
            latestScanResult.score = 100;
            latestScanResult.googleThreats = gsResult.threats;
        }

        logURL(latestScanResult);

        // block URL if dangerous
        if (latestScanResult.status === "Dangerous") {
            chrome.tabs.update(tabId, { url: redirectURL });
            showUnsafeNotification(tab.url, latestScanResult.score, "Blocked Dangerous Website!");
            return;
        }

        chrome.runtime.sendMessage({
            type: "SCAN_RESULT",
            data: latestScanResult
        }).catch((err) => {
            console.log("Popup not open:", err.message);
        });
        
        chrome.tabs.sendMessage(tabId, { 
            type: "SCAN_CONTENT",
            result: latestScanResult 
        });

        chrome.storage.local.get(["blacklist"], (data) => {
            const blacklist = data.blacklist || [];
            console.log("Checking against blacklist:", blacklist);
            
            try {
                const hostname = new URL(tab.url).hostname;
                
                // block URL
                for (const blocked of blacklist) {
                    if (hostname.includes(blocked)) {
                        chrome.tabs.update(tabId, { url: redirectURL });
                        showUnsafeNotification(tab.url, 100, "Blacklisted Website!");
                        return;
                    }
                }
            } catch (e) {
                console.error("Error checking blacklist:", e);
            }
        });
    }
});

// manual scan handler (to be REMOVED on final submission)
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

// notification for unsafe site
function showUnsafeNotification(url, score, message) {
    chrome.notifications.create({
        type: "basic",
        iconUrl: chrome.runtime.getURL( message.includes("Dangerous") ? "images/iconDanger.png" : "images/iconSus.png"),
        title: message,
        message: `${url} is rated ${score}/100)`,
        priority: 2
    });
}

console.log("Background script fully initialized!");
