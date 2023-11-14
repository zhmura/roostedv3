import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import {
  Card,
  CardHeader,
  CardContent,
  Divider,
  Table,
  TableRow,
  TableCell,
  TableBody,
  Button,
  LinearProgress,
  Typography
} from '@mui/material';
import { numberWithCommas, getRoostedEmail } from '../../../utils/utilities'

import ModalEditReferralCloseOut from './ModalEditReferralCloseOut'

//ICON IMPRORTS
import EditIcon from '@mui/icons-material/Edit';
import MailOutlineIcon from '@mui/icons-material/MailOutline';

//import { useForm, Controller } from "react-hook-form";
import { Auth, API, graphqlOperation } from 'aws-amplify';
import { updateReferral } from "../../../graphql/mutations"

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/index';

const useStyles = makeStyles(theme => ({
  root: {},
  header: {
    backgroundColor: '#0F3164',
    color: '#FFFFFF'
  },
  buttons: {
    margin: '1rem'
  },
  content: {
    padding: 0
  },
  actions: {
    flexDirection: 'column',
    alignItems: 'flex-start',

  },
}));

//new, clientContacted, agreementSigned, touring, underContract, clientLost, closed; sellers: new, clientContacted, agreementSigned, listed, reviewingOffers, underContract, clientLost, closed


function ReferralPayout({ className, dataCollected, setDataCollected, referral, globalUser, userSetUser, ...rest }) {
  const classes = useStyles()
  
  //PROCESS VARIABLES
  // const [loading, setLoading] = useState(false)

  const [openEdit, setOpenEdit] = useState(false);
  const [loading, setLoading] = useState(false)

  const handleEditOpen = () => {
    setOpenEdit(true);
  }

  const handleEditClose = () => {
    setOpenEdit(false);
  }

  const handleCheckReceived = async () => {

    try {
      setLoading(true)
      setDataCollected.setOpen(false)
      setDataCollected.setSeverity('error')

      ////SENDGRID EMAIL TEMPLATE/////
      //Notify an agent they have been removed from a referral
      let fromEmail = getRoostedEmail(referral.referralState, 'referral') 

      let custom = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          emailData: {
            templateId: 'd-30b87bbf511b47aeae88ecc2171f9f8d',
            toEmail: referral.referralRoostedAgent.email,
            toFullName: referral.referralRoostedAgent.userFirstName + ' ' + referral.referralRoostedAgent.userLastName,
            fromEmail: fromEmail,
            referralType: referral.referralType === 'buyerReferral' ? 'Buyer' : 'Seller',
            roostedAgentFirstName: referral.referralRoostedAgent.userFirstName,
            clientFirstName: referral.referralClient.clientFirstName,
            clientLastName: referral.referralClient.clientLastName,
            roostedAgentPayoutActual: `$${numberWithCommas(referral.referralRoostedAgentPayoutActual)}`,
            roostedAgentAddress: `${referral.referralRoostedAgent.userAddress.street} ${referral.referralRoostedAgent.userAddress.unit} ${referral.referralRoostedAgent.userAddress.city}, ${referral.referralRoostedAgent.userAddress.state} ${referral.referralRoostedAgent.userAddress.zip}`
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
      //SENDGRID EMAIL TEMPLATE/////

      //TWILIO TEXT/////

      let textData = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          phoneNumber: referral.referralRoostedAgent.userPhone,
          message: `A check for ${referral.referralClient.clientFirstName} ${referral.referralClient.clientLastName} referral has arrived. We are processing it now. Check your email for more details.`
          }
        }
        console.log(textData)
        const twilioResponse = await API.post(
          'roostedRestAPI', 
          '/sendgrid/send-twilio-text',
          textData
        )
        console.log(twilioResponse)
      //TWILIO TEXT/////

      const {data} = await API.graphql(graphqlOperation(updateReferral, {input: {id: referral.id, referralPayoutNotifcation: true}})) 
      setDataCollected.setReferral(data.updateReferral)
      
      setDataCollected.setErrorMessage('Email Sent!')
      setDataCollected.setSeverity('success')
      setLoading(false)
      setDataCollected.setOpen(true)
    } catch(error) {
      setLoading(false)
      setDataCollected.setMessage('Email Failed to Send!')
      setDataCollected.setSeverity('error')
      setDataCollected.setOpen(true)

    }


  }

  return (
    <Card
        {...rest}
        className={clsx(classes.root, className)}
      >
      {loading ? <LinearProgress /> : <React.Fragment/>}
      <CardHeader classes={{title: classes.header}} title='Referral Close Out' className={classes.header} />
        <Divider />
        <CardContent className={classes.content}>
          <Table size='small'>
            <TableBody>
            <TableRow>
                <TableCell><b>{`Actual Roosted Agent Earnings (adjust if needed): ${referral.referralRoostedAgentPayoutActual === null || referral.referralRoostedAgentPayoutActual === undefined ? `No Data Entered` : `$` + numberWithCommas(referral.referralRoostedAgentPayoutActual)}`}</b></TableCell>
                <TableCell>
                <div style={{alignSelf: 'center'}}>
                   <Button startIcon={<EditIcon/>} onClick={() => handleEditOpen()}>
                     Edit Payout
                  </Button>
                </div>
                </TableCell>
              </TableRow>
              <TableRow selected>
                <TableCell><b>Send "check is on the way and the amount" email:</b></TableCell>
                <TableCell>
                <div  style={{alignSelf: 'center'}}>
                   <Button 
                   startIcon={<MailOutlineIcon/>} 
                   onClick={() => handleCheckReceived()}
                   disabled={referral.referralRoostedAgentPayoutActual === null || referral.referralRoostedAgentPayoutActual === undefined || loading || referral.referralPayoutNotifcation} >
                     Send Email
                  </Button>
                </div>
                {referral.referralPayoutNotifcation ? 
                <div style={{alignSelf: 'center'}}>
                  <Typography variant='caption'>Notifcation already sent.</Typography>
                </div> : <React.Fragment/>}
                {referral.referralRoostedAgentPayoutActual === null || referral.referralRoostedAgentPayoutActual === undefined ? 
                <div  style={{alignSelf: 'center'}}>
                  <Typography variant='caption'>No value set.</Typography>
                </div> : <React.Fragment/>}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
        <ModalEditReferralCloseOut
        referral={referral}
        onClose={handleEditClose}
        open={openEdit}
        dataCollected={dataCollected}
        setDataCollected={setDataCollected}

      />
      {loading ? <LinearProgress /> : <React.Fragment/>}
      </Card> 
  );
}

ReferralPayout.propTypes = {
  className: PropTypes.string
};

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
  };
};

const mapDispatchToProps = dispatch => {
  return {
      userSetUser: (user) => dispatch(actions.userSetUser(user)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReferralPayout);
