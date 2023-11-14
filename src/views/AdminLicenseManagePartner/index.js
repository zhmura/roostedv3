import React, { useEffect, useState, useMemo } from 'react';
import { makeStyles } from '@mui/styles';
import { Container, Typography, LinearProgress, Card, IconButton } from '@mui/material';
import Page from 'src/components/Page';
import Header from './Header';
import Results from './Licenses';
import { getLicenseStatusStepsObject, getLicenseStatusStepsObjectColor } from '../../utils/utilities'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import moment from 'moment'
import WarningDialog from './WarningDialog'

import Label from '../../components/Label'

//IMPORT ALERT
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { API, graphqlOperation } from "aws-amplify";
import { listPartnerLicenses } from "../../graphql/queries"
import { deletePartnerLicense} from "../../graphql/mutations"

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
  const [refreshTrigger, setRefreshTrigger] = useState(false)

  const [openDialog, setOpenDialog] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')
  const [licenseId, setLicenseId] = useState('')
  const [primaryLicense, setPrimaryLicense] = useState(true)

  const handleDialogClose = () => {
    setOpenDialog(false)
  }

  // const fetchS3 = async (key) => {
  //   console.log(key)
  //   const pdf = await Storage.get(key, { level: 'public' })
  //   console.log(pdf)
  //   FileSaver.saveAs(pdf)
  // }
  
  const deleteLicense = async (licenseId) => {
    setOpen(false)
    setLicenseId(licenseId)
    setPrimaryLicense(true)
    setDialogMessage('Are you sure you want to delete this license. It is permanent. You must also delete the user in the user management section.')
    setOpenDialog(true)
   
  }

  const handleConfirmDelete = async (license) => {
    try {
      setLoading(true)
      await API.graphql(graphqlOperation(deletePartnerLicense, {input: {id: license.id}}))

      handleDialogClose()
      setLoading(false)
      setRefreshTrigger(!refreshTrigger)
    }catch(error) {
      console.log(error)
      setErrorMessage('Failed to delete license. Try again or contact support@roosted.io')
      handleDialogClose()
      setLoading(false)
      setOpen(true)
    }
  }

  // const handleVerifyLicense = async (license, userId) => {
  //   try {
  //     setLoading(true)
  //     const {data} = await API.graphql(graphqlOperation(updateRoostedLicense, {input: {id: license.id, licenseVerificationStatus: 'verified'} }))
  //     if(data.updateRoostedLicense.primaryLicense) {
  //       await API.graphql(graphqlOperation(updateUser, {input: {id: userId, setupStatus: 'completed', navBar: 'roosted'} }))
  //     }
  //     setOpen(false)

  //     handleDialogClose()
  //     setRefreshTrigger(!refreshTrigger)
  //     setLoading(false)
  //   }catch(error) {
  //     console.log(error)
  //     setErrorMessage('Failed to verify license. Try again or contact support@roosted.io')
  //     handleDialogClose()
  //     setLoading(false)
  //     setOpen(true)
  //   }
  // }

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
                  onClick={() => props.history.push(`/license/edit/admin/partner/${props2.row.original.id}`)}>
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
                  onClick={() => deleteLicense(props.row.original)}>
                  <DeleteIcon/>
                </IconButton>
                </>
              )
            }
          },
          {
            Header: 'Agent',
            accessor: props => {return (props.licenseUser === undefined || props.licenseUser === null ? '' : `${props.licenseUser.userLastName}, ${props.licenseUser.userFirstName}`)},
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
            Header: "Preferred Zip",
            accessor: 'zipCode',
            Cell: props => {
              return (
              <Typography>{`${props.row.original.zipCode}`}</Typography>
              )
            }
          },
          {
            Header: "Radius (miles)",
            accessor: 'radius',
            Cell: props => {
              return (
              <Typography>{`${props.row.original.radius}`}</Typography>
              )
            }
          },
          {
            Header: "Low Price",
            accessor: 'lowPrice',
            Cell: props => {
              return (
              <Typography>{`$${props.row.original.lowPrice}`}</Typography>
              )
            }
          },
          {
            Header: "High Price",
            accessor: 'highPrice',
            Cell: props => {
              return (
              <Typography>{`$${props.row.original.highPrice}`}</Typography>
              )
            }
          },
          {
            Header: "Broker",
            accessor: 'broker',
            Cell: props => {
              return (
              <Typography>{`${props.row.original.broker}`}</Typography>
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
        data = await API.graphql(graphqlOperation(listPartnerLicenses, {
        limit: 900000,
        filter: {licenseState: {eq: props.globalUser.brokerState}}
      }))
      } else {
        data = await API.graphql(graphqlOperation(listPartnerLicenses, {
          limit: 900000,
        }))
      }
    
   
      if(data.data.listPartnerLicenses.items.length > 0) {
        setLicenses(data.data.listPartnerLicenses.items)
        setShowTable(true)
      } else {
        setLicenses([{
          id: '',
          licenseState: '',
          licenseVerificationStatus: '',
          licenseExpiration: '',
          licenseAddress: {street: '', unit: '', city: '', state: '', zip: ''},
          licenseNumber: '',
          zipCode: '',
          lowPrice: '',
          highProce: '',
          broker: ''
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
  if(props.globalUser.userType === 'broker' || props.globalUser.userType === 'admin') {
    fetchLicenses();
  }
    //eslint-disable-next-line
  }, [refreshTrigger]);

  return (
    <Page
      className={classes.root}
      title="Partner Licenses"
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
          <Header history={props.history}/>
          <Results
            className={classes.results}
            data={licenses}
            columns={columns}
            history={props.history}
          />
        </React.Fragment> :
        <div>
          <Header history={props.history}/>
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
