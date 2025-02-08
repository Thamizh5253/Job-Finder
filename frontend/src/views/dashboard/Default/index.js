import React from 'react';
import { Container, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';

const Dashboard = () => {
  return (
    <Container maxWidth="md" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', height: '100vh', justifyContent: 'center' }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
        <Typography variant="h2" fontWeight={700} color="primary" gutterBottom>
          Welcome to SpotON
        </Typography>
        <Typography variant="h5" color="textSecondary" paragraph>
          Your brand deserves to be seen by the world. Let SpotON take it to new heights!
        </Typography>
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button variant="contained" color="primary" size="large">
            Get Started
          </Button>
        </motion.div>
      </motion.div>
    </Container>
  );
};

export default Dashboard;
