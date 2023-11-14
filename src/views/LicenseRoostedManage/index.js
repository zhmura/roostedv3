import React, { useEffect, useState, useMemo } from 'react';
import { makeStyles } from '@mui/styles';
import { Container, Typography, LinearProgress, Card, IconButton } from '@mui/material';
import Page from 'src/components/Page';
import Header from './Header';
import Results from './Licenses';
import { getLicenseStatusStepsObject, getLicenseStatusStepsObjectColor } from '../../utils/utilities'
import EditIcon from '@mui/icons-material/Edit';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import moment from 'moment'
import FileSaver from 'file-saver'
import WarningDialog from './WarningDialog'
import { isMobile } from 'react-device-detect'

import Label from '../../components/Label'

//IMPORT ALERT
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation, Storage } from "aws-amplify";
import { listRoostedLicenses, getUser } from "../../graphql/queries"
import { deleteRoostedLicense } from "../../graphql/mutations"

import awsconfig from '../../aws-exports'

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

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
  
  const deleteLicense = async (licenseId, primaryLicense) => {
    setOpen(false)
    if(primaryLicense) {
      setLicenseId(licenseId)
      setPrimaryLicense(true)
      setDialogMessage('You cannot delete your primary license since your billing is set up through that. If you need to delete you primary license email support@roosted.io and tell us which license you want us to use as your primary license. To delete your entire Roosted account, go to Account Settings and then Profile.')
      setOpenDialog(true)
    } else {
      setLicenseId(licenseId)
      setPrimaryLicense(false)
      setDialogMessage('Are you sure you want to delete this license?')
      setOpenDialog(true)
    }
  }

  const handleConfirmDelete = async (licenseId) => {
    try {
      setLoading(true)
      await API.graphql(graphqlOperation(deleteRoostedLicense, {input: {id: licenseId}}))
      const updatedUser = await API.graphql(graphqlOperation(getUser, {id: props.globalUser.id}))
      props.userSetUser(updatedUser)
      setLoading(false)
    }catch(error) {
      console.log(error)
      setErrorMessage('Failed to delete license. Try again or contact support@roosted.io')
      setLoading(false)
      setOpen(true)
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
                  onClick={() => { 
                      if(props2.row.original.licenseVerificationStatus === 'waitingOnICA') {
                        props.licenseSetLicenseNumber(props.row.original.licenseId)
                        props.history.push('/license/sign-ica')
                      } else if(props2.row.original.licenseVerificationStatus === 'waitingOnTransfer') {
                        props.licenseSetLicenseNumber(props.row.original.licenseId)
                        props.history.push('/license/transfer-license')
                      } else if(props2.row.original.licenseVerificationStatus === 'waitingOnRoosted') {
                        setErrorMessage('You can\'t update a license while Roosted is verifying your last update.')
                        setOpen(true)
                      } else {
                        props.history.push(`/license/edit/roosted/${props2.row.original.id}`)
                      }
                    }}>
                  <EditIcon/>
                </IconButton>
                </>
              )
            }
          },
          {
            Header: "Delete License",
            Cell: props => {
              return (
                <>
                <IconButton
                  style={{color: '#FF0000'}}
                  onClick={() => deleteLicense(props.row.original.id, props.row.original.primaryLicense)}>
                  <DeleteIcon/>
                </IconButton>
                </>
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
      const currentUser = await Auth.currentAuthenticatedUser();
      const sub = currentUser.signInUserSession.idToken.payload.sub
      const {data} = await API.graphql(graphqlOperation(listRoostedLicenses, {
        filter: {
          licenseUserID: { eq: sub}, 
        },
        limit: 900000
      }))
      if(data.listRoostedLicenses.items.length > 0) {
        setLicenses(data.listRoostedLicenses.items)
        setShowTable(true)
      } else {
        setLicenses([{
          id: '',
          licenseState: '',
          licenseVerificationStatus: '',
          licenseExpiration: '',
          licenseAddress: {street: '', unit: '', city: '', state: '', zip: ''},
          licenseNumber: ''
        }])
      }
      setLoading(false)
    } catch(error) {
      console.log(error)
      setLoading(false)
      setErrorMessage('Failed to get licenses. Refresh the page or contact support@roosted.io')
      setOpen(true)
    }
  }
    fetchLicenses();
  }, []);

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
        handleConfirmDelete={handleConfirmDelete}
        licenseId={licenseId}
        primaryLicense={primaryLicense}/>
      <Container
        maxWidth={false}
        className={classes.container}
      >
        {loading ? <LinearProgress/> : 
        showTable ?
        <React.Fragment>
          <Header history={props.history} globalUser={props.globalUser}/>
          <Results
            className={classes.results}
            data={licenses}
            columns={columns}
            history={props.history}
          />
        </React.Fragment> :
        <div>
          <Header history={props.history} globalUser={props.globalUser}/>
          <Card style={{marginTop: '1rem'}}>
          <Typography variant="h4" style={{paddingTop: '3rem', paddingBottom: '2rem'}} align='center' gutterBottom>No Licenses Added</Typography>
            <Typography variant="subtitle2" style={{paddingLeft: '1rem', paddingRight: '1rem'}} align='center' gutterBottom>If you want to move your license to Roosted to make referrals only, add a license here and then go to "Account Settings" and "Billing" to add a paid plan.</Typography>
            <Typography variant="subtitle2" style={{paddingBottom: '3rem', paddingLeft: '1rem', paddingRight: '1rem'}} align='center'>You can't have a Roosted license in the same state that you have a partner license. A license for a state can only be at one brokerage.</Typography>
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
      licenseSetLicenseNumber: (licenseNumber) => dispatch(actions.licenseSetLicenseNumber(licenseNumber)),
      userSetUser: (user) => dispatch(actions.userSetUser(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LicenseList);
