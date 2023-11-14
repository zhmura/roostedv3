// import React from "react";
// import { Loading } from "aws-amplify-react";
// import AuthSpinnerContainer from './AuthSpinnerContainer'
// import Topbar from './Topbar'

// export class AuthSpinner extends Loading {

//   constructor(props) {
//     super(props);
//     this._validAuthStates = ["loading"];
//   }

//   showComponent(theme) {

//     return (
//       <>
//         <Topbar/>
//         <AuthSpinnerContainer/>
//       </>
//     )
//   }
// }

// export default AuthSpinner;

import React from 'react';
import { useAuthenticator } from '@aws-amplify/ui-react';
import AuthSpinnerContainer from './AuthSpinnerContainer';
import Topbar from './Topbar';

const AuthSpinner = () => {
  const { authState } = useAuthenticator();

  // Показувати завантаження лише, коли стан аутентифікації є 'loading'
  if (authState !== 'loading') {
    return null;
  }

  return (
    <>
      <Topbar/>
      <AuthSpinnerContainer/>
    </>
  );
};

export default AuthSpinner;
