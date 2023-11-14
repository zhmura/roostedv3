import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { Typography, Grid, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'
import Label from '../../components/Label'
import { getReferralStatusStepsObjectColor, getReferralStatusStepsObject, getRoostedEmail } from '../../utils/utilities'
import WarningDialog from './WarningDialog'

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { deleteReferral } from "../../graphql/mutations"

const useStyles = makeStyles((theme) => ({
  root: {},
  headerAlignment: {
    [theme.breakpoints.down('sm')]: {
      textAlign: 'left',
    },
    [theme.breakpoints.up('md')]: {
      textAlign: 'right',
    },
  },
  button: {
    backgroundColor: '#FF0000',
    color: '#FFFFFF'
  }
}));

function Header({ className, referral, dataCollected, setDataCollected, history, ...rest }) {
  const classes = useStyles();

  const [openDialog, setOpenDialog] = useState(false)
  
  const handleDialogClose = () => {
    setOpenDialog(false)
  }

  const handleWarningOpen = () => {
    setOpenDialog(true)
  }

  const deleteReferralMethod = async () => {
    setDataCollected.setLoading(true)
    try {

      let inputParam = {id: referral.id}
      await API.graphql(graphqlOperation( deleteReferral, {input: inputParam}))
   
      if(referral.referralPartnerAgent !== undefined && referral.referralPartnerAgent !== null) {
        ////SENDGRID EMAIL TEMPLATE/////
    
        let fromEmail = getRoostedEmail(referral.referralReferringAgentState, 'referral')

        let custom = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            emailData: {
              templateId: 'd-51c87b74861a4846a1299cc06ec26607',
              toEmail: referral.referralPartnerAgent.email,
              toFullName: referral.referralPartnerAgent.userFirstName + ' ' + referral.referralPartnerAgent.userLastName,
              fromEmail: fromEmail,
              clientFirstName: referral.referralClient.clientFirstname,
              clientLastName: referral.referralClient.clientFirstname,
              partnerAgentFirstName: referral.referralPartnerAgent.userFirstName,
              type: referral.referralType === 'buyerReferral' ? 'Buyer' : 'Seller',
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
      }
      
      handleDialogClose()
      setDataCollected.setLoading(false)
      history.push('/manage-referrals-sent')
    }catch(error) {
      console.log(error)
      setDataCollected.setErrorMessage('Failed to delete referral. Please try again or contact support@roosted.io.')
      setDataCollected.setOpen(true)
      setDataCollected.setLoading(false)
    }
  }

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <WarningDialog open={openDialog} handleClose={handleDialogClose} handleDelete={deleteReferralMethod}/>
      <Grid
        alignItems="flex-end"
        container
        justify="space-between"
        spacing={3}
      >
        <Grid item>
          <Typography
            component="h2"
            gutterBottom
            variant="overline"
          >
            Referral Details
          </Typography>
          <Typography
            component="h1"
            variant="h3"
          >
            {referral.referralType !== undefined ? `Manage ${referral.referralType === 'buyerReferral' ? 'Buyer' : 'Seller'} Referral: ${referral.referralClient.clientFirstName} ${referral.referralClient.clientLastName}` : ''}
          </Typography>
          {referral.referralStatus !== undefined ? <Label style={{marginTop: '0.25rem'}} color={getReferralStatusStepsObjectColor(referral.referralStatus)}>{getReferralStatusStepsObject(referral.referralStatus)}</Label> : <React.Fragment/>}
        </Grid>
        {dataCollected.loading ? <React.Fragment/> :
        <Grid item>
          <div className={classes.headerAlignment} >
          {referral.referralStatus === 'accepted' || referral.referralStatus === 'closed' ?
          <div>
            <Typography variant='caption' gutterBottom >You can't delete a referral that has been accepted.</Typography>
          </div> : <React.Fragment/>}
          <Button
            className={classes.button}
            variant="contained"
            endIcon={<DeleteIcon/>}
            style={{marginTop: '0.5rem'}}
            disabled={referral.referralStatus === 'accepted' || referral.referralStatus === 'closed'}
            onClick={handleWarningOpen}
          >
            Delete Referral
          </Button>

          </div>
        </Grid>}
      </Grid>
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string
};

export default Header;
