import React from 'react';
//import { Link as RouterLink } from 'react-router-dom';
//import { makeStyles } from '@mui/styles';
import {
  CircularProgress
} from '@mui/material';
import Page from 'src/components/Page';
//import useMediaQuery from '@mui/material/useMediaQuery';
//import { useTheme } from '@mui/material/styles';

function AuthSignInContainer(props) {
  //const theme = useTheme();
  //const matches = useMediaQuery(theme.breakpoints.down('md'));

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