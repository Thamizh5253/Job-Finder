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

const PORT = process.env.PORT || 5001;

// Connect to the database
db.connect();

// Cloudinary file upload for document image
app.post("/api/img/upload/document", async (req, res) => {
  try {
    const { image_url } = req.body;
    if (!image_url) return res.status(400).json({ error: "Image URL required" });

    const cloudinary_res = await cloudinary.uploader.upload(image_url, {
      folder: "/spoton",
      resource_type: "image",
    });

    res.status(200).json({
      message: "Document image uploaded successfully",
      data: cloudinary_res.secure_url,
    });
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Cloudinary file upload for land image
app.post("/api/img/upload/land", async (req, res) => {
  try {
    const { image_url } = req.body;
    if (!image_url) return res.status(400).json({ error: "Image URL required" });

    const cloudinary_res = await cloudinary.uploader.upload(image_url, {
      folder: "/spoton",
      resource_type: "image",
    });

    res.status(200).json({
      message: "Land image uploaded successfully",
      data: cloudinary_res.secure_url,
    });
  } catch (err) {
    console.error("Cloudinary Upload Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// POST endpoint to add new land details
app.post("/api/addLandDetails", async (req, res) => {
  // console.log("Land details received:", req.body);
  try {
    const addLand = new AddLandDetails(req.body);
    await addLand.save();
    res.status(200).send("Land details received and saved successfully");
  } catch (err) {
    console.error("Error saving land details:", err);
    res.status(500).send("Error saving land details");
  }
});

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
    const { sender_mail, receiver_mail, message } = data;

    try {
      const newMessage = new SocketMessage({ sender_mail, receiver_mail, message });
      await newMessage.save();

      // Send the message only to the receiver if they are online
      if (onlineUsers[receiver_mail]) {
        io.to(onlineUsers[receiver_mail]).emit("receiveMessage", newMessage);
      }
    } catch (error) {
      console.error("Error saving message:", error);
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
    const { email, password, fname, lname, mobile, role } = req.body;

    // Check if the email already exists in the database
    const existingUser = await UserRegister.findOne({ email });

    if (existingUser) {
      // If user already exists, respond with a message
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create a new user document with hashed password
    const newUser = new UserRegister({
      email,
      password: hashedPassword,
      fname,
      lname,
      mobile,
      role,
    });

    // Save the user document to the database
    await newUser.save();

    // Respond with a success message
    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    // Respond with an error message if something goes wrong
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await UserRegister.findOne({ email });

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





// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
