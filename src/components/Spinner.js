import React from 'react';
import {
  CircularProgress
} from '@mui/material';
import Page from '../components/Page';

function AuthSignInContainer(props) {

  return (
    
    <Page
      style={
        {
          height: '100vh',
          width: '100vw',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }
      }
      title="Loading"
    >
      <CircularProgress/>
    </Page>
  );
}

export default AuthSignInContainer;