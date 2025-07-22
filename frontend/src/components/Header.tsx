import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const HeaderContainer = styled(Paper)(({ theme }) => ({
  background: `linear-gradient(135deg, rgba(25, 118, 210, 0.9) 0%, rgba(156, 39, 176, 0.9) 100%), 
               url('https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  color: 'white',
  padding: theme.spacing(3, 0),
  marginBottom: theme.spacing(2),
  borderRadius: 0,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.3)',
    zIndex: 1,
  },
}));

const HeaderContent = styled(Box)(({ theme }) => ({
  position: 'relative',
  zIndex: 2,
  textAlign: 'center',
  maxWidth: '1200px',
  margin: '0 auto',
  padding: theme.spacing(0, 3),
}));

const Header: React.FC = () => {
  return (
    <HeaderContainer elevation={3}>
      <HeaderContent>
        <Typography
          variant="h2"
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' },
            marginBottom: 1,
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
            letterSpacing: '0.5px',
          }}
        >
          GenAI Agents for Automatic Pull Request Review
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 400,
            fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
            opacity: 0.9,
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
            fontStyle: 'italic',
            marginBottom: 1,
          }}
        >
          Tian Liu, PhD Intern @ Visa Research
        </Typography>
        <Typography
          variant="body1"
          sx={{
            opacity: 0.8,
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            maxWidth: '800px',
            margin: '8px auto 0',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
          }}
        >
          Thanks to Xutong Wang, Taigao Ma, Yiran Li, Weijia Xu, Sheng Wang, and Dan Wang for their valuable suggestions!
        </Typography>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header; 