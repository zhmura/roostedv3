// import React from "react";
// import { SignIn } from "aws-amplify-react";
// import AuthSignInContainer from './AuthSignInContainer'
// import Topbar from './Topbar'

// export class AuthSignIn extends SignIn {

//   constructor(props) {
//     super(props);
//     this._validAuthStates = ["signIn","signedUp"];
//   }
//   showComponent(theme) {
//     const handleConfirmSignUp = () => {
//       super.changeState('confirmSignUp')
//     }

//     return (
//       <>
//         <Topbar/>
//         <AuthSignInContainer
//           //onInputChange={this.handleInputChange}
//           onLoading={() => super.changeState('loading')}
//           onSignedIn={() => super.changeState('signedIn')}
//           onForgotPassword={() => super.changeState('forgotPassword')}
//           onSignUp={() => super.changeState('signUp')}
//           onConfirmSignUp={handleConfirmSignUp}
//           history={this.props.history}
//         />
//       </>
//     )
//   }
// }

// export default AuthSignIn;

import React from "react";
import { withAuthenticator, Authenticator } from '@aws-amplify/ui-react';
import AuthSignInContainer from './AuthSignInContainer';
// import Topbar from './Topbar';

const AuthSignIn = (props) => {


  
    return (
      <Authenticator>
        {({ signOut, user }) => (
          <div>
            {/* <Topbar onSignOut={signOut} /> */}
            <AuthSignInContainer
              // onSignedIn={props.setSingInTest}
              setSingInUser={props.setSingInUser}
              user={user}
              onSignedIn={props.setSingInTest}
              history={props.history}
              text={'text work'}
            />
          </div>
        )}
      </Authenticator>
    );

}

export default withAuthenticator(AuthSignIn);