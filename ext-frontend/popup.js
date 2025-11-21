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

