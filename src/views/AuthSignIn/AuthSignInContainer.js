import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import Page from 'src/components/Page';
import SignInForm from './SignInForm';
import { isMobile } from 'react-device-detect'
import { LinearProgress } from '@mui/material';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
function AuthSignInContainer(props) {
  const { toSignUp } = useAuthenticator((context) => [context.toSignUp]);
  const [loading, setLoading] = useState(false)

  console.log('propsAuthSignInContainer', props);

  useEffect(()=> {
    props.setSingInUser(props.user)
  },[])

  // setSingInUser={props.setSingInUser}
  // user={user}

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
      title="Sign In"
    >  
      <Card 
        style={{
          maxWidth: '100%',
          overflow: 'visible',
          // display: 'flex',
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
              Welcome
            </div>
          </Typography>
          <div align="center" style={{marginTop: '1rem'}}>
            <img
              alt="Logo"
              src="/images/logos/owlie_transparent.png"
              height="70px"
            />
          </div>
          <SignInForm
          onSignedIn={props.onSignedIn}
          onConfirmSignUp={props.onConfirmSignUp}
          onLoading={props.onLoading}
          history={props.history}
          user={props.user}
          setLoading={setLoading}
          loading={loading}
          style={
            {
              marginTop: '1.5rem'
            }
          } />

          <div style={{marginTop: '1rem', cursor: 'pointer'}}>
            <Typography variant='subtitle2' onClick={toSignUp} color='secondary'>
              Create Account
            </Typography>
          </div>
          <div style={{cursor: 'pointer', color: 'secondary'}}>
            <Typography variant='subtitle2' onClick={props.onForgotPassword} color='secondary'>
              Forgot Password?
            </Typography>
          </div>
          <div align='center' style={{marginTop: '1rem'}}>
            <Typography variant='caption' > Need Help? support@roosted.io</Typography>
          </div>
        </CardContent>
        {loading ? <LinearProgress/> : <React.Fragment/>}
      </Card>

    </Page>
  );
}

export default AuthSignInContainer;
