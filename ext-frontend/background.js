let latestScanResult = null;
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === "complete" && tab.url) {
        latestScanResult = scanURL(tab.url);
    }
});
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch (msg.type) {
        case "MANUAL_SCAN":
            latestScanResult = scanURL(msg.url);
            chrome.runtime.sendMessage({
                type: "SCAN_RESULT",
                data: latestScanResult
            });
            break;

        case "GET_SCAN_RESULT":
            sendResponse(latestScanResult);
            break;
    }
});
function scanURL(url) {
    let score = 0;
    try {
        const parsedUrl = new URL(url);
        const hostname = parsedUrl.hostname;
        if (url.length > 75) {
            score += 15;
        }
        if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
            score += 20;
        }
        const suspiciousTLDs = [".tk", ".ml", ".ga", ".cf", ".xyz", ".biz", ".info", ".top"];
        if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) {
            score += 15;
        }
        const hyphenCount = (hostname.match(/-/g) || []).length;
        if (hyphenCount > 1) {
            score += 10;
        }
        if (url.includes("@")) {
            score += 15;
        }
        if (hostname.split(".").length>3){
            score+=10;
        }
        if(!url.startsWith("https"))
        {
            score+=15;
        }
        if (hostname.includes("xn--")) {
            score += 20;
        }
        const keywords = ["login", "secure", "account", "verify", "update", "password"];
        if (keywords.some(word => hostname.toLowerCase().includes(word))) {
            score += 10;
        }

    } catch (e) {
        console.error("Invalid URL");
    }
    let status = "Safe";
    if (score >= 40 && score < 70) 
        {status = "Suspicious";}
    else if (score >= 70) 
        {status = "Dangerous";}

    return {
        url,
        score,
        status,
    };
}
chrome.webRequest.onBeforeRedirect.addListener(
    (details) => {
        if (latestScanResult) {
            latestScanResult.score += 5; 
            chrome.runtime.sendMessage({
                type: "SCAN_RESULT",
                data: latestScanResult
            });
        }
    },
    { urls: ["<all_urls>"] }
);

