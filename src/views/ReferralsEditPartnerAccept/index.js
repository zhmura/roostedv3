import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import { Container, LinearProgress } from '@mui/material';
import Page from 'src/components/Page';
import Header from './Header';

import AZReferralAgreement from '../Contracts/ArizonaReact/AZReferralAgreement'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT ALERT
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { API, graphqlOperation } from "aws-amplify";
import { getReferral } from "../../graphql/queries"

const AlertFunk = React.forwardRef((props, ref) => (
  <Alert elevation={6} variant="filled" ref={ref} {...props} />
));

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
  signPolicies: {
    marginTop: theme.spacing(3)
  },
}));

function SignReferralAgreement(props) {
  const classes = useStyles();

  //SNACKBAR State Variables
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('Unknown Error')
  const [loading, setLoading] = useState(false)
  const [referral, setReferral] = useState({})
  

  //SNACKBAR close method
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const dataCollected = {
    history: props.history,
    loading: loading,
    open: open,
    errorMessage: errorMessage,
  }

  const setDataCollected = {
    setLoading: setLoading,
    setOpen: setOpen,
    setErrorMessage: setErrorMessage
  }

  const [contract, setContract] = useState(<AZReferralAgreement history={props.history} referral={referral} scenario={'signReferralAgreement'} dataCollected={dataCollected} setDataCollected={setDataCollected}/>)

  useEffect(() => {

    const fetchReferral = async () => {
      try {
        setLoading(true)
        // const currentUser = await Auth.currentAuthenticatedUser();
        // const sub = currentUser.signInUserSession.idToken.payload.sub
        const { data } = await API.graphql(graphqlOperation(getReferral, {id: props.match.params.referralId}))
        setReferral(data.getReferral)
        if(data.getReferral.referralReferringAgentState === 'AZ') {
          setContract(<AZReferralAgreement history={props.history} referral={data.getReferral} scenario={'signReferralAgreement'} dataCollected={dataCollected} setDataCollected={setDataCollected}/>)
        }
        setLoading(false)
      }catch(error) {
        console.log(error)
        setLoading(false)
        setErrorMessage('Failed to retreive referral information. Try again or email support@roosted.io.')
      }
    }

    fetchReferral()
  
  // eslint-disable-next-line
  }, [])

  // useEffect(() => {
    
  //   //Purpose: Set the state policies and procedure manual to display
  //   const selectContractState = () => {
  //     if(props.license.licenseState === 'AZ') {
  //       setContract(<AZReferralAgreement history={props.history} referral={referral} scenario={'signReferralAgreement'} dataCollected={dataCollected} setDataCollected={setDataCollected}/>)
  //     }
  //   }
  //   selectContractState();
  // // eslint-disable-next-line
  // },[loading])


  return (
    <Page
      className={classes.root}
      title="Sign Referral Agreement"
    >
      <Container maxWidth="lg">
        <Header />
        <Snackbar open={open} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
          <AlertFunk onClose={handleClose} severity="error">
            {errorMessage}
          </AlertFunk>
        </Snackbar>
        {loading ? <LinearProgress style={{marginTop: '1rem'}}/> : contract}
      </Container>
    </Page>
  );
}

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
  };
};

const mapDispatchToProps = dispatch => {
  return {
      userSetUser: (user) => dispatch(actions.userSetUser(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignReferralAgreement);
