import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid, Container, Button, Collapse } from '@mui/material';
import UsernameContext from 'views/context/context';


const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [expanded, setExpanded] = useState({});
  const { username } = React.useContext(UsernameContext);
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/jobs');
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };

    fetchJobs();
  }, []);

  const handleApply = async (jobId) => {
    try {
      const response = await axios.post('http://localhost:5001/api/applyJob', { jobId ,username });
      alert(response.data.message || 'Applied successfully!');
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Failed to apply for job');
    }
  };
  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Container>
      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid item key={job._id} xs={12} sm={6} md={4}>
            <Card className="p-4 shadow-lg rounded-2xl">
              <CardContent>
                <Typography variant="h5" component="div" className="font-bold text-xl mb-2">
                  {job.title}
                </Typography>
                <Typography color="textSecondary" className="text-gray-600 mb-1">
                  {job.company_name}
                </Typography>
                <Typography variant="body2" className="mb-1">
                  <strong>Location:</strong> {job.location}
                </Typography>
                <Typography variant="body2" className="mb-1">
                  <strong>Salary:</strong> ₹{job.salary}
                </Typography>
                <Typography variant="body2" className="mb-2">
                  <strong>Posted By:</strong> {job.postedBy}
                </Typography>

                <Collapse in={expanded[job._id]}>
                  <Typography variant="body2" className="mb-2">
                    <strong>Description:</strong> {job.description}
                  </Typography>
                  <Typography variant="body2" className="mb-2">
                    <strong>Requirements:</strong>
                    <ul className="list-disc list-inside mt-1">
                      {job.requirements.map((requirement, index) => (
                        <li key={index} className="text-gray-700">{requirement}</li>
                      ))}
                    </ul>
                  </Typography>
                </Collapse>

                <Button 
                  onClick={() => toggleExpand(job._id)} 
                  className="mt-2 bg-gray-300 hover:bg-gray-400 text-black py-1 px-3 rounded mr-2"
                >
                  {expanded[job._id] ? 'Show Less' : 'Show More'}
                </Button>

                <Button onClick={() => handleApply(job._id)}  className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default JobList;
