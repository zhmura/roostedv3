import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import { Container, Button } from '@mui/material'
import Page from 'src/components/Page'
import Header from './Header'
import SelectUserTypeForm from './SelectType'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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
  selectReferralType: {
    marginTop: theme.spacing(3)
  },
  actions: {
    marginTop: theme.spacing(3)
  },
  buttonProgress: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  wrapper: {
    marginTop: theme.spacing(3),
    position: 'relative',
  },
}));

function SelectReferralType(props) {
  const classes = useStyles();

  //Data State Variables
  const [referralType, setReferralType] = useState('roosted')

  //Process State Variables
  const [loading, setLoading] = useState(false)

  const dataCollected = {
    referralType: referralType
  }

  const setDataCollected = {
    setReferralType: setReferralType
  }

  //SNACKBAR State Variables
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('Unknown Error')

  //SNACKBAR close method
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const handleNext = async () => {
    try {
      props.referralSetReferral({referralType: referralType})
      props.history.push('/referrals/create/admin/get-client-info')
    } catch(error) {
      setLoading(false)
      setErrorMessage('System failed to save input. Try again or contact support@roosted.io.')
      setOpen(true)
      console.log(error)
    }
  }

  useEffect(() => {
    const getReferralData = async () => {
      try {
        setLoading(true)
        if(props.referral.referralType !== undefined) {
          setReferralType(props.referral.referralType)
        } else {
          setReferralType('buyerReferral')
        }
        setLoading(false)
      } catch(error) {
        setLoading(false)
        setErrorMessage(error.message)
        setOpen(true)
        console.log(error)
      }
    }
    getReferralData()
  // eslint-disable-next-line
  }, []);
 
  return (
    <Page
      className={classes.root}
      title="Create Referral"
    >
      <Container maxWidth="lg">
        <Header />
        <Snackbar open={open} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
          <AlertFunk onClose={handleClose} severity="error">
            {errorMessage}
          </AlertFunk>
        </Snackbar>
        <SelectUserTypeForm 
          className={classes.selectReferralType}
          dataCollected={dataCollected}
          setDataCollected={setDataCollected} 
          loading={loading}/>
        <div className={classes.wrapper}>
          <Button
            color="primary"
            disabled={props.globalUser.userType !== 'broker' && props.globalUser.userType !== 'admin'}
            variant="contained"
            onClick={() => handleNext()}
            endIcon={<ArrowForwardIosIcon/>}
          >
            Next
          </Button>
        </div>
      </Container>
    </Page>
  );
}

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
      referral: state.referral.referral,
  };
};

const mapDispatchToProps = dispatch => {
  return {
      //userSetSetupUserType: (userType) => dispatch(actions.userSetSetupUserType(userType)),
      userSetUser: (user) => dispatch(actions.userSetUser(user)),
      referralSetReferral: (referral) => dispatch(actions.referralSetReferral(referral))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectReferralType);
