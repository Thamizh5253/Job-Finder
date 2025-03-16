import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid, Container, Button, Collapse } from '@mui/material';
import UsernameContext from 'views/context/context';
import { Modal, CircularProgress } from '@mui/material';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [expanded, setExpanded] = useState({});
  const { username } = React.useContext(UsernameContext);
  
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://localhost:5001/api/jobs', {
          params: { username },
        });
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      }
    };
    
    fetchJobs();
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // State setup
  const [openModal, setOpenModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
//   const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Open modal and set selected job
  const handleShowCandidates = (job) => {
    setSelectedJob(job);
    setOpenModal(true);
    setSelectedCandidate(null);
  };

  // Fetch user profile when a candidate ID is clicked
  const handleViewProfile = async (candidateId) => {
    try {
      setLoadingProfile(true);
      const response = await axios.get(`http://localhost:5001/api/user/${candidateId}`);
      setUserProfile(response.data);
      setSelectedCandidate(candidateId);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoadingProfile(false);
    }
  };

  // Close modal
  const handleClose = () => {
    setOpenModal(false);
    setSelectedJob(null);
    setSelectedCandidate(null);
    setUserProfile(null);
  };

  return (
    <Container className={openModal ? 'blur' : ''}>
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
                {
                  job.candidates.length > 0 && ( 
                    <Button onClick={() => handleShowCandidates(job)}>
                      View Applicants
                    </Button>
                  )
                }
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Modal open={openModal} onClose={handleClose}>
        <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '10px', margin: '10% auto', width: '50%' }}>
          {selectedJob && (
            <>
              <Typography variant="h6">Applicants for {selectedJob.title}</Typography>
              {selectedJob.candidates.map((candidate) => (
                <Button key={candidate.candidateId} onClick={() => handleViewProfile(candidate.candidateId)}>
                  {candidate.candidateId}
                </Button>
              ))}
            </>
          )}
          {loadingProfile && <CircularProgress />}
          {userProfile && (
            <Typography variant="body2">{userProfile.name} - {userProfile.email}</Typography>
          )}
        </div>
      </Modal>

      <style jsx>{`
        .blur {
          filter: blur(5px);
        }
      `}</style>
    </Container>
  );
};

export default JobList;
