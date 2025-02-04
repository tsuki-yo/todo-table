require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

// Sample GET route
app.get("/tasks", (req, res) => {
    res.json([{ id: 1, task: "Deploy backend", completed: false }]);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
