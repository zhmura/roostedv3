// import React from "react";
// import { ForgotPassword } from "aws-amplify-react";
// import AuthForgotPasswordContainer from './AuthForgotPasswordContainer'
// import Topbar from './Topbar'

// export class AuthForgotPassword extends ForgotPassword {

//   constructor(props) {
//     super(props);
//     this._validAuthStates = ["forgotPassword"];
//   }
//   showComponent(theme) {

//     return (
//       <>
//         <Topbar/>
//         <AuthForgotPasswordContainer
//           onSignIn={() => super.changeState('signIn')}
//         />
//       </>
//     )
//   }
// }

// export default AuthForgotPassword;

import React from 'react';
import { ForgotPassword } from '@aws-amplify/ui-react';
import AuthForgotPasswordContainer from './AuthForgotPasswordContainer';
import Topbar from './Topbar';

class AuthForgotPassword extends React.Component {
  
  changeState(state, data) {
    if (this.props.onStateChange) {
      this.props.onStateChange(state, data);
    }
  }

  handleSignIn = () => {
    this.changeState('signIn');
  };

  render() {
    if (!this.props.authState || this.props.authState === 'forgotPassword') {
      return (
        <>
          <Topbar />
          <AuthForgotPasswordContainer
            onSignIn={this.handleSignIn}
          />
        </>
      );
    }
    return null;
  }
}

export default AuthForgotPassword;