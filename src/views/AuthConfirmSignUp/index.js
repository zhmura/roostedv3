// import React from "react";
// import { ConfirmSignUp } from "aws-amplify-react";
// import AuthSignUpContainer from './AuthConfirmSignUpContainer'
// import Topbar from './Topbar'

// export class AuthConfirmSignUp extends ConfirmSignUp {

//   constructor(props) {
//     super(props);
//     this._validAuthStates = ["confirmSignUp"];
//   }
//   showComponent(theme) {
//     return (
//       <>
//         <Topbar/>
//         <AuthSignUpContainer
//           onLoading={() => super.changeState('loading')}
//           onSignIn={() => super.changeState('signIn')}
//           onSignedIn={() => super.changeState('signedIn')}
//         />
//       </>
//     )
//   }
// }

// export default AuthConfirmSignUp;

import React from 'react';
import { ConfirmSignUp } from '@aws-amplify/ui-react';
import AuthSignUpContainer from './AuthConfirmSignUpContainer';
import Topbar from './Topbar';

class AuthConfirmSignUp extends React.Component {

  changeState(state, data) {
    if (this.props.onStateChange) {
      this.props.onStateChange(state, data);
    }
  }

  handleLoading = () => {
    this.changeState('loading');
  };

  handleSignIn = () => {
    this.changeState('signIn');
  };

  handleSignedIn = () => {
    this.changeState('signedIn');
  };

  render() {
    if (!this.props.authState || this.props.authState === 'confirmSignUp') {
      return (
        <>
          <Topbar />
          <AuthSignUpContainer
            onLoading={this.handleLoading}
            onSignIn={this.handleSignIn}
            onSignedIn={this.handleSignedIn}
          />
        </>
      );
    }
    return null;
  }
}

export default AuthConfirmSignUp;