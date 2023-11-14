import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { Typography, Grid, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Label from '../../components/Label'
import { getReferralStatusStepsObjectColor, getReferralStatusStepsObject, getRoostedEmail } from '../../utils/utilities'
import WarningDialog from './WarningDialog'
import FileSaver from 'file-saver'
import GetAppIcon from '@mui/icons-material/GetApp';
// import awsconfig from '../../aws-exports'
import awsconfig from '../../aws-exports.js';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation, Storage } from "aws-amplify";
import { updateReferral } from "../../graphql/mutations"

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
  acceptButton: {
    marginRight: '1rem',
    backgroundColor: "#008000",
    color: '#FFFFFF'
  },
  rejectButton: {
    backgroundColor: "#FF0000",
    color: '#FFFFFF'
  },

}));

function Header({ className, referral, dataCollected, setDataCollected, history, ...rest }) {
  const classes = useStyles();

  Storage.configure(awsconfig)

  const [openDialog, setOpenDialog] = useState(false)
  
  const handleDialogClose = () => {
    setOpenDialog(false)
  }

  const handleWarningOpen = () => {
    setOpenDialog(true)
  }

  const handleSignContract = async () => {
    setDataCollected.setLoading(true)
    try {
      history.push(`/referrals/details/accept/${referral.id}`)
    }catch(error) {
      console.log(error)
      setDataCollected.setErrorMessage('Failed to delete referral. Please try again or contact support@roosted.io.')
      setDataCollected.setOpen(true)
      setDataCollected.setLoading(false)
    }
  }

  const handleRejectReferral = async () => {
    setDataCollected.setLoading(true)
    try {

      let inputParam = {
        id: referral.id,
        referalStatus: 'rejected'
      }
      const { data } = await API.graphql(graphqlOperation( updateReferral, {input: inputParam}))
   

      ////SENDGRID EMAIL TEMPLATE/////
  
      let fromEmail = getRoostedEmail(referral.referralReferringAgentState, 'referral')

      let custom = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          emailData: {
            templateId: 'd-a98528240daa41edb806a8a4cad30a20',
            toEmail: referral.referralRoostedAgent.email,
            toFullName: referral.referralRoostedAgent.userFirstName + ' ' + referral.referralRoostedAgent.userLastName,
            fromEmail: fromEmail,
            clientFirstName: referral.referralClient.clientFirstName,
            clientLastName: referral.referralClient.clientLastName,
            roostedAgentFirstName: referral.referralRoostedAgent.userFirstName,
            partnerAgentFirstName: referral.referralPartnerAgent.userFirstName,
            partnerAgentLastName: referral.referralPartnerAgent.userLastName,
            status: getReferralStatusStepsObject(referral.referralStatus)
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

      handleDialogClose()

      setDataCollected.setLoading(false)
      setDataCollected.setReferral(data.updateReferral)
      history.push('/manage-referrals-sent')
    }catch(error) {
      console.log(error)
      setDataCollected.setErrorMessage('Failed to delete referral. Please try again or contact support@roosted.io.')
      setDataCollected.setOpen(true)
      setDataCollected.setLoading(false)
    }
  }

  const handleDownloadAgreement = async () => {
    const pdf = await Storage.get(referral.referralContractPath, { level: 'public' })
    console.log(pdf)
    FileSaver.saveAs(pdf)
  }

  const handleDownloadW9 = async () => {
    const pdf = await Storage.get(process.env.REACT_APP_USER_BRANCH === 'master' ? 'contract-templates/roostedW9.pdf' : 'contract-templates/roostedW9.pdf', { level: 'public' })
    console.log(pdf)
    FileSaver.saveAs(pdf)
  }

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <WarningDialog open={openDialog} handleClose={handleDialogClose} handleReject={handleRejectReferral}/>
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
            {referral.referralStatus === 'accepted' || referral.referralStatus === 'closed' || referral.referralStatus === 'clientLost' ?
            <>
              <Button
                color='primary'
                variant="contained"
                endIcon={<GetAppIcon/>}
                style={{marginTop: '0.5rem', marginRight: '1rem'}}
                onClick={handleDownloadAgreement}
              >
                Download Signed Agreement
              </Button>
              <Button
                color='primary'
                variant="contained"
                endIcon={<GetAppIcon/>}
                style={{marginTop: '0.5rem'}}
                onClick={handleDownloadW9}
              >
                Download W-9
              </Button>
            </> :
            <>
              <Button
                className={classes.acceptButton}
                variant="contained"
                endIcon={<CheckCircleIcon/>}
                style={{marginTop: '0.5rem'}}
                disabled={referral.referralStatus === 'accepted' || referral.referralStatus === 'closed' || referral.referralStatus === 'clientLost' || referral.referralStatus === 'rejected'}
                onClick={handleSignContract}
              >
                Accept Referral
              </Button>
              <Button
                className={classes.rejectButton}
                variant="contained"
                endIcon={<DeleteIcon/>}
                style={{marginTop: '0.5rem'}}
                disabled={referral.referralStatus === 'accepted' || referral.referralStatus === 'closed'|| referral.referralStatus === 'clientLost' || referral.referralStatus === 'rejected'}
                onClick={handleWarningOpen}
              >
                Decline Referral
              </Button>
            </>}
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
