// import React from "react";
// import { VerifyContact } from "aws-amplify-react";
// import AuthVerifyContactContainer from './AuthVerifyContactContainer'
// import Topbar from './Topbar'

// export class AuthVerifyContact extends VerifyContact {

//   constructor(props) {
//     super(props);
//     this._validAuthStates = ["verifyContact"];
//   }
//   showComponent(theme) {

//     return (
//       <>
//         <Topbar/>
//         <AuthVerifyContactContainer
//           onSignIn={() => super.changeState('signIn')}
//           onSignedIn={() => super.changeState('signedIn')}
//         />
//       </>
//     )
//   }
// }

// export default AuthVerifyContact;

import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import AuthVerifyContactContainer from './AuthVerifyContactContainer';
import Topbar from './Topbar';

const AuthVerifyContact = () => {
  const { authState, toSignIn } = useAuthenticator((context) => [context.authState, context.toSignIn]);

  if (authState !== 'verifyContact') {
    return null;
  }

  const handleSignIn = () => {
    toSignIn();
  };

  // Assuming 'signedIn' is handled elsewhere in the application after verification
  // You would also need to provide a way for users to verify their contact within the AuthVerifyContactContainer

  return (
    <>
      <Topbar/>
      <AuthVerifyContactContainer
        onSignIn={handleSignIn}
        // onSignedIn is not provided because it would be part of the post-verification flow
      />
    </>
  );
};

export default AuthVerifyContact;
