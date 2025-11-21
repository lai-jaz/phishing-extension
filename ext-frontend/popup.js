document.getElementById("sendBtn").addEventListener("click", async () => {
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
