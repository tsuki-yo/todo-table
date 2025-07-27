const express = require("express");
const cors = require("cors");
const AWS = require("aws-sdk");
const axios = require("axios");
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
    // Check if it's a guest token (32-character hex string)
    if (/^[0-9a-f]{32}$/.test(token)) {
      req.user = {
        sub: `guest_${token}`,
        isGuest: true
      };
      return next();
    }
    
    // Verify the token with Cognito
    const payload = await verifier.verify(token);
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
  const userId = req.user.sub;

  const params = {
    TableName: TABLE_NAME,
    Key: { userId, id },
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

// POST endpoint: process natural language input for new task
app.post("/tasks/process", async (req, res) => {
  const { input } = req.body;
  const userId = req.user.sub;

  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: "Input text is required" });
  }

  try {
    // Call AI service for NLP processing
    let processedTask;
    try {
      console.log("🔍 Calling AI service with input:", input);
      const aiResponse = await axios.post('http://localhost:3003/analyze', {
        text: input
      }, {
        timeout: 5000
      });
      
      console.log("✅ AI service response:", aiResponse.data);
      processedTask = {
        task: aiResponse.data.task,
        dueDate: aiResponse.data.dueDate,
        priority: aiResponse.data.priority
      };
      
    } catch (aiError) {
      console.log("AI service unavailable, using fallback processing:", aiError.message);
      console.log("Error details:", aiError.code, aiError.response?.status);
      // Fallback to basic processing
      processedTask = {
        task: input.trim(),
        dueDate: "",
        priority: "medium"
      };
    }

    // Find the first available slot (empty task) in the user's tasks
    const existingTasksParams = {
      TableName: TABLE_NAME,
      KeyConditionExpression: "userId = :u",
      ExpressionAttributeValues: { ":u": userId },
      Limit: 20,
    };

    const existingTasks = await docClient.query(existingTasksParams).promise();
    let targetId = null;

    // Find first empty slot (0-19)
    for (let i = 0; i < 20; i++) {
      const existingTask = existingTasks.Items.find(item => item.id === i.toString());
      if (!existingTask || !existingTask.task) {
        targetId = i.toString();
        break;
      }
    }

    if (targetId === null) {
      return res.status(400).json({ error: "All task slots are full" });
    }

    // Save the processed task
    const params = {
      TableName: TABLE_NAME,
      Item: { 
        userId, 
        id: targetId, 
        task: processedTask.task, 
        dueDate: processedTask.dueDate 
      },
    };

    await docClient.put(params).promise();
    res.status(201).json({ 
      id: targetId,
      task: processedTask.task,
      dueDate: processedTask.dueDate,
      priority: processedTask.priority,
      message: "Task processed and added successfully" 
    });

  } catch (err) {
    console.error("Error processing task:", err);
    res.status(500).json({ error: "Could not process task" });
  }
});

// POST endpoint: add a new task
app.post("/tasks", async (req, res) => {
  const { id, task, dueDate } = req.body;
  const userId = req.user.sub;

  const params = {
    TableName: TABLE_NAME,
    Item: { userId, id, task, dueDate },
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
