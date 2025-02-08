const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender_mail: { type: String, required: true },      // The user sending the message
  receiver_mail: { type: String, required: true },    // The user receiving the message
  message: { type: String, required: true },     // Message content
   
  timestamp: { type: Date, default: Date.now }   // Timestamp of message
});

const Message = mongoose.model('messages', messageSchema);
module.exports = Message;
