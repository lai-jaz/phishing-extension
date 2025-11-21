const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.post("/api/hello", (req, res) => {
    const { name } = req.body;
    res.json({ message: "Hello " + name + " from backend" });
});

app.listen(3000, () => console.log("Backend running on http://localhost:3000"));
