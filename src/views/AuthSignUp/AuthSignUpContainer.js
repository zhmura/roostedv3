import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import Page from 'src/components/Page';
import SignUpForm from './SignUpForm';
import { isMobile } from 'react-device-detect'
import { LinearProgress } from '@mui/material';

function AuthSignUpContainer(props) {

  const [loading, setLoading] = useState(false)

  return (
    <Page
      style={
        {
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '6rem 2rem'
        }
      }
      title="Sign Up"
    >
      <Card 
        style={{
          maxWidth: '100%',
          overflow: 'visible',
          //display: 'flex',
          position: 'relative',
          width: isMobile ? '100%' : '30%'
        }}>
        {loading ? <LinearProgress/> : <React.Fragment/>}
        <CardContent style={
          {
            padding: '8rem, 4rem, 3rem, 4rem',
            flexGrow: 1,
            flexBasis: '50%',
            width: '100%'
          }
        }>
          
          <Typography
            variant="h4"
            align='center'
          >
            <div style={{fontFamily: 'Roboto', color: '#1CA6FC'}}>
              Sign Up
            </div>
          </Typography>
          <div align="center" style={{marginTop: '1rem'}}>
            <img
              alt="Logo"
              src="/images/logos/owlie_transparent.png"
              height="70px"
            />
          </div>
          <SignUpForm 
          onConfirmSignUp={props.onConfirmSignUp}
          onLoading={props.onLoading}
          onSignUp={props.onSignUp}
          setLoading={setLoading}
          loading={loading}
          style={
            {
              marginTop: '1.5rem'
            }
          } />

          <div style={{marginTop: '1rem', cursor: 'pointer', color: '#1ca6fc'}}>
            <Typography variant='subtitle2' onClick={props.onSignIn} color='secondary'>
              Back to Sign In
            </Typography>
          </div>
        </CardContent>
        {loading ? <LinearProgress/> : <React.Fragment/>}
      </Card>
      
    </Page>
  );
}

export default AuthSignUpContainer;
