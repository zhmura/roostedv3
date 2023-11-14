// import React from "react";
// import { SignUp } from "aws-amplify-react";
// import AuthSignUpContainer from './AuthSignUpContainer'
// import Topbar from './Topbar'

// export class AuthSignUp extends SignUp {

//   constructor(props) {
//     super(props);
//     this._validAuthStates = ["signUp"];
//   }
//   showComponent(theme) {

//     return (
//       <>
//         <Topbar/>
//         <AuthSignUpContainer
//           onConfirmSignUp={() => super.changeState('confirmSignUp')}
//           onSignIn={() => super.changeState('signIn')}
//           onLoading={() => super.changeState('loading')}
//           onSignUp={() => super.changeState('signUp')}
//         />
//       </>
//     )
//   }
// }

// export default AuthSignUp;

import React from 'react';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import AuthSignUpContainer from './AuthSignUpContainer';
import Topbar from './Topbar';

const AuthSignUp = () => {
  const { toSignIn, toSignUp, updateForm } = useAuthenticator((context) => [context.toSignIn, context.toSignUp, context.updateForm]);

  const handleConfirmSignUp = () => {
    console.log('work handleConfirmSignUp');
    updateForm('authState', 'confirmSignUp');
  };

  const handleSignIn = () => {
    toSignIn();
  };

  const handleLoading = () => {
    // Handle loading logic here if necessary
  };

  const handleSignUp = () => {
    console.log('funck work');
    toSignUp();
  };

  // Render only when signUp state is active
  return (
    <Authenticator>
      {({ signOut, user }) => (
        false ? (
          // If signed in, show sign out button (or other signed-in state)
          <button onClick={signOut}>Sign out</button>
        ) : (
          // If not signed in, show the signUp form
          <>
            <Topbar />
            <AuthSignUpContainer
              onConfirmSignUp={handleConfirmSignUp}
              onSignIn={handleSignIn}
              onLoading={handleLoading}
              onSignUp={handleSignUp}
              text={'text'}
            />
          </>
        )
      )}
    </Authenticator>
  );
};

export default AuthSignUp;
