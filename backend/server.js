const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cloudinary = require("./cloudinary");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const db = require("./db");
const http = require("http");

const SocketMessage = require("./Schema/socketmessage");
const AddLandDetails = require("./Schema/addland");
const UserRegister = require("./Schema/register");
const UnreadMessage = require('./Schema/unreadmessage'); // Import the UnreadMessage model
const userSchema = require('./Schema/user');
const Jobs = require("./Schema/jobs");


require("dotenv").config();
const app = express();

// CORS Configuration
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["POST", "GET", "PUT"],
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});


const PORT = process.env.PORT || 5001;

// Connect to the database
db.connect();



// Route to fetch all land details
app.get("/api/getlanddetails", async (req, res) => {
  try {
    const landDetails = await AddLandDetails.find({});
    res.json(landDetails);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


const server = http.createServer(app);


const io = require("socket.io")(server, {
  cors: { origin: "*" },
});


let onlineUsers = {}; // Store online users (userEmail -> socketId)

io.on("connection", (socket) => {
  // console.log("A user connected:", socket.id);

  // When a user goes online
  socket.on("user-online", (userEmail) => {
    onlineUsers[userEmail] = socket.id; // Map user email to socket ID
    io.emit("update-online-users", Object.keys(onlineUsers)); // Broadcast updated list
  });

  // When a user sends a message
  socket.on("sendMessage", async (data) => {
    const { sender_mail, receiver_mail, message  ,url , isFile } = data;
    // console.log(data)
    try {
      const newMessage = new SocketMessage({ sender_mail, receiver_mail, message , url , isFile });
      await newMessage.save();

      // Store unread message in unread_messages collection
      const unreadMessage = new UnreadMessage({ receiver_mail,sender_mail , message_id: newMessage._id });
      await unreadMessage.save();

      // Send the message only to the receiver if they are online
      if (onlineUsers[receiver_mail]) {
        io.to(onlineUsers[receiver_mail]).emit("receiveMessage", newMessage);
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });

  socket.on("markMessagesAsRead", async ({ sender_mail, receiver_mail }) => {
    try {
      // Delete unread messages for the receiver
      await UnreadMessage.deleteMany({ sender_mail, receiver_mail });
  
      // Fetch updated unread count
      const unreadCount = await UnreadMessage.countDocuments({ receiver_mail });
  
      // Notify the receiver to update their unread count
      if (onlineUsers[receiver_mail]) {
        io.to(onlineUsers[receiver_mail]).emit("updateUnreadCount", { sender_mail, receiver_mail, unreadCount });
      }
    } catch (error) {
      console.error("Error clearing unread messages:", error);
    }
  });
  

  // When a user disconnects
  socket.on("disconnect", () => {
    const user = Object.keys(onlineUsers).find((key) => onlineUsers[key] === socket.id);
    if (user) {
      delete onlineUsers[user]; // Remove from online users
      io.emit("update-online-users", Object.keys(onlineUsers));
    }
    // console.log("User disconnected:", socket.id);
  });
});



app.get("/api/getmessages", async (req, res) => {
  try {
    const { sender, receiver } = req.query;

    let query = {};
    if (sender && receiver) {
      query = {
        $or: [
          { sender_mail: sender, receiver_mail: receiver },
          { sender_mail: receiver, receiver_mail: sender },
        ],
      };
    } else if (sender) {
      query = {
        $or: [{ sender_mail: sender }, { receiver_mail: sender }],
      };
    } else {
      return res.status(400).json({ error: "Sender is required" });
    }

    const messages = await SocketMessage.find(query).sort({ timestamp: 1 });

    // Attach online status to each user
    const messagesWithStatus = messages.map((msg) => ({
      ...msg.toObject(),
      senderOnline: onlineUsers[msg.sender_mail] ? true : false,
      receiverOnline: onlineUsers[msg.receiver_mail] ? true : false,
    }));

    res.json(messagesWithStatus);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
});



app.post("/api/storeEditedUserData", async (req, res) => {
  try {
    const { username, formData } = req.body;

    // Update the document in MongoDB with the provided ID
    const updatedUser = await UserRegister.findOneAndUpdate(
      { email: username },
      formData,
      {
        new: true,
      }
    );

    if (!updatedUser) {
      return res.status(404).send("User not found");
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error while updating user:", error);
    res.status(500).send("Error while updating user");
  }
});
//changepassword

app.post("/api/changepassword", async (req, res) => {
  try {
    const { username, passwordData } = req.body;
    const { currentPassword, newPassword } = passwordData;
    if (!currentPassword || !newPassword) {
      return res.status(400).send("Please provide required Datas !");
    }

    // Find the user by username (email)
    const user = await UserRegister.findOne({ email: username });
    if (!user) {
      return res.status(400).send("User not found");
    }

    // Check if the provided current password matches the stored encrypted password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(400).send("Current password is incorrect");
    }

    // Hash the new password before updating
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error while updating user password:", error);
    res.status(500).send("Error while updating user password");
  }
});


// GET endpoint to retrieve user account data to edit
app.get("/api/fetchEditAccountInfo/:username", async (req, res) => {
  const email = req.params.username;

  try {
    // Find the document by ID
    const accountData = await UserRegister.findOne({ email: email });

    if (!accountData) {
      return res.status(404).json({ error: "Service type not found" });
    }

    // Send the found document as a response
    res.json(accountData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch account data" });
  }
});


//fetchusername
app.get("/api/fetchusername/:username", async (req, res) => {
  const username = req.params.username;
  try {
    const results = await UserRegister.find({ email: username }).select(
      "fname lname"
    );

    if (results.length === 0) {
      return res.json({ message: false });
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.post("/api/register", async (req, res) => {
  try {
    // Extract form data from the request body
    const { name, email, password, role, mobile, skills } = req.body;

    // Check if the email already exists in the database
    const existingUser = await userSchema.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user document with hashed password and profile data
    const newUser = new userSchema({
      name,
      email,
      password: hashedPassword,
      role,
      score: 0, // default score
      profile: {
        mobile,
        skills: skills || [], // default to empty array if no skills provided
      },
    });

    // Save the user document to the database
    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await userSchema.findOne({ email });

  // If user not found, respond with error
  if (!user) {
    return res.status(200).json({ message: "Invalid credentials" });
  }

  // Compare hashed password with the provided password
  bcrypt.compare(password, user.password, (err, result) => {
    if (err || !result) {
      return res.status(200).json({ message: "Invalid credentials" });
    } else {
      // Generate JWT token
      const name = user.email;
      const role = user.role;
      const token = jwt.sign({ name, role }, "secret_key", {
        expiresIn: "5h",
      });
      // Set token in cookie
      res.cookie("token", token);

      
      // // Set token in cookie with secure and httpOnly flags
      // res.cookie("token", token, {
      //   httpOnly: true, // Prevent client-side JavaScript from accessing the cookie
      //   secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      //   sameSite: "strict", // Prevent CSRF
      // });
      // Send success response
      res.status(200).json({ message: "Login successful", token, role });
    }
  });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  // Log cookies received with the request

  const token = req.cookies.token;

  // if (!token) {
  //   return res.status(200).json({ message: "Unauthorized" });
  // }

  jwt.verify(token, "secret_key", (err, decoded) => {
    if (err) {
      console.error("Token verification failed:", err.message); // Log error message
      return res.status(200).json({ message: "Forbidden" });
    } else {
      req.name = decoded.name;
      req.role = decoded.role;

      next();
    }
  });
}

// Route for dashboard
app.get("/", authenticateToken, (req, res) => {
  // The decoded token information is available in req.user
  return res.json({ Status: "Success", name: req.name, role: req.role });
});
// Define a logout route
app.get("/logout", (req, res) => {
  // Clear the token cookie by setting an expired token
  res.clearCookie("token");
  res.json({ message: "Logout successful" });
});

<<<<<<< HEAD
// Create Job API
app.post('/api/jobs', async (req, res) => {
  try {
    // Transform requirements string into an array
    if (req.body.requirements && typeof req.body.requirements === 'string') {
      req.body.requirements = req.body.requirements.split('\n').map(line => line.trim()).filter(Boolean);
    }
    const newJob = new Jobs(req.body);
    console.log(newJob);
    const savedJob = await newJob.save();
    res.status(201).json(savedJob);
  } catch (err) {
    console.log(err.message);

    res.status(400).json({ error: err.message });
  }
});

app.get('/api/jobs', async (req, res) => {
  console.log(req.query);
  const { username } = req.query; // Get username from query params

  try {
    let query = {};

    // If username is provided, filter jobs by postedBy
    if (username) {
      query.postedBy = username;
    }

    const jobs = await Jobs.find(query);
    res.status(200).json(jobs);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: err.message });
  }
});


// Apply for a job route
app.post('/api/applyJob', async (req, res) => {
  const { jobId, username } = req.body;

  try {
    const job = await Jobs.findById(jobId);

    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Check if the user already applied
    const alreadyApplied = job.candidates.find(c => c.candidateId === username);
    if (alreadyApplied) return res.status(400).json({ message: 'You have already applied for this job' });

    // Add candidate to the job
    job.candidates.push({ candidateId: username, score: Math.floor(Math.random() * 100) });  // Example score
    await job.save();

    res.status(200).json({ message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error applying for job:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update Job API
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const updatedJob = await Jobs.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedJob);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete Job API
app.delete('/api/jobs/:id', async (req, res) => {
  try {
    await Jobs.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});






// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
