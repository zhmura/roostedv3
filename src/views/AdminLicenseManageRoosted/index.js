import React, { useEffect, useState, useMemo } from 'react';
import { makeStyles } from '@mui/styles';
import { Container, Typography, LinearProgress, Card, IconButton } from '@mui/material';
import Page from 'src/components/Page';
import Header from './Header';
import Results from './Licenses';
import { getLicenseStatusStepsObject, getLicenseStatusStepsObjectColor } from '../../utils/utilities'
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
// import DeleteIcon from '@mui/icons-material/DeleteForever';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AssignmentLateIcon from '@mui/icons-material/AssignmentLate';
import moment from 'moment'
import FileSaver from 'file-saver'
import WarningDialog from './WarningDialog'
import queryString from 'query-string'
import Label from '../../components/Label'
import { isMobile } from 'react-device-detect'

//IMPORT ALERT
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation, Storage } from "aws-amplify";
import { listRoostedLicenses, getUser } from "../../graphql/queries"
import { updateRoostedLicense, updateUser } from "../../graphql/mutations"
import awsconfig from '../../aws-exports'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

import { getRoostedEmail } from '../../utils/utilities'

const AlertFunk = React.forwardRef((props, ref) => (
  <Alert elevation={6} variant="filled" ref={ref} {...props} />
));

const useStyles = makeStyles((theme) => ({
  root: {},
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
  results: {
    marginTop: theme.spacing(3)
  }
}));

