const express = require("express");
const cors = require("cors");
const AWS = require("aws-sdk");
const { CognitoJwtVerifier } = require("aws-jwt-verify");

const app = express();
app.use(express.json());
app.use(cors());

// Configure AWS SDK (IRSA is used for my pod's AWS credentials)
AWS.config.update({
  region: "ap-northeast-1",
});
const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "TodoTasks";

// Configure Cognito JWT verifier
const verifier = CognitoJwtVerifier.create({
  userPoolId: "ap-northeast-1_rHCqR8mhF",
  tokenUse: "access",
  clientId: "3tdd1ec5am5tci65s7tdkofpv4",
});

// Token verification middleware
async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the token with Cognito
    const payload = await verifier.verify(token);
    // Attach token payload (user information) to the request object
    req.user = payload;
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
}

// Apply token verification middleware to all routes under "/tasks"
app.use("/tasks", verifyToken);

// GET endpoint: retrieve tasks (limit to 20)
app.get("/tasks", async (req, res) => {
  const userId = req.user.sub;
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "userId = :u",
    ExpressionAttributeValues: { ":u": userId },
    Limit: 20,
  };

  try {
    const data = await docClient.query(params).promise();
    res.json(data.Items);
  } catch (err) {
    console.error("Error fetching tasks:", err);
    res.status(500).json({ error: "Could not fetch tasks" });
  }
});

// PUT endpoint: update a task
app.put("/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { task, dueDate } = req.body;
  const userId = req.user.sub; // Extracted from token payload

  const params = {
    TableName: TABLE_NAME,
    Key: { userId, id }, // Composite key
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


// POST endpoint: add a new task
app.post("/tasks", async (req, res) => {
  const { id, task, dueDate } = req.body;
  // Extract the user's unique identifier from the token
  const userId = req.user.sub;

  const params = {
    TableName: TABLE_NAME,
    Item: { userId, id, task, dueDate }, // Store userId with the task
  };

  try {
    await docClient.put(params).promise();
    res.status(201).json({ userId, id, task, dueDate });
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
