import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import { Container } from '@mui/material';
import Page from 'src/components/Page';
import Header from './Header';

import AZContractorAgreementReact from '../Contracts/ArizonaReact/AZIndependentContractor'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT ALERT
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

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

function SignICA(props) {
  const classes = useStyles();

  //SNACKBAR State Variables
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('Unknown Error')
  const [loading, setLoading] = useState(false)

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

  const [contract, setContract] = useState(<AZContractorAgreementReact history={props.history} scenario={'addingNewLicense'} dataCollected={dataCollected} setDataCollected={setDataCollected}/>)

  useEffect(() => {
    
    //Purpose: Set the state policies and procedure manual to display
    const selectContractState = () => {
      if(props.license.licenseState === 'AZ') {
        setContract(<AZContractorAgreementReact history={props.history} scenario={'addingNewLicense'} dataCollected={dataCollected} setDataCollected={setDataCollected}/>)
      }
    }
    selectContractState();
  // eslint-disable-next-line
  },[loading])


  return (
    <Page
      className={classes.root}
      title="Sign Independent Contractor Agreement"
    >
      <Container maxWidth="lg">
        <Header />
        <Snackbar open={open} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
          <AlertFunk onClose={handleClose} severity="error">
            {errorMessage}
          </AlertFunk>
        </Snackbar>
        {contract}
      </Container>
    </Page>
  );
}

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
      license: state.license.license,
      licenseNumber: state.license.licenseNumber
  };
};

const mapDispatchToProps = dispatch => {
  return {
      userSetUser: (user) => dispatch(actions.userSetUser(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignICA);
