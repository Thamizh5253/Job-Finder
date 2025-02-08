import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Box, Modal, Button, Typography, List, ListItem, ListItemText, TextField } from '@mui/material';
import UsernameContext from '../context/context';
import { io } from 'socket.io-client';

// Initialize socket connection
const socket = io('http://localhost:5001');

const ChatList = () => {
  const { username } = useContext(UsernameContext);
  const [conversations, setConversations] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [open, setOpen] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/getmessages', {
          params: { sender: username },
        });
        const filteredMessages = response.data.filter(
          (msg) => msg.sender_mail === username || msg.receiver_mail === username
        );
        const uniqueUsers = [...new Set(filteredMessages.map((msg) =>
          msg.sender_mail === username ? msg.receiver_mail : msg.sender_mail
        ))];
        setConversations(uniqueUsers);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };
    fetchConversations();
  }, [username]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/getmessages', {
          params: { sender: username, receiver: selectedChat },
        });
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    };

    if (selectedChat) {
      fetchMessages();
    }


socket.emit("user-online", username);

socket.on("update-online-users", (onlineUsers) => {
  setOnlineUsers(onlineUsers);
  // console.log("Online users:", onlineUsers);
});

    // Listen for new messages
    socket.on('receiveMessage', (newMessage) => {
      if (
        (newMessage.sender_mail === selectedChat && newMessage.receiver_mail === username) ||
        (newMessage.sender_mail === username && newMessage.receiver_mail === selectedChat)
      ) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    // Clean up the socket listener
    return () => {
      socket.off('receiveMessage');
    };
  }, [selectedChat, username]);

  const handleOpenChat = async (otherUser) => {
    setSelectedChat(otherUser);
    setOpen(true);
  };
  const handleSendMessage = async () => {

    if (!newMessage.trim()) return;
  
    const messageData = {
      sender_mail: username,
      receiver_mail: selectedChat,
      message: newMessage,
    };
  
    try {
      socket.emit("sendMessage", messageData);
      setMessages((prevMessages) => [...prevMessages, messageData]);
     
      setNewMessage(""); // Clear input after sending
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };
  
  

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Chat Conversations</Typography>
      <Box sx={{ 
  maxHeight: 400, 
  overflowY: 'auto', 
  border: '1px solid #ccc', 
  borderRadius: 2, 
  boxShadow: 2, 
  p: 2, 
  backgroundColor: '#fff' 
}}>
  <List>
    {conversations.map((user, index) => (
      <ListItem 
        button 
        key={index} 
        onClick={() => handleOpenChat(user)}
        sx={{ 
          borderRadius: 1, 
          mb: 1, 
          backgroundColor: onlineUsers.includes(user) ? '#e0f7fa' : '#f5f5f5', 
          transition: '0.3s',
          '&:hover': { backgroundColor: '#cfd8dc' }
        }}
      >
        <ListItemText primary={user} />
        {onlineUsers.includes(user) && <Typography variant="body2" color="green">Online</Typography>}
      </ListItem>
    ))}
  </List>
</Box>


      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            {/* <Typography variant="h6" gutterBottom>Chat with {selectedChat}</Typography> */}
            <Box 
  sx={{
    display: 'flex',
    alignItems: 'center',
    gap: 1, // Adds spacing between text and indicator
    p: 1.5,
    borderRadius: '8px',
    backgroundColor: '#f5f5f5', // Light background
    boxShadow: 1, // Adds a subtle shadow
    width: 'fit-content'
  }}
>
  <Typography variant="h5">
   chat with {selectedChat}
  </Typography>
  <Box 
    sx={{
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: onlineUsers.includes(selectedChat) ? 'green' : 'red',
    }}
  />
</Box>

            <Button onClick={() => setOpen(false)} sx={{ minWidth: '32px', fontSize: '18px', color: '#555' }}>✖</Button>
          </Box>

          <Box sx={{
            maxHeight: 300,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            p: 2,
            border: '1px solid #ccc',
            borderRadius: 2,
            backgroundColor: '#f9f9f9',
          }}>
            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  alignSelf: msg.sender_mail === username ? 'flex-end' : 'flex-start',
                  maxWidth: '70%',
                  p: 1.5,
                  borderRadius: '16px',
                  backgroundColor: msg.sender_mail === username ? '#007bff' : '#e0e0e0',
                  color: msg.sender_mail === username ? 'white' : 'black',
                  textAlign: msg.sender_mail === username ? 'right' : 'left',
                  boxShadow: 2,
                }}
              >
                <Typography variant="body1">{msg.message}</Typography>
              </Box>
            ))}
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <Button size="large" variant="contained" onClick={handleSendMessage}>
              Send
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default ChatList;