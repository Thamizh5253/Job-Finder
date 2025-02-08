import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Grid, Box, Modal, Button, Card, CardContent, CardMedia, Typography, TextField } from '@mui/material';
import { CardActionArea, CardActions } from '@mui/material';
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';
import UsernameContext from '../context/context';
import { io } from 'socket.io-client';

// Initialize socket connection
const socket = io('http://localhost:5001');

const LandDetails = () => {
  const [lands, setLands] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedLand, setSelectedLand] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { username } = useContext(UsernameContext);
  const [onlineUsersList, setOnlineUsersList] = useState([]);
  useEffect(() => {
    const fetchLands = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/getlanddetails');
        setLands(response.data);
      } catch (error) {
        console.error('Error fetching land details:', error);
      }
    };
    fetchLands();

    // Notify server that user is online
    socket.emit('user-online', username);

    socket.on('update-online-users', (onlineUsers) => {
      setOnlineUsersList(onlineUsers);

      // console.log('Online users:', onlineUsersList);
    });

    // Listen for incoming messages
    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('update-online-users');
    };
  }, [username]);

  const handleOpen = async (land) => {
    setSelectedLand(land);
    setOpen(true);
    try {
      const response = await axios.get(`http://localhost:5001/api/getmessages?sender=${username}&receiver=${land.username}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleClose = () => setOpen(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const messageData = {
      sender_mail: username,
      receiver_mail: selectedLand.username,
      message: newMessage,
    };

    socket.emit('sendMessage', messageData);
    setMessages([...messages, messageData]);
    setNewMessage('');
  };

  return (
    <MainCard title="Land Details">
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <SubCard title="Available Lands">
            <Grid container spacing={gridSpacing}>
              {lands.map((land) => (
                <Grid item key={land._id} xs={12} sm={6} md={4} lg={3}>
                  <Card sx={{ maxWidth: 345, border: '1px solid black' }}>
                    <CardActionArea>
                      <CardMedia component="img" height="140" image={land.land_image} alt="Land" />
                      <CardContent>
                        <Typography gutterBottom variant="h5">{land.city_name}</Typography>
                        <Typography variant="body2" color="text.secondary">{land.address}</Typography>
                        <Typography variant="h6">Initial Price: ₹{land.initial_price}</Typography>
                      </CardContent>
                    </CardActionArea>
                    <CardActions>
                      <Button size="large" variant="contained" onClick={() => handleOpen(land)}>
                        Chat
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </SubCard>
        </Grid>
      </Grid>
      
      {/* Chat Modal */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            
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
   Chat with {selectedLand?.username}
  </Typography>
  <Box 
    sx={{
      width: 12,
      height: 12,
      borderRadius: '50%',
      backgroundColor: onlineUsersList.includes(selectedLand?.username) ? 'green' : 'red',
    }}
  />
</Box>

            <Button onClick={handleClose} sx={{ minWidth: '32px', fontSize: '18px', color: '#555' }}>✖</Button>
          </Box>

          <Box 
            sx={{
              maxHeight: 300,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              p: 2,
              border: '1px solid #ccc',
              borderRadius: 2,
              backgroundColor: '#f9f9f9'
            }}
          >
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
    </MainCard>
  );
};

export default LandDetails;
