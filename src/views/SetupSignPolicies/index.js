import React, { useState, useEffect } from 'react';
import { makeStyles } from '@mui/styles';
import { Container, LinearProgress } from '@mui/material';
import Page from 'src/components/Page';
import Header from './Header';
import AZPoliciesAndProceduresReact from '../../views/Contracts/ArizonaReact/AZPoliciesAndProcedures';

//IMPORT ALERT
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

const AlertFunk = React.forwardRef((props, ref) => (
  <Alert elevation={6} variant="filled" ref={ref} {...props} />
));

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
  getLicenseInfo: {
    marginTop: theme.spacing(3)
  },
}));

function SignPolicies(props) {
  const classes = useStyles();


  ///////////////// Process State Variables  /////////////////
  const [loading, setLoading] = useState(false);
  ///////////////// END Process State Variables /////////////////////

  //////////////////SNACKBAR State Variables////////////////
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('Unknown Error')

  //SNACKBAR close method
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };
  ////////////////////// END SNACK BAR ///////////////////

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

  const [contract, setContract] = useState(<AZPoliciesAndProceduresReact history={null} scenario={'setup'} dataCollected={dataCollected} setDataCollected={setDataCollected}/>)

  useEffect(() => {
    
    //Purpose: Set the state policies and procedure manual to display
    const selectContractState = () => {
      if(props.globalUser.userRoostedLicenses.items[0].licenseState === 'AZ') {
        setContract(<AZPoliciesAndProceduresReact history={null} scenario={'setup'} dataCollected={dataCollected} setDataCollected={setDataCollected}/>)
      }
    }
    selectContractState();
  // eslint-disable-next-line
  },[loading])


  return (
    <Page
      className={classes.root}
      title="Policies and Procedures"
    >
      <Container maxWidth="lg">
        {loading ? <LinearProgress/> : <React.Fragment/>}
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
  };
};

const mapDispatchToProps = dispatch => {
  return {
      userSetUser: (user) => dispatch(actions.userSetUser(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignPolicies);
