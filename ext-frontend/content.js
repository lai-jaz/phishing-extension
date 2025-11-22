chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "SCAN_CONTENT") {
        console.log("Content script received scan:", msg.result);

        if (msg.result.status === "Dangerous") {
            document.body.style.border = "5px solid red";
        }
    }
});
