import React, { useEffect, useState, useMemo } from 'react';
import { makeStyles } from '@mui/styles';
import { Container, Typography, LinearProgress, Card, IconButton } from '@mui/material';
import Page from 'src/components/Page';
import Header from './Header';
import Results from './Licenses';
import { getLicenseStatusStepsObject, getLicenseStatusStepsObjectColor } from '../../utils/utilities'
import EditIcon from '@mui/icons-material/Edit';
//import DeleteIcon from '@mui/icons-material/DeleteForever';
import moment from 'moment'
//import WarningDialog from './WarningDialog'

//IMPORT ALERT
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { listPartnerLicenses } from "../../graphql/queries"
//import { deletePartnerLicense } from "../../graphql/mutations"

import Label from '../../components/Label'

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

  // const [openDialog, setOpenDialog] = useState(false)
  // const [licenseId, setLicenseId] = useState('')
  // const [dialogMessage, setDialogMessage] = useState('')
  // const [primaryLicense, setPrimaryLicense] = useState(true)
  // const [refresh, setRefresh] = useState(true)
  
  // const handleDialogClose = () => {
  //   setOpenDialog(false)
  // }
  
  // const deleteLicense = async (licenseId, primaryLicense) => {
  //   setOpen(false)
  //   if(primaryLicense) {
  //     setLicenseId(licenseId)
  //     setPrimaryLicense(true)
  //     setDialogMessage('You cannot delete your primary license. If you need to delete you primary license email support@roosted.io and tell us which license you want us to use as your primary license. To delete your entire Partner account, go to Account Settings and then Profile.')
  //     setOpenDialog(true)
  //   } else {
  //     setLicenseId(licenseId)
  //     setPrimaryLicense(false)
  //     setDialogMessage('Are you sure you want to delete this license?')
  //     setOpenDialog(true)
  //   }
  // }

  // const handleConfirmDelete = async (licenseId) => {
  //   try {
  //     setLoading(true)
  //     setOpenDialog(false)
  //     await API.graphql(graphqlOperation(deletePartnerLicense, {input: {id: licenseId}}))
  //     setLoading(false)
  //     setRefresh(!refresh)

  //   }catch(error) {
  //     console.log(error)
  //     setErrorMessage('Failed to delete license. Try again or contact support@roosted.io')
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
                  onClick={() => props.history.push(`/license/edit/partner/${props2.row.original.id}`)}>
                  <EditIcon/>
                </IconButton>
                </>
              )
            }
          },
          // {
          //   Header: "Delete License",
          //   Cell: props => {
          //     return (
          //       <>
          //       <IconButton
          //         style={{color: '#FF0000'}}
          //         onClick={() => deleteLicense(props.row.original.id)}>
          //         <DeleteIcon/>
          //       </IconButton>
          //       </>
          //     )
          //   }
          // },
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
          },
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
      const {data} = await API.graphql(graphqlOperation(listPartnerLicenses, {
        filter: {
          licenseUserID: { eq: sub}, 
        },
        limit: 900000
      }))
      if(data.listPartnerLicenses.items.length > 0) {
        setLicenses(data.listPartnerLicenses.items)
        setShowTable(true)
      } else {
        setLicenses([{
          id: '',
          licenseState: '',
          licenseVerificationStatus: '',
          licenseExpiration: '',
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
       {/* <WarningDialog 
        open={openDialog}
        message={dialogMessage}
        handleClose={handleDialogClose}
        handleConfirmDelete={handleConfirmDelete}
        licenseId={licenseId}
        primaryLicense={primaryLicense}/> */}
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
            <Typography variant="h4" style={{paddingTop: '3rem', paddingBottom: '2rem'}} align='center' gutterBottom>No Licenses Added</Typography>
            <Typography variant="subtitle2" style={{paddingLeft: '1rem', paddingRight: '1rem'}} align='center' gutterBottom>If you have an active license with another broker and want to received referrals in that state, add your license here.</Typography>
            <Typography variant="subtitle2" style={{paddingBottom: '3rem', paddingLeft: '1rem', paddingRight: '1rem'}} align='center'>You can't have a partner license in the same state that you have a license hung with Roosted.</Typography>
          </Card>
        </div>}
      </Container>
    </Page>
  );
}

export default LicenseList;
