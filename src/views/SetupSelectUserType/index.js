import React, { useState, useEffect } from 'react'
import { makeStyles } from '@mui/styles'
import { Container, Button } from '@mui/material'
import Page from 'src/components/Page'
import Header from './Header'
import SelectUserTypeForm from './SelectUserType'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify"
import { updateUser } from "../../graphql/mutations"
//import { getUser } from "../../graphql/queries"

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
  selectUserType: {
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

function SelectUserType(props) {
  const classes = useStyles();

  //Data State Variables
  const [setupUserType, setSetupUserType] = useState('roosted')

  //Process State Variables
  const [loading, setLoading] = useState(false)

  const dataCollected = {
    setupUserType: setupUserType
  }

  const setDataCollected = {
    setSetupUserType: setSetupUserType
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
      setLoading(true)
      const currentUser = await Auth.currentAuthenticatedUser();
      const sub = currentUser.signInUserSession.idToken.payload.sub

      const params = {
        id: sub,
        setupType: setupUserType,
        setupStatus: 'getLicenseInfo',
        userType: 'user',
        navBar: 'setup'
      }

      const { data } = await API.graphql(graphqlOperation(updateUser, {input: params}));
      props.userSetUser(data.updateUser)
      setLoading(false)
      props.history.push('/setup/get-license-info')

    } catch(error) {
      setLoading(false)
      setErrorMessage('System failed to save input. Try again or contact support@roosted.io.')
      setOpen(true)
      console.log(error)
    }
  }
  useEffect(() => {
    const getUserData = async () => {
      try {
        setLoading(true)
        if(props.globalUser.setupType === null) {
          setSetupUserType('roosted')
          setLoading(false)
        } else {
          setSetupUserType(props.globalUser.setupType)
          setLoading(false)
        }
      } catch(error) {
        setLoading(false)
        setErrorMessage(error.message)
        setOpen(true)
        console.log(error)
      }
    }
    getUserData()
  // eslint-disable-next-line
  }, []);
 
  return (
    <Page
      className={classes.root}
      title="New User Setup"
    >
      <Container maxWidth="lg">
        <Header />
        <Snackbar open={open} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
          <AlertFunk onClose={handleClose} severity="error">
            {errorMessage}
          </AlertFunk>
        </Snackbar>
        <SelectUserTypeForm 
          className={classes.selectUserType}
          dataCollected={dataCollected}
          setDataCollected={setDataCollected} 
          loading={loading}/>
        <div className={classes.wrapper}>
          <Button
            color="primary"
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
      setupUserType: state.user.setupUserType
  };
};

const mapDispatchToProps = dispatch => {
  return {
      //userSetSetupUserType: (userType) => dispatch(actions.userSetSetupUserType(userType)),
      userSetUser: (user) => dispatch(actions.userSetUser(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SelectUserType);
