import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Grid, Box, Modal, Button, Card, CardContent, CardMedia, Typography, TextField } from '@mui/material';
import { CardActionArea, CardActions } from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import MainCard from 'ui-component/cards/MainCard';
import SubCard from 'ui-component/cards/SubCard';
import { gridSpacing } from 'store/constant';
import UsernameContext from '../context/context';
import { io } from 'socket.io-client';
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";


// Initialize socket connection
const socket = io('http://localhost:5001');

const LandDetails = () => {
  const [lands, setLands] = useState([]);
  const [open, setOpen] = useState(false);
  const [openDoc, setOpenDoc] = useState(false);
  const [selectedLand, setSelectedLand] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { username } = useContext(UsernameContext);
  const [onlineUsersList, setOnlineUsersList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const [imgUrl, setImgUrl] = useState('');
  const [isFile , setIsFile] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  

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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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



const handleUpload = async () => {
  if (!selectedFile) {
    alert('Please select a file first.');
    return;
  }

  // Convert file to base64
  const toBase64 = (file) => 
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  try {
    const base64Image = await toBase64(selectedFile); // Convert to base64

    const response = await axios.post("http://localhost:5001/api/img/upload/document", {
      image_url: base64Image,  // Send as 'image_url' field
    });

    // alert("File uploaded successfully!");
    setNewMessage(selectedFile.name);
    setImgUrl(response.data.data);
    setIsFile(true);
    // handleSendMessage();
    console.log("Upload Response:", response.data.data);


    // Clear selected file after upload
    setSelectedFile(null);
    // setImgUrl('')

  } catch (error) {
    console.error("Error uploading file:", error);
    // alert("Failed to upload file.");
  }
};



  const handleCloseDoc = () => setOpenDoc(false);

  const handleOpenDoc = async (land) => {
    setSelectedLand(land);
    setOpenDoc(true);
    console.log(land);
  };

  const handleClose = () => setOpen(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      sender_mail: username,
      receiver_mail: selectedLand.username,
      message: newMessage,
      url: imgUrl, // Add the URL of the file
      isFile: isFile
    };

    socket.emit('sendMessage', messageData);
    setMessages([...messages, messageData]);
    setNewMessage('');
    setIsFile(false);
    setImgUrl('');
  };

  // Filter lands based on search term
  const filteredLands = lands.filter(land =>
    land.city_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainCard title="Land Details">
      <Grid container spacing={gridSpacing}>
        <Grid item xs={12}>
          <SubCard title="Available Lands">
            {/* Search Box */}
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Grid container spacing={gridSpacing}>
              {filteredLands.map((land) => (
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
                      <Button
                        size="large"
                        variant="contained"
                        color="secondary"
                        onClick={() => handleOpenDoc(land)}
                        sx={{
                          marginLeft: 'auto',
                          // minWidth: '120px',
                          // maxWidth: '200px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 0.5,
                          px: 2,
                          whiteSpace: 'nowrap',
                        }}
                        startIcon={<DescriptionIcon sx={{ fontSize: 22 }} />}
                      >
                      Doc
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
          gap: 1,
          p: 1.5,
          borderRadius: '8px',
          backgroundColor: '#f5f5f5',
          boxShadow: 1,
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
          {/* <Typography variant="body1">{msg.message}</Typography> */}
          {msg.isFile ? (
  <Box>
    <img 
      src={msg.url} 
      alt="Uploaded file" 
      style={{ maxWidth: '100%', height: 'auto' }} 
    />
    <Typography variant="body1">{msg.message}</Typography>
  </Box>
) : (
  <Typography variant="body1">{msg.message}</Typography>
)}


        </Box>
      ))}
      <div ref={messagesEndRef} />
    </Box>

    {/* Input and File Upload Section */}
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
      {/* File Upload Button */}
      <input
        type="file"
        id="file-input"
        style={{ display: 'none' }}
        onChange={(e) => setSelectedFile(e.target.files[0])}
      />
      <label htmlFor="file-input">
      <Button size="large" variant="contained" component="span">
  <AddCircleOutlineIcon sx={{ mr: 1 }} /> File
</Button>      </label>

      {/* Message Input */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Type a message..."
        value={newMessage}
        onChange={(e) => setNewMessage(e.target.value)}
      />

      {/* Send Message Button */}
      <Button size="large" variant="contained" onClick={handleSendMessage}>
        Send
      </Button>
    </Box>

    {/* File Preview Section */}
    {selectedFile && (
      <Box sx={{
        mt: 2,
        p: 2,
        border: '1px solid #ccc',
        borderRadius: 2,
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <Typography variant="body1">{selectedFile.name}</Typography>
        <Button variant="contained" color="primary" onClick={handleUpload}>
          Upload
        </Button>
      </Box>
    )}
  </Box>
</Modal>


      {/* Document Modal */}
      <Modal open={openDoc} onClose={handleCloseDoc}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 500,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 3,
          textAlign: 'center',
        }}>
          <Typography variant="h6" sx={{ mb: 2 }}>Document Preview</Typography>
          <img
            src={selectedLand?.doc_image}
            alt="Document"
            style={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 8 }}
          />
          <Button
            onClick={handleCloseDoc}
            sx={{ mt: 2, width: '100%' }}
            variant="contained"
            color="error"
          >
            Close
          </Button>
        </Box>
      </Modal>
    </MainCard>
  );
};

export default LandDetails;