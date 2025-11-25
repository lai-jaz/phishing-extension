let showingManualScan = false;
chrome.storage.local.get(["blockedCount"], (data) => {
    document.getElementById("blockedCount").textContent = data.blockedCount || 0;
});

document.addEventListener("DOMContentLoaded", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs[0]) return;
        const currentTabUrl = tabs[0].url;

        showingManualScan = false;
        chrome.runtime.sendMessage({ type: "MANUAL_SCAN", url: currentTabUrl });
    });

    chrome.runtime.sendMessage({ type: "GET_SCAN_RESULT" }, (response) => {
        if (response) {
            displayResult(response);
        } else {
            document.getElementById("result").textContent = "No scans yet.";
        }
    });
});

document.getElementById("sendBtn").addEventListener("click", () => {
    // chrome.runtime.sendMessage({ type: "MANUAL_SCAN", url: "http://999.888.777.666/verify-login-update-password-info.xyz/secure@account" });

    const url = document.getElementById("nameInput").value.trim();
    if (!url) {
        document.getElementById("result").textContent = "Please enter a URL!";
        return;
    }

    showingManualScan = true;
    chrome.runtime.sendMessage({ type: "MANUAL_SCAN", url: url });
    document.getElementById("result").innerHTML = `<strong>Scanning:</strong> ${url}`;
});

// show result of auto/manual scan
function displayResult(data) {
    const { url, score, status } = data;
    const prefix = showingManualScan ? "Manual Scan URL" : "URL";
    
    document.getElementById("result").innerHTML =
        `<strong>${prefix}:</strong> ${url}<br>
         <strong>Threat Level:</strong> ${score}/100<br>
         <strong>Status:</strong> ${status}`;
    
    if (showingManualScan) {
        showingManualScan = false;
    }
}


chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "SCAN_RESULT") {
        displayResult(message.data);
    }
});


document.getElementById("showLogs").addEventListener("click", () => {
    const container = document.getElementById("logContainer");
    const arrow = document.querySelector('#showLogs .arrow');
    
    
    const isExpanded = container.classList.contains("expanded");
    
    if (isExpanded) {
       
        container.classList.remove("expanded");
        arrow.style.transform = 'rotate(0deg)';
        return;
    }
    
    
    chrome.storage.local.get(["logs"], (data) => {
        console.log("Retrieved logs:", data); // Debug
        
        const logs = data.logs || [];
        container.innerHTML = "";

        if (logs.length === 0) {
            container.innerHTML = "<p>No logs yet.</p>";
        } else {
            
            const recentLogs = [...logs].reverse();
            recentLogs.forEach(log => {
                const p = document.createElement("p");
                p.textContent = `${log.timestamp} - ${log.url.substring(0, 30)}... [${log.status}] Score: ${log.score}`;

                container.appendChild(p);
            });
        }

        // CSS manipulation on expanding dropdown
        container.classList.add("expanded");
        arrow.style.transform = 'rotate(-180deg)';
    });
});


// Show/Hide blacklist
document.getElementById("showBlacklist").addEventListener("click", () => {
    const container = document.getElementById("blacklistContainer");
    const arrow = document.querySelector('#showBlacklist .arrow');
    
    const isExpanded = container.classList.contains("expanded");
    
    if (isExpanded) {
        container.classList.remove("expanded");
        arrow.style.transform = 'rotate(0deg)';
        return;
    }
    
    loadBlacklist();
    container.classList.add("expanded");
    arrow.style.transform = 'rotate(-180deg)';
});

// Load and display blacklist
function loadBlacklist() {
    chrome.storage.local.get(["blacklist"], (data) => {
        console.log("Retrieved blacklist:", data);
        
        const list = data.blacklist || [];
        const itemsContainer = document.getElementById("blacklistItems");
        itemsContainer.innerHTML = "";

        if (list.length === 0) {
            itemsContainer.innerHTML = "<p>No blacklisted domains.</p>";
        } else {
            list.forEach((domain) => {
                const p = document.createElement("p");
                
                const span = document.createElement("span");
                span.textContent = `${domain}`;
                
               const removeBtn = document.createElement("button");
               removeBtn.className = "remove-btn";
               removeBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" height="14" width="14" viewBox="0 0 24 24" fill="white">
        <path d="M3 6h18v2H3V6zm2 3h14l-1.5 12.5c-.1.8-.8 1.5-1.7 1.5H8.2c-.9 0-1.6-.7-1.7-1.5L5 9zm5-6h4v2h-4V3z"/>
    </svg>
`;
removeBtn.onclick = () => removeFromBlacklist(domain);

                
                p.appendChild(span);
                p.appendChild(removeBtn);
                itemsContainer.appendChild(p);
            });
        }
    });
}

// Add to blacklist
document.getElementById("addBlacklist").addEventListener("click", () => {
    const input = document.getElementById("blacklistInput");
    const domain = input.value.trim().toLowerCase();
    
    if (!domain) {
        alert("Please enter a domain!");
        return;
    }
    
    // Basic validation
    if (domain.includes(" ") || domain.includes("/")) {
        alert("Enter only the domain (e.g., example.com)");
        return;
    }
    
    chrome.storage.local.get(["blacklist"], (data) => {
        const blacklist = data.blacklist || [];
        
        if (blacklist.includes(domain)) {
            alert("This domain is already blacklisted!");
            return;
        }
        
        blacklist.push(domain);
        chrome.storage.local.set({ blacklist: blacklist }, () => {
            console.log("Domain added to blacklist:", domain);
            input.value = "";
            loadBlacklist();
        });
    });
});

// Remove from blacklist
function removeFromBlacklist(domain) {
    if (!confirm(`Remove ${domain} from blacklist?`)) {
        return;
    }
    
    chrome.storage.local.get(["blacklist"], (data) => {
        let blacklist = data.blacklist || [];
        
        blacklist = blacklist.filter(d => d !== domain);
        
        chrome.storage.local.set({ blacklist: blacklist }, () => {
            console.log("Domain removed from blacklist:", domain);
            loadBlacklist();
        });
    });
}

// Allow pressing Enter to add
document.getElementById("blacklistInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        document.getElementById("addBlacklist").click();
    }
});
