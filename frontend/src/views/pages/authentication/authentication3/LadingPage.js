import React from 'react';
import { AppBar, Toolbar, Button, Typography, Container, Grid, Card, CardContent, Box } from '@mui/material';
import { Chat, LocationOn, AttachMoney, Login, HowToReg, ArrowForward } from '@mui/icons-material';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#F5F5F5' }}>
      
      {/* Navbar */}
      <AppBar position="static" sx={{ bgcolor: "#673AB7" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold', letterSpacing: 1, color: 'white' }}>
            Billboard Management System
          </Typography>
          <Button
            component={Link} to="/pages/login/login3"
            sx={{
              mx: 1,
              px: 3,
              py: 1,
              borderRadius: '8px',
              background: 'white',
              color: "#673AB7",
              '&:hover': { background: '#EDE7F6' }
            }}
            startIcon={<Login />}
          >
            Login
          </Button>
          <Button
            component={Link} to="/pages/register/register3"
            sx={{
              px: 3,
              py: 1,
              borderRadius: '8px',
              background: 'white',
              color: "#673AB7",
              '&:hover': { background: '#EDE7F6' }
            }}
            startIcon={<HowToReg />}
          >
            Register
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Container sx={{ mt: 10, textAlign: 'center' }}>
        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', color: '#673AB7' }}>
          Connect Landowners & Advertisers
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: '800px', margin: '0 auto' }}>
          Find the perfect billboard spaces at minimal cost with real-time communication.
        </Typography>
      </Container>

      {/* Features Section */}
      <Container sx={{ mt: 8, mb: 8 }}>
        <Grid container spacing={4}>
          {[ 
            { icon: <Chat />, title: "Real-Time Communication", desc: "Communicate directly with landowners and advertisers instantly." },
            { icon: <LocationOn />, title: "Find Premium Locations", desc: "Discover the best billboard locations at competitive prices." },
            { icon: <AttachMoney />, title: "Affordable Pricing", desc: "Get the best deals and minimize your advertising costs." }
          ].map((feature, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card 
                sx={{
                  textAlign: 'center', 
                  p: 3, 
                  boxShadow: 3,
                  borderRadius: '12px',
                  transition: '0.3s',
                  '&:hover': { boxShadow: 6 } 
                }}
              >
                <CardContent>
                  <Box sx={{ fontSize: 60, color: '#673AB7', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Get Started Button */}
      <Box textAlign="center" sx={{ mb: 6 }}>
        <Button
          component={Link} to="/pages/login/login3"
          variant="contained"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: '8px',
            fontSize: '1rem',
            background: '#673AB7',
            color: 'white',
            '&:hover': { background: '#5E35B1' }
          }}
          endIcon={<ArrowForward />}
        >
          Get Started
        </Button>
      </Box>

      {/* Footer */}
      <Box sx={{ mt: 'auto' }}>
        <AppBar position="static" sx={{ bgcolor: "#673AB7", py: 2 }}>
          <Toolbar sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <Typography variant="body1" sx={{ fontWeight: 'bold', color: "white" }}>
              © 2025 Billboard Management System. All rights reserved.
            </Typography>
          </Toolbar>
        </AppBar>
      </Box>
    </Box>
  );
}

export default LandingPage;