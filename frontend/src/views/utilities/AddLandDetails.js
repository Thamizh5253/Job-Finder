import { Card, TextField, Button, Grid, Box, InputLabel } from '@mui/material';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import MainCard from 'ui-component/cards/MainCard';
import { useContext } from 'react';

import UsernameContext from '../context/context';


const AddLandDetails = () => {

  const { username } = useContext(UsernameContext);

  const [formData, setFormData] = useState({
    doc_image: '',
    address: '',
    initial_price: '',
    land_image: '',
    city_name: '',
    username: username,
  });

  const [docPreview, setDocPreview] = useState('');
  const [landPreview, setLandPreview] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleDocSendFile = async (e) => {
    e.preventDefault();

    if (!docPreview) return;

    try {
      const res = await axios.post('http://localhost:5001/api/img/upload/document', {
        image_url: docPreview
      });
      console.log('res:', res);
      toast.success('Image Uploaded successfully', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });

      setFormData({
        ...formData,
        doc_image: res.data.data
      });
    } catch (err) {
      toast.error('There is a problem, Try Again!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });
    }
  };

  const handleDocFileUpload = (e) => {
    const file = e.target.files[0];
    var reader = new FileReader();
    reader.onloadend = function () {
      setDocPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };


  const handleLandSendFile = async (e) => {
    e.preventDefault();

    if (!landPreview) return;

    try {
      const res = await axios.post('http://localhost:5001/api/img/upload/land', {
        image_url: landPreview
      });
      toast.success('Image Uploaded successfully', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });

      setFormData({
        ...formData,
        land_image: res.data.data
      });
    } catch (err) {
      toast.error('There is a problem, Try Again!', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light'
      });
    }
  };

  const handleLandFileUpload = (e) => {
    const file = e.target.files[0];
    var reader = new FileReader();
    reader.onloadend = function () {
      setLandPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };



  // Form Submission
  const handleSubmit = async (event) => {
    // console.log('formData:', formData);
    event.preventDefault();
    // setFormData({
    //   ...formData,
    //   username: username,
    // });
    if (!formData.initial_price || !formData.city_name || !formData.address) {
      toast.error('Please provide all required fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/addLandDetails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success('Land details added successfully!');
      } else {
        toast.error('Failed to add land details.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('An error occurred while adding land details.');
    }
  };

  return (
    <MainCard title="Add Land Details">
      <Card sx={{ overflow: 'hidden' }}>
        <Box component="section" sx={{ p: 2, border: '1px dashed grey' }}>
          <Grid container spacing={0.3} direction="column">
            {/* Initial Price */}
            <Grid item sx={{ margin: '20px 0' }}>
              <TextField
                label="Initial Price"
                variant="outlined"
                name="initial_price"
                value={formData.initial_price}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* City Name */}
            <Grid item sx={{ margin: '20px 0' }}>
              <TextField
                label="City Name"
                variant="outlined"
                name="city_name"
                value={formData.city_name}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            {/* Address */}
            <Grid item sx={{ margin: '20px 0' }}>
              <TextField
                label="Address"
                variant="outlined"
                name="address"
                value={formData.address}
                onChange={handleChange}
                fullWidth
                multiline
                rows={3}
              />
            </Grid>

          
            

            {/* Land Image Upload */}

            <Grid item sx={{ margin: '20px 0' }}>
            <InputLabel sx={{ marginBottom: '5px', fontWeight: 'bold' }}>Land Image</InputLabel>

            <TextField
              type="file"
              onChange={handleLandFileUpload}
              variant="outlined"
              fullWidth
              InputLabelProps={{ shrink: true }}
              style={{ marginBottom: '10px', width: '50%' }}
            />
            <Grid container justify="center">
              {landPreview && (
                <Grid item>
                  <img src={landPreview} alt="Preview" height={'100px'} width={'100px'} />
                </Grid>
              )}
            </Grid>
            <Grid>
              <Button variant="contained" color="primary" onClick={handleLandSendFile}>
                Upload Image
              </Button>
            </Grid>
          </Grid>

            {/* Document Image Upload */}

            <Grid item sx={{ margin: '20px 0' }}>
            <InputLabel sx={{ marginBottom: '5px', fontWeight: 'bold' }}>Document Image</InputLabel>

            <TextField
              type="file"
              onChange={handleDocFileUpload}
              variant="outlined"
              fullWidth
              InputLabelProps={{ shrink: true }}
              style={{ marginBottom: '10px', width: '50%' }}
            />
            <Grid container justify="center">
              {docPreview && (
                <Grid item>
                  <img src={docPreview} alt="Preview" height={'100px'} width={'100px'} />
                </Grid>
              )}
            </Grid>
            <Grid>
              <Button variant="contained" color="primary" onClick={handleDocSendFile}>
                Upload Image
              </Button>
            </Grid>
          </Grid>

            {/* Submit Button */}
            <Grid item sx={{ margin: '5px 0' }}>
              <Button variant="contained" color="primary" onClick={handleSubmit}>
                Submit
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </MainCard>
  );
};

export default AddLandDetails;
