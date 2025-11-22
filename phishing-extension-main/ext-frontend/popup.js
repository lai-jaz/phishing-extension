let showingManualScan = false;

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
    const url = document.getElementById("nameInput").value.trim();
    if (!url) {
        document.getElementById("result").textContent = "Please enter a URL!";
        return;
    }

    showingManualScan = true;
    chrome.runtime.sendMessage({ type: "MANUAL_SCAN", url: url });
    document.getElementById("result").innerHTML = `<strong>Scanning:</strong> ${url}`;
});


function displayResult(data) {
    const { url, score, status } = data;
    const prefix = showingManualScan ? "Manual Scan URL" : "URL";
    
    document.getElementById("result").innerHTML =
        `<strong>${prefix}:</strong> ${url}<br>
         <strong>Score:</strong> ${score}/100<br>
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

        container.classList.add("expanded");
        arrow.style.transform = 'rotate(-180deg)';
    });
});


document.getElementById("showBlacklist").addEventListener("click", () => {
    const container = document.getElementById("blacklistContainer");
    const arrow = document.querySelector('#showBlacklist .arrow');
    
   
    const isExpanded = container.classList.contains("expanded");
    
    if (isExpanded) {
        container.classList.remove("expanded");
        arrow.style.transform = 'rotate(0deg)';
        return;
    }
    
    
    chrome.storage.local.get(["blacklist"], (data) => {
        console.log("Retrieved blacklist:", data); 
        
        const list = data.blacklist || [];
        container.innerHTML = "";

        if (list.length === 0) {
            container.innerHTML = "<p>No blacklisted domains.</p>";
        } else {
            list.forEach(domain => {
                const p = document.createElement("p");
                p.textContent = `${domain}`;
                container.appendChild(p);
            });
        }

        container.classList.add("expanded");
        arrow.style.transform = 'rotate(-180deg)';
    });
});