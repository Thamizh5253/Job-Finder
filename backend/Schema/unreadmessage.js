const mongoose = require('mongoose');

const unreadMessageSchema = new mongoose.Schema({
  receiver_mail: { type: String, required: true },  // The user who has unread messages
  sender_mail: { type: String, required: true },  // The user who has unread messages
  message_id: { type: mongoose.Schema.Types.ObjectId, ref: 'messages', required: true }, // Reference to Message schema
  timestamp: { type: Date, default: Date.now } // Timestamp of when the message became unread
});

const UnreadMessage = mongoose.model('unread_messages', unreadMessageSchema);
module.exports = UnreadMessage;
