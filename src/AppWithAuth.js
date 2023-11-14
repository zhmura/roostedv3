import React, {useState} from "react";
// import { 
//   SignIn, 
//   SignUp, 
//   ConfirmSignUp,
//   Greetings,
//   ForgotPassword,
//   Loading,
//   TOTPSetup,
//   RequireNewPassword,
//   VerifyContact,
//   Authenticator,
// } from "aws-amplify-react";
import { Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import App from "./App";
import AuthSignIn  from "./views/AuthSignIn/index"
import AuthSignUp from "./views/AuthSignUp/index"
import AuthSpinner from "./views/AuthSpinner/index"
import AuthConfirmSignUp from "./views/AuthConfirmSignUp/index"
import AuthForgotPassword from "./views/AuthForgotPassword/index"
import AuthVerifyContact from "./views/AuthVerifyContact/index"
import SignUpForm from "./views/AuthSignUp/SignUpForm";
import awsconfig from "./aws-exports";
import { Amplify } from 'aws-amplify';
import { ThemeProvider } from '@mui/styles';
import { theme } from './theme';
import FullStory from 'react-fullstory';

//USE to get query params on auth screens
import { createBrowserHistory } from 'history';

//set the redirect UI
console.log('process.env',process.env.REACT_APP_USER_BRANCH)
const redirect = process.env.REACT_APP_USER_BRANCH === 'master' ? 'https://app.roosted.io/' : process.env.REACT_APP_USER_BRANCH === 'staging' ? 'https://staging.dtuj2j3vg7cl3.amplifyapp.com/' : 'http://localhost:3000/'
console.log('redirect',redirect);
awsconfig.oauth.redirectSignIn = redirect
awsconfig.oauth.redirectSignOut = redirect
awsconfig.authenticationFlowType = 'USER_PASSWORD_AUTH'

console.log('redirect',redirect);
console.log('awsconfig',awsconfig);

//Configure amplify (only do this once for the app or it will cause errors)
Amplify.configure(awsconfig);

const history = createBrowserHistory();

localStorage.setItem("setUpType", history.location.search)

const AppWithAuth = props => {
  const [singInTest, setSingInTest] = useState('')
  const [singInUser, setSingInUser] = useState([])

  console.log('propsSing', props);
  console.log('setSingInTestPROPSSS', singInTest);

  //window.LOG_LEVEL = 'DEBUG';
  return (
    <div>
      {process.env.REACT_APP_USER_BRANCH === 'master' ? <FullStory org="M15AZ" /> : <React.Fragment />}
      {/* <ThemeProvider theme={theme}> */}
        <Authenticator
          authState={history.location.pathname === '/signup' ? 'signUp' : 'signIn'}
        >
          {
            !singInTest ? 
            <>
            <AuthSpinner />
            {/* <SignUpForm/> */}
            <AuthSignIn 
            setSingInUser={setSingInUser}
            setSingInTest={setSingInTest}
            history={history} />
            <AuthSignUp />
            {/* <AuthConfirmSignUp /> */}
            {/* <AuthForgotPassword /> */}
            <AuthVerifyContact />
            </>
            :
            <App 
              singInUser={singInUser}
              singInTest={singInTest}
            />
          }
        </Authenticator>
      {/* </ThemeProvider> */}
    </div>
  );
}

export default AppWithAuth;
          {/* <TOTPSetup /> */}

          {/* <RequireNewPassword /> */}
