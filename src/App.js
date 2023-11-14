import React from 'react';
import { Router } from 'react-router-dom';
import { renderRoutes } from 'react-router-config';
import { createBrowserHistory } from 'history';
// import MomentUtils from '@date-io/moment';
// import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
// import 'react-perfect-scrollbar/dist/css/styles.css';
import routes from './routes'
import GoogleAnalytics from './components/GoogleAnalytics';
import ScrollReset from './components/ScrollReset';
import StylesProvider from './components/StylesProvider';
//FULLSTORY IMPORTS
// import FullStory from 'react-fullstory';
import { FullStoryAPI } from 'react-fullstory';
import FreshChat from 'react-freshchat';

//Required to use Stripe anywhere in the app
// import { Elements } from '@stripe/react-stripe-js'
// import {loadStripe} from '@stripe/stripe-js';

//SAGA IMPORTS
import { connect } from 'react-redux';
// import * as actions from './store/actions/index';

import './mixins/chartjs';
import './mixins/moment';
import './mixins/validate';
import './mixins/prismjs';
import './mock';
import './assets/scss/main.scss';

const history = createBrowserHistory()

// const stripePromise = loadStripe(process.env.STRIPE_KEY_AZ);

const App = (props) => {
  if(process.env.REACT_APP_USER_BRANCH === 'master') {
    FullStoryAPI('identify', props.globalUser.id !== undefined ? props.globalUser.id : '', {
      firstName: props.globalUser.username !== undefined ? props.globalUser.username: '',
      lastName: props.globalUser.userLastName !== undefined ? props.globalUser.userLastName : '',
      email: props.globalUser.email !== undefined ? props.globalUser.email : ''
    });
  }

  // console.log('app propsssssssss',props.singInTest);
  console.log('app.js user',process.env.REACT_APP_USER_BRANCH);

  return (
    // props.authState === 'signedIn' ?
    <>
    {props.singInTest === 'onSignedIn' ?
        <StylesProvider direction={'ltr'}>
          {/* <LocalizationProvider 
          // utils={MomentUtils}
            dateAdapter={AdapterDateFns}
          > */}
            {/* <Elements stripe={stripePromise}> */}
              <Router history={history}>
                <ScrollReset />
                <GoogleAnalytics />
                <FreshChat
                  token={process.env.REACT_APP_FRESHCHAT_TOKEN}
                  host={"https://wchat.freshchat.com"}
                  onInit={widget => {
                    widget.init({
                      config: {
                        disableNotifications: true,
                        },
                    }) 
                    widget.user.setProperties({
                      // first_name: props.globalUser.userFirstName !== undefined ? props.globalUser.userFirstName : '',
                      first_name: props?.username  !== undefined ? props?.username : '',
                      // last_name: props.globalUser.userLastName !== undefined ? props.globalUser.userLastName : '',
                      last_name: props?.username !== undefined ? props?.username : '',
                      // email: props.globalUser.email !== undefined ? props.globalUser.email : '',
                      email: props?.username  !== undefined ? props?.username : '',
                      phone: props.globalUser.userPhone !== undefined ? props.globalUser.userPhone : '+38992'})
                      widget.init({
                        config: {
                          content: {
                            headers: {
                              chat: 'Give us feedback!',
                              chat_help: 'Reach out to us if you have any questions',
                            }
                          }
                        }
                      })
                  }}
                />
                  {renderRoutes(routes)}
              </Router>
            {/* </Elements> */}
          {/* </LocalizationProvider> */}
        </StylesProvider> 
        : <p>DONE</p>}
    </>
  );
  // return(
  //   <>
  //   {props.authState === 'signedIn' ?
  //     <div>
  //       <p>Hello</p>
  //     </div>

  //   : <p>DONE</p>
  // }
  //   </>
  // )
}

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
  };
};

export default connect(mapStateToProps, null)(App);
