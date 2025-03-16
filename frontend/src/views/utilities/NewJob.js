import React, { useContext, useState } from 'react';
// import { useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  TextField,
  Typography,
  Grid,
  Container,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import { toast } from 'react-toastify';
import UsernameContext from '../context/context';



const NewJobPostingForm = () => {
  const {username}  = useContext(UsernameContext);
  // const theme = useTheme();

  // State to manage form inputs
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary: '',
    company_name: '',
    postedBy: username,
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    
      try {
        const response = await fetch('http://localhost:5001/api/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      const data = await response.json();

      if (response.ok) {
        toast.success('Job Posted Successfully!', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
        });

        // Reset form after successful submission
        setFormData({
          title: '',
          description: '',
          requirements: '',
          location: '',
          salary: '',
          company_name: '',
          postedBy: username,
        });
      } else {
        toast.error(data.message || 'Failed to post job', {
          position: 'top-right',
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: 'light',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Something went wrong. Please try again later.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: 'light',
      });
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          New Job Posting
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Job Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Job Title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
              />
            </Grid>

            {/*company name */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name"
                name="company_name"
                value={formData.company_name}
                onChange={handleInputChange}
                required
              />
            </Grid>

            {/* Job Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
              />
            </Grid>

            {/* Job Requirements */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                multiline
                rows={4}
                required
              />
            </Grid>

            {/* Job Location */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
              />
            </Grid>

            {/* Job Salary */}
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel htmlFor="salary">Salary</InputLabel>
                <OutlinedInput
                  id="salary"
                  name="salary"
                  value={formData.salary}
                  onChange={handleInputChange}
                  startAdornment={<InputAdornment position="start">$</InputAdornment>}
                  label="Salary"
                  type="number"
                  required
                />
              </FormControl>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" size="large">
                Post Job
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default NewJobPostingForm;