// db.js
require('dotenv').config();
const mongoose = require("mongoose");
const conn_url = process.env.DATABASE_URL ;
module.exports = {
  connect: () => {
    // Connect to MongoDB
    mongoose
      .connect(
        conn_url,
        {
          // useNewUrlParser: true,
          useUnifiedTopology: true,
        }
      )
      .then(() => console.log("Connected to the database"))
      .catch((err) => console.error("Connection to the database failed", err));
  },
};