function LicenseList(props) {
  const classes = useStyles();
  const [licenses, setLicenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTable, setShowTable] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(false)

  const [openDialog, setOpenDialog] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')
  const [licenseId, setLicenseId] = useState('')
  const [primaryLicense, setPrimaryLicense] = useState(true)
  
  const handleDialogClose = () => {
    setOpenDialog(false)
  }

  Storage.configure(awsconfig)

  const fetchS3 = async (key) => {
    console.log(key)
    const pdf = await Storage.get(key, { level: 'public' })
    console.log(pdf)
    FileSaver.saveAs(pdf)
  }
  
  const severLicense = async (licenseId) => {
    setOpen(false)
    setLicenseId(licenseId)
    setPrimaryLicense(true)
    setDialogMessage('Are you sure you want to sever this license. The agent will not be able to make referrals if this is their primary license while it is severed. They will be notified by email.')
    setOpenDialog(true)
   
  }

  const handleConfirmSever = async (license) => {
    try {
      setLoading(true)
      await API.graphql(graphqlOperation(updateRoostedLicense, {input: {id: license.id, licenseVerificationStatus: 'severed'} }))
      ////SENDGRID EMAIL TEMPLATE/////
      //Email agent notifying them their license has been verified

      const getLicenseUser = await API.graphql(graphqlOperation(getUser, {id: license.licenseUserID}))

      let noActiveLicense = true
      for(let i = 0 ; i < getLicenseUser.data.getUser.userRoostedLicenses.items.length ; i++) {
        if(getLicenseUser.data.getUser.userRoostedLicenses.items[i].licenseVerificationStatus === 'verified') {
          noActiveLicense = false
        }
      }

      if(noActiveLicense) {
        let custom2 = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
              stripeCustomerId: getLicenseUser.data.getUser.roostedAgent.stripeCustomerId,
              planState: getLicenseUser.data.getUser.roostedAgent.stripeState,
              stripeSubscriptionId: getLicenseUser.data.getUser.roostedAgent.stripeSubscriptionId,
              planName: 'nest',
              paymentPeriod: 'monthly'
          }
        }
        const moveToFreeStripe = await API.post(
          'roostedRestAPI', 
          '/stripe/change-subscription',
          custom2
        )
        console.log(moveToFreeStripe)
      }

      let fromEmail = getRoostedEmail(license.licenseState, 'referral')

      let brokerEmail = getRoostedEmail(license.licenseState, 'broker') 
      
      let toEmail = license.licenseUser.email
      let toFullName = `${license.licenseUser.userFirstName} ${license.licenseUser.userLastName}`

      let custom = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          emailData: {
            templateId: 'd-001c8d1286d9413485b21a32f64c6ac4',
            toEmail: toEmail,
            toFullName: toFullName,
            fromEmail: fromEmail,
            roostedAgentFirstName: license.licenseUser.userFirstName,
            brokerStateEmail: brokerEmail
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


      ////MAILCHIMP UPDATE/////
      //Mark License As Severed

        let custom2 = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            action: 'severed',
            emailData: {
              EMAIL: license.licenseUser.email,
              FNAME: '',
              LNAME: '',
              PHONE: '',
              STATE: '',
              BROKER: '',
              EXPIRATION: ''
            }
          }
        }
        console.log(custom2)
        const mailChimpResponse = await API.post(
          'roostedRestAPI', 
          '/mailchimp/execute-update',
          custom2
        )
        console.log(mailChimpResponse)

      ////MAILCHIMP UPDATE/////



      handleDialogClose()
      setLoading(false)
      setRefreshTrigger(!refreshTrigger)
    }catch(error) {
      console.log(error)
      setErrorMessage('Failed to sever license. Try again or contact support@roosted.io')
      handleDialogClose()
      setLoading(false)
      setOpen(true)
    }
  }

  const handleVerifyLicense = async (license, userId) => {
    try {
      setLoading(true)
      const {data} = await API.graphql(graphqlOperation(updateRoostedLicense, {input: {id: license.id, licenseVerificationStatus: 'verified'} }))
      if(data.updateRoostedLicense.primaryLicense) {
        await API.graphql(graphqlOperation(updateUser, {input: {id: userId, setupStatus: 'completed', navBar: 'roosted'} }))
      }
      setOpen(false)
      ////SENDGRID EMAIL TEMPLATE/////
      //Email agent notifying them their license has been verified

      let fromEmail = getRoostedEmail(license.licenseState, 'referral')
  
      let toEmail = license.licenseUser.email
      let toFullName = `${license.licenseUser.userFirstName} ${license.licenseUser.userLastName}`

      let custom = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          emailData: {
            templateId: 'd-8e707ae2d6b949238a7292abf1ed6110',
            toEmail: toEmail,
            toFullName: toFullName,
            fromEmail: fromEmail,
            roostedAgentFirstName: license.licenseUser.userFirstName,
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

      handleDialogClose()
      setRefreshTrigger(!refreshTrigger)
      setLoading(false)
    }catch(error) {
      console.log(error)
      setErrorMessage('Failed to verify license. Try again or contact support@roosted.io')
      handleDialogClose()
      setLoading(false)
      setOpen(true)
    }

    try {
      //TWILIO TEXT/////

      let textData = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          phoneNumber: license.licenseUser.userPhone,
          message: `Your Roosted license has been verified! You're ready to make referrals.`
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
      
    }catch(error) {
      console.log(error)
    }

  }

  //Required to identify the headers for a table
  const columns = useMemo(
    () => [
      {
        Header: "Licenses",
        columns: [
          {
            Header: "Edit License Details",
            Cell: props2 => {
              return (
                <>
                <IconButton
                  color='primary'
                  onClick={() => props.history.push(`/license/edit/admin/roosted/${props2.row.original.id}`)}>
                  <EditIcon/>
                </IconButton>
                </>
              )
            }
          },
          {
            Header: "Verify Transfer",
            Cell: props => {
              return (
                <>
                <IconButton
                  style={{color: props.row.original.licenseVerificationStatus === 'verified' ? '#D3D3D3': '#008000'}}
                  onClick={() => handleVerifyLicense(props.row.original, props.row.original.licenseUserID)} disabled={props.row.original.licenseVerificationStatus === 'verified'}>
                  <CheckCircleOutlineIcon/>
                </IconButton>
                </>
              )
            }
          },
          {
            Header: "Sever License",
            Cell: props => {
              return (
                <>
                <IconButton
                  style={{color: props.row.original.licenseVerificationStatus === 'verified' ? '#FF0000' : '#D3D3D3'}}
                  onClick={() => severLicense(props.row.original)}>
                  <AssignmentLateIcon/>
                </IconButton>
                </>
              )
            }
          },
          {
            Header: 'Agent',
            accessor: props => {return (props.licenseUser === undefined || props.licenseUser === null ? '' :  `${props.licenseUser.userLastName}, ${props.licenseUser.userFirstName}`)},
            Cell: props => {
              return (
                props.row.original.licenseUser === undefined || props.row.original.licenseUser === null ? '' : <Typography>{props.row.original.licenseUser.userLastName}{`, ${props.row.original.licenseUser.userFirstName}`}</Typography>
              )
            }
          },
          {
            Header: "License State",
            accessor: 'licenseState',
            Cell: props => {
              return (
              <Typography>{`${props.row.original.licenseState}`}</Typography>
              )
            }
          },
          {
            Header: "License #",
            accessor: 'licenseNumber',
            Cell: props => {
              return (
              <Typography>{`${props.row.original.licenseNumber}`}</Typography>
              )
            }
          },
          {
            Header: "License Status",
            accessor: props => {return getLicenseStatusStepsObject(props.licenseVerificationStatus) },
            Cell: props => {
              return (
                <Label style={{marginLeft: '0.25rem', marginRight: '0.25rem'}} color={getLicenseStatusStepsObjectColor(props.row.original.licenseVerificationStatus)}>{getLicenseStatusStepsObject(props.row.original.licenseVerificationStatus)}</Label>
              )
            }
          },
          {
            Header: "License Expiration",
            accessor: props => moment(new Date(props.licenseExpiration)).format('MM/DD/YYYY'),
            Cell: props => {
              return (
              <Typography>{moment(new Date(props.row.original.licenseExpiration)).format('MM/DD/YYYY')}</Typography>
              )
            }
          },
          {
            Header: "Primary License",
            accessor: props => props.primaryLicnese === true ? 'Yes' : 'No',
            Cell: props => {
              return (
              <Typography>{props.row.original.primaryLicense === true ? 'Yes' : 'No'}</Typography>
              )
            }
          },
          {
            Header: "View Policy Manual",
            Cell: props => {
              return (
                isMobile ? <Typography style={{marginRight: '0.5rem', marginLeft: '0.5rem'}}>Not Available on Mobile.</Typography> :
                <>
                <IconButton
                  color='primary'
                  disabled={props.row.original.licenseUser === undefined || props.licenseUser === null ? true : props.row.original.licenseUser.userType === 'admin' || props.row.original.licenseUser.userType === 'broker'}
                  onClick={() => fetchS3(props.row.original.licensePolicyAndProcedurePath)}>
                  <DescriptionIcon/>
                </IconButton>
                </>
              )
            }
          },
          {
            Header: "View Contractor Agreement",
            Cell: props => {
              return (
                isMobile ? <Typography style={{marginRight: '0.5rem', marginLeft: '0.5rem'}}>Not Available on Mobile.</Typography> :
                <>
                <IconButton
                  color='primary'
                  disabled={props.row.original.licenseUser === undefined || props.row.original.licenseUser === null ? true : props.row.original.licenseUser.userType === 'admin' || props.row.original.licenseUser.userType === 'broker'}
                  onClick={() => fetchS3(props.row.original.licenseICAPath)}>
                  <DescriptionIcon/>
                </IconButton>
                </>
              )
            }
          }
        ]
      },
    ],
    // eslint-disable-next-line
    []
  );

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

  useEffect(() => {

    const fetchLicenses = async () => {
    setLoading(true)
 
    try {
      // const currentUser = await Auth.currentAuthenticatedUser();
      // const sub = currentUser.signInUserSession.idToken.payload.sub
      let data = {}
      if(props.globalUser.userType === 'broker') {
        if(queryString.parse(props.location.search).filter === 'waitingOnPayment') {
          data = await API.graphql(graphqlOperation(listRoostedLicenses, {
            limit: 900000,
            filter: {and: [{ licenseVerificationStatus: { eq: 'waitingOnPayment'}}, {licenseState: {eq: props.globalUser.brokerState}}]} 
          }))
        } else if(queryString.parse(props.location.search).filter === 'waitingOnPolicies') {
          data = await API.graphql(graphqlOperation(listRoostedLicenses, {
            limit: 900000,
            filter: {and: [{ licenseVerificationStatus: { eq: 'waitingOnPolicies'}}, {licenseState: {eq: props.globalUser.brokerState}}]}  
          }))
        } else if(queryString.parse(props.location.search).filter === 'waitingOnICA') {
          data = await API.graphql(graphqlOperation(listRoostedLicenses, {
            limit: 900000,
            filter: {and: [{ licenseVerificationStatus: { eq: 'waitingOnICA'}}, {licenseState: {eq: props.globalUser.brokerState}}]}  
          }))
        } else if(queryString.parse(props.location.search).filter === 'waitingOnTransfer') {
          data = await API.graphql(graphqlOperation(listRoostedLicenses, {
            limit: 900000,
            filter: {and: [{ licenseVerificationStatus: { eq: 'waitingOnTransfer'}}, {licenseState: {eq: props.globalUser.brokerState}}]}  
          }))
        } else if(queryString.parse(props.location.search).filter === 'waitingOnRoosted') {
          data = await API.graphql(graphqlOperation(listRoostedLicenses, {
            limit: 900000,
            filter: {and: [{ licenseVerificationStatus: { eq: 'waitingOnRoosted'}}, {licenseState: {eq: props.globalUser.brokerState}}]}  
          }))
        } else {
          data = await API.graphql(graphqlOperation(listRoostedLicenses, {
            limit: 900000,
            filter: {licenseState: {eq: props.globalUser.brokerState}}
          }))
        }
      } else {
        if(queryString.parse(props.location.search).filter === 'waitingOnPayment') {
          data = await API.graphql(graphqlOperation(listRoostedLicenses, {
            limit: 900000,
            filter: { licenseVerificationStatus: { eq: 'waitingOnPayment'}} 
          }))
        } else if(queryString.parse(props.location.search).filter === 'waitingOnPolicies') {
          data = await API.graphql(graphqlOperation(listRoostedLicenses, {
            limit: 900000,
            filter: { licenseVerificationStatus: { eq: 'waitingOnPolicies'}} 
          }))
        } else if(queryString.parse(props.location.search).filter === 'waitingOnICA') {
          data = await API.graphql(graphqlOperation(listRoostedLicenses, {
            limit: 900000,
            filter: { licenseVerificationStatus: { eq: 'waitingOnICA'}} 
          }))
        } else if(queryString.parse(props.location.search).filter === 'waitingOnTransfer') {
          data = await API.graphql(graphqlOperation(listRoostedLicenses, {
            limit: 900000,
            filter: { licenseVerificationStatus: { eq: 'waitingOnTransfer'}} 
          }))
        } else if(queryString.parse(props.location.search).filter === 'waitingOnRoosted') {
          data = await API.graphql(graphqlOperation(listRoostedLicenses, {
            limit: 900000,
            filter: { licenseVerificationStatus: { eq: 'waitingOnRoosted'}} 
          }))
        } else {
          data = await API.graphql(graphqlOperation(listRoostedLicenses, {
            limit: 900000
          }))
        }
      }
      console.log(data)
      if(data.data.listRoostedLicenses.items.length > 0) {
        setLicenses(data.data.listRoostedLicenses.items)
        setShowTable(true)
      } else {
        setLicenses([{
          id: '',
          licenseState: '',
          licenseVerificationStatus: '',
          licenseExpiration: '',
          licenseAddress: {street: '', unit: '', city: '', state: '', zip: ''},
          licenseNumber: '',
          licenseUser: {userFirstName: '', userLastName: ''},
          primaryLicense: true
        }])
        setShowTable(false)
      }
      setLoading(false)
    } catch(error) {
      console.log(error)
      setLoading(false)
      setErrorMessage('Failed to get licenses. Refresh the page or contact support@roosted.io')
      setOpen(true)
    }
  }
  if(props.globalUser.userType === 'broker' || props.globalUser.userType === 'admin') {
    fetchLicenses();
  }
    // eslint-disable-next-line
  }, [refreshTrigger]);

  return (
    <Page
      className={classes.root}
      title="Roosted Licenses"
    >
      <Snackbar open={open} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
        <AlertFunk onClose={handleClose} severity="error">
          {errorMessage}
        </AlertFunk>
       </Snackbar>
       <WarningDialog 
        open={openDialog}
        message={dialogMessage}
        handleClose={handleDialogClose}
        handleConfirmSever={handleConfirmSever}
        licenseId={licenseId}
        primaryLicense={primaryLicense}/>
      <Container
        maxWidth={false}
        className={classes.container}
      >
        {loading ? <LinearProgress/> : 
        showTable ?
        <React.Fragment>
          <Header history={props.history} location={props.location} refreshTrigger={refreshTrigger} setRefreshTrigger={setRefreshTrigger}/>
          <Results
            className={classes.results}
            data={licenses}
            columns={columns}
            history={props.history}
          />
        </React.Fragment> :
        <div>
          <Header history={props.history} location={props.location} refreshTrigger={refreshTrigger} setRefreshTrigger={setRefreshTrigger}/>
          <Card style={{marginTop: '1rem'}}>
            <Typography variant="h4" style={{padding: '3rem'}} align='center'>No Licenses Added</Typography>
          </Card>
        </div>}
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
      licenseSetLicenseNumber: (licenseNumber) => dispatch(actions.licenseSetLicenseNumber(licenseNumber))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LicenseList);
