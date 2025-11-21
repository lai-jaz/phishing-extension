document.getElementById("sendBtn").addEventListener("click", async () => {
    chrome.tabs.query({active:true,currentWindow:true},(tabs)=>
    {
        const url=tabs[0].url;
        chrome.runtime.sendMessage({type: "MANUAL_SCAN", url:url})
    })
    const name = document.getElementById("nameInput").value;
    document.getElementById("result").textContent = name;
    
    // const res = await fetch("http://localhost:3000/api/hello", {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json"
    //     },
    //     body: JSON.stringify({ name })
    // });

    // const data = await res.json();
    // document.getElementById("result").textContent = data.message;
});
const dropdownBtn = document.querySelector('.dropdown-btn');
const logs = document.querySelector('.logs');
const arrow = dropdownBtn.querySelector('.arrow');

dropdownBtn.addEventListener('click', () => {
    logs.classList.toggle('expanded');         // toggle expanded class
    if (logs.classList.contains('expanded')) {
        arrow.style.transform = 'rotate(-180deg)';
    } else {
        arrow.style.transform = 'rotate(0deg)';
    }
});
document.addEventListener("DOMContentLoaded", () => {
    chrome.runtime.sendMessage({ type: "GET_SCAN_RESULT" }, (response) => {
        if (!response) return;

        const { url, score, status} = response;

        document.getElementById("result").innerHTML = 
        `<strong>URL:</strong> ${url}<br> 
         <strong>Score:</strong> ${score}/100<br>
         <strong>Status:</strong> ${status}<br>`;
    });
});
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "SCAN_RESULT") {
        const { url, score, status} = message.data;
        document.getElementById("result").innerHTML = 
        `<strong>URL:</strong> ${url}<br>
         <strong>Score:</strong> ${score}/100<br>
         <strong>Status:</strong> ${status}<br>`;
    }
});

