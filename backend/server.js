require("dotenv").config();
const express = require("express");
const cors = require("cors");
const AWS = require("aws-sdk");

const app = express();
app.use(express.json());
app.use(cors());

// Configure AWS SDK (adjust region as needed)
AWS.config.update({ region: "ap-northeast-1" });
const docClient = new AWS.DynamoDB.DocumentClient();

// Ensure you have created a DynamoDB table named 'TodoTasks'
// with a primary key attribute "id" (string or number)

const TABLE_NAME = "TodoTasks";

// GET endpoint: retrieve tasks (limit to 20)
app.get("/tasks", async (req, res) => {
  try {
    const data = await docClient.scan({ TableName: TABLE_NAME }).promise();
    // Return only the first 20 tasks
    res.json(data.Items.slice(0, 20));
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Could not fetch tasks" });
  }
});

// PUT endpoint: update a task
app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { task, dueDate } = req.body;

  const params = {
    TableName: TABLE_NAME,
    Key: { id },
    UpdateExpression: "set #t = :t, dueDate = :d",
    ExpressionAttributeNames: { "#t": "task" },
    ExpressionAttributeValues: {
      ":t": task,
      ":d": dueDate,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const data = await docClient.update(params).promise();
    res.json(data.Attributes);
  } catch (err) {
    console.error("Error updating task:", err);
    res.status(500).json({ error: "Could not update task" });
  }
});

// (Optional) POST endpoint: add a new task
app.post("/tasks", async (req, res) => {
  const { id, task, dueDate } = req.body;
  const params = {
    TableName: TABLE_NAME,
    Item: { id, task, dueDate },
  };

  try {
    await docClient.put(params).promise();
    res.status(201).json(req.body);
  } catch (err) {
    console.error("Error adding task:", err);
    res.status(500).json({ error: "Could not add task" });
  }
});

// Start server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
