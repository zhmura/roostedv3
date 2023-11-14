import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import {
  Card,
  Grid,
  CardContent,
  Button,
  Typography,
  LinearProgress
} from '@mui/material';
import { isMobile } from 'react-device-detect'
import WhereToVote from '@mui/icons-material/WhereToVote';

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { updateRoostedLicense } from "../../graphql/mutations"
import { getUser, getRoostedLicense } from "../../graphql/queries"

import { getRoostedData, getRoostedEmail } from '../../utils/utilities'

const useStyles = makeStyles((theme) => ({
  root: {},
  formGroup: {
    marginBottom: theme.spacing(3)
  },
  actions: {
    marginTop: theme.spacing(3),
  },
  buttons: {
    marginLeft: theme.spacing(2),
    marginRight: theme.spacing(2)
  },
  divider: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2)
  }
}));

function TransferLicense(
  { 
    className, 
    globalUser, 
    userSetUser,
    history, 
    licenseNumber,
    setErrorMessage,
    setOpen,
     ...rest }) {
  const classes = useStyles();

  const [loading, setLoading] = useState(false)
  const [license, setLicense] = useState({})


  useEffect(() => {

    if(licenseNumber === '') {
      history.push('/license/create?type=roosted')
    }

    const fetchLicense = async () => {
      try {
        setLoading(true)
        // const currentUser = await Auth.currentAuthenticatedUser();
        // const sub = currentUser.signInUserSession.idToken.payload.sub
        const {data} = await API.graphql(graphqlOperation(getRoostedLicense, {id: licenseNumber}))
        setLicense(data.getRoostedLicense)
        setLoading(false)
      } catch(error) {
        console.log(error)
        setLoading(false)
        setErrorMessage('Failed to get licenses. Refresh the page or contact support@roosted.io')
        setOpen(true)
      }
    }

    if(licenseNumber !== '') {
      fetchLicense()
    }
  // eslint-disable-next-line 
  }, [])

  const onTransferClicked = async () => {
    setLoading(true)
    try {
      //Update the user and return the updated user then set it as the global user
      const currentUser = await Auth.currentAuthenticatedUser();
      const sub = currentUser.signInUserSession.idToken.payload.sub
      await API.graphql(graphqlOperation(updateRoostedLicense, {input: {id: licenseNumber, licenseVerificationStatus: 'waitingOnRoosted' }}))
      const {data} = await API.graphql(graphqlOperation(getUser, {id: sub}))
      userSetUser(data.getUser)

      ////SENDGRID EMAIL TEMPLATE/////
      //Notify broker they have a license to verify 

      let fromEmail = getRoostedEmail(license.licenseState, 'support')
      let toEmail = getRoostedEmail(license.licenseState, 'broker')
      let toFullName = 'Roosted Broker'

      let custom = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          emailData: {
            templateId: 'd-aa52f42e1ad74ab7af6b2126d6594e0a',
            toEmail: toEmail,
            toFullName: toFullName,
            fromEmail: fromEmail,
            roostedAgentFirstName: globalUser.userFirstName,
            roostedAgentLastName: globalUser.userLastName,
            licenseNumber: license.licenseNumber,
            state: license.licenseState,
          }
        }
      }
      console.log(custom)
      const sendGridResponse = await API.post(
        'roostedRestAPI', 
        '/sendgrid/send-email',
        custom
      )
      console.log(sendGridResponse)

      ////SENDGRID EMAIL TEMPLATE/////

      setLoading(false)

      history.push('/license/roosted')
    } catch(error) {
      setErrorMessage('We failed to notify Roosted your license was transferred. Try again or contact support@roosted.io')
      setOpen(true)
      setLoading(false)
      console.log(error)
    }
  }

  return (
    loading ? <LinearProgress/> : 
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      {loading ? <LinearProgress/> : <React.Fragment/>}
      <CardContent>
        <Typography variant='h4' align='center' style={{color: '#1CA6FC', paddingBottom: '1.5rem'}} gutterBottom>Last Step!</Typography>
        <Grid
            container
            spacing={1}
          >
            <Grid
              item
              xs={12}
            >
            <Typography variant='body1' gutterBottom align='center'>
              Before you can make a referral you have to transfer your license to Roosted's brokerage.
            </Typography>
            <Typography variant='body1' style={{marginBottom: '2rem'}} gutterBottom align='center'>
              Transfer your license then hit the button below to notify us. Verification can take up to 24 hours.
            </Typography>
            <Typography variant='body1' align='center'>
              This can be done on the {globalUser.userRoostedLicenses.items[0].licenseState} Real Estate Department's page using our brokerage number {getRoostedData(globalUser.userRoostedLicenses.items[0].licenseState).roostedLicenseNumber}:
            </Typography>
            <Typography variant='body1' align='center' gutterBottom>
              {getRoostedData(globalUser.userRoostedLicenses.items[0].licenseState).stateDRELink} 
            </Typography>
            <Typography variant='body1' align='center'>
              If you step by step directions vist: 
            </Typography>
            <Typography  variant='body1' align='center' gutterBottom>
              {isMobile ? 'https://roosted.io/transfer-license' : <a href='https://roosted.io/transfer-license' target="_blank" rel="noopener noreferrer">https://roosted.io/transfer-license</a>}
            </Typography>
            </Grid>
            
          </Grid>
          <div className={classes.actions} align='center'>
          {license.licenseVerificationStatus === 'waitingOnTransfer' ?
          <Button
            color="primary"
            variant="contained"
            className={classes.buttons}
            endIcon={<WhereToVote/>}
            onClick={() => onTransferClicked()}
          >
            My License Has Been Transferred
          </Button> :
          <>
          <Button
            color="primary"
            variant="contained"
            className={classes.buttons}
            endIcon={<WhereToVote/>}
            disabled={true}
          >
            My License Has Been Transferred
          </Button>
          <Typography align='center' gutterBottom style={{marginTop: '1rem'}}>
            We've notified Roosted's broker to verify you transferred your license to us. It can take up to 24 hours.
          </Typography>
        </>}
        </div>
    
      </CardContent>
      {loading ? <LinearProgress/> : <React.Fragment/>}
    </Card> 
  );
}

TransferLicense.propTypes = {
  className: PropTypes.string
};

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
      licenseNumber: state.license.licenseNumber
  };
};

const mapDispatchToProps = dispatch => {
  return {
      userSetUser: (user) => dispatch(actions.userSetUser(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(TransferLicense);
