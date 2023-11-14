import React, { useEffect, useState, useMemo } from 'react';
import { makeStyles } from '@mui/styles';
import { Container, Typography, LinearProgress, Card, IconButton } from '@mui/material';
import Page from 'src/components/Page';
import Header from './Header';
import Results from './Users';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteForever';
import moment from 'moment'
import WarningDialog from './WarningDialog'


//IMPORT ALERT
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { listUsers, listReferrals, getUser } from "../../graphql/queries"
import { deleteUser, deleteRoostedLicense, deletePartnerLicense, updateReferral } from "../../graphql/mutations"

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

import { formatPhoneNumber } from '../../utils/utilities'

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

function UserList(props) {
  const classes = useStyles();
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTable, setShowTable] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(false)

  const [openDialog, setOpenDialog] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')
  const [userId, setUserId] = useState('')

  const handleDialogClose = () => {
    setOpenDialog(false)
  }

  // const fetchS3 = async (key) => {
  //   console.log(key)
  //   const pdf = await Storage.get(key, { level: 'public' })
  //   console.log(pdf)
  //   FileSaver.saveAs(pdf)
  // }
  
  const onDeleteUser = async (userId) => {
    setOpen(false)
    setUserId(userId)
    setDialogMessage('Are you sure you want to delete this user. This is permanent.')
    setOpenDialog(true)
   
  }

  const handleConfirmDelete = async (user) => {
    try {
      setLoading(true)


      const fetchUser = await API.graphql(graphqlOperation(getUser, {id: user.id}))
      const roostedLicenses = fetchUser.data.getUser.userRoostedLicenses.items
      const partnerLicenses = fetchUser.data.getUser.userPartnerLicenses.items
      if((user.roostedAgent === null || user === undefined) || (user.roostedAgent.stripeCustomerId === null || user.roostedAgent.stripeCustomerId === undefined)) {
        //delete from cognito
        //delete from dynamo
        //remove from mailchimp
        handleDialogClose()
        // const currentUser = await Auth.currentAuthenticatedUser();
        // console.log(currentUser)
        // const sub = currentUser.signInUserSession.idToken.payload.sub
        let custom = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
              username: user.userCognitoUsername,
          }
        }
        const deletedUser = await API.post(
          'roostedRestAPI', 
          '/users/delete-user',
          custom 
        )
        console.log(deletedUser)

        //delete their licenses
        for(let i = 0; i < roostedLicenses.length ; i++) {
          await API.graphql(graphqlOperation(deleteRoostedLicense, {input: {id: roostedLicenses[i].id}}))
        }
        for(let i = 0; i < partnerLicenses.length ; i++) {
          await API.graphql(graphqlOperation(deletePartnerLicense, {input: {id: partnerLicenses[i].id}}))
        }

        //replace roosted on referrals
        const {data} = await API.graphql(graphqlOperation(listReferrals, {
          limit: 900000,
          filter: {or: [{referralRoostedAgentID: {eq: user.id}}, {referralPartnerAgentID: {eq: user.id}}]}
        }))

        for(let i = 0; i < data.listReferrals.items.length ; i++) {
          if(data.listReferrals.items[i].partnerAgentID === user.id) {
            await API.graphql(graphqlOperation(updateReferral, {input: {id: data.listReferrals[i].id, referralPartnerAgentID: '111-1111-111-111'}}))
          }
          if(data.listReferrals.items[i].roostedAgentID === user.id) {
            await API.graphql(graphqlOperation(updateReferral, {input: {id: data.listReferrals[i].id, referralRoostedAgentID: '111-1111-111-111'}}))
          }
        }

        await API.graphql(graphqlOperation(deleteUser, {input: {id: user.id}}))
 
        setLoading(false)
      
      } else {
        //Delete a customer from stripe
        handleDialogClose()
        let custom = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
              username: user.userCognitoUsername,
          }
        }
        const deletedUser = await API.post(
          'roostedRestAPI', 
          '/users/delete-user',
          custom 
        )
        console.log(deletedUser)

        let custom2 = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
              stripeCustomerId: user.roostedAgent.stripeCustomerId,
              stripeState: user.roostedAgent.stripeState,

          }
        }
        const deleteStripe = await API.post(
          'roostedRestAPI', 
          '/stripe/delete-stripe-account',
          custom2
        )
        console.log(deleteStripe)

      
        for(let i = 0; i < roostedLicenses.length ; i++) {
          await API.graphql(graphqlOperation(deleteRoostedLicense, {input: {id: roostedLicenses[i].id}}))
        }
        for(let i = 0; i < partnerLicenses.length ; i++) {
          await API.graphql(graphqlOperation(deletePartnerLicense, {input: {id: partnerLicenses[i].id}}))
        }

        //replace roosted on referrals
        const {data} = await API.graphql(graphqlOperation(listReferrals, {
        limit: 900000,
        filter: {or: [{referralRoostedAgentID: {eq: user.id}}, {referralPartnerAgentID: {eq: user.id}}]}
        }))

        for(let i = 0; i < data.listReferrals.items.length ; i++) {
          if(data.listReferrals.items[i].partnerAgentID === user.id) {
            await API.graphql(graphqlOperation(updateReferral, {input: {id: data.listReferrals[i].id, referralPartnerAgentID: '111-1111-111-111'}}))
          }
          if(data.listReferrals.items[i].roostedAgentID === user.id) {
            await API.graphql(graphqlOperation(updateReferral, {input: {id: data.listReferrals[i].id, referralRoostedAgentID: '111-1111-111-111'}}))
          }
        }

        await API.graphql(graphqlOperation(deleteUser, {input: {id: user.id}}))

        setLoading(false)
  
      }
      handleDialogClose()
      setLoading(false)
      setRefreshTrigger(!refreshTrigger)
    }catch(error) {
      console.log(error)
      setErrorMessage('Failed to delete user. Try again or contact support@roosted.io')
      handleDialogClose()
      setLoading(false)
      setOpen(true)
    }

    try {
            ////MAILCHIMP UPDATE/////
      //Mark as payment completed and take off abandon cart

      let custom = { 
        headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
        body: {
          action: 'deleted',
          emailData: {
            EMAIL: user.email,
            FNAME: '',
            LNAME: '',
            PHONE: '',
            STATE: '',
            BROKER: '',
            EXPIRATION: ''
          }
        }
      }
      console.log(custom)
      const mailChimpResponse = await API.post(
        'roostedRestAPI', 
        '/mailchimp/execute-update',
        custom
      )
      console.log(mailChimpResponse)

      ////MAILCHIMP UPDATE/////
    } catch(error) {
      console.log(error)
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
        Header: "Users",
        columns: [
          {
            Header: "Edit User",
            Cell: props2 => {
              return (
                <>
                <IconButton style={{marginTop: '0rem', marginBottom: '0rem'}}
                  color='primary'
                  onClick={() => props.history.push(`/users/admin/edit/${props2.row.original.id}`)}>
                  <EditIcon/>
                </IconButton>
                </>
              )
            }
          },
          {
            Header: "Delete User",
            Cell: props => {
              return (
                <>
                <IconButton
                  style={{color: '#FF0000', marginTop: '0rem', marginBottom: '0rem'}}
                  onClick={() => onDeleteUser(props.row.original)}>
                  <DeleteIcon/>
                </IconButton>
                </>
              )
            }
          },
          {
            Header: 'Agent',
            accessor: props => {return (`${props.userLastName}, ${props.userFirstName}`)},
            Cell: props => {
              return (
              <Typography>{props.row.original.userLastName === null ? 'Unknown' : props.row.original.userLastName}{`, ${props.row.original.userFirstName === null ? 'Unknown' : props.row.original.userFirstName}`}</Typography>
              )
            }
          },
          {
            Header: "Email",
            accessor: 'email',
            Cell: props => {
              return (
              <Typography>{`${props.row.original.email}`}</Typography>
              )
            }
          },
          {
            Header: "Phone #",
            accessor: props => {return props.userPhone === null || props.userPhone === undefined ? 'No Phone' : 'userPhone'},
            Cell: props => {

              return (
              props.row.original.userPhone === null || props.row.original.userPhone === undefined ? 'No Phone' : <Typography>{`${formatPhoneNumber(props.row.original.userPhone)}`}</Typography>
              )
            }
          },
          {
            Header: "Date Joined",
            accessor: props => {return moment(new Date(props.createdAt)).format('MM/DD/YYYY')},
            Cell: props => {
              return (
              <Typography>{moment(new Date(props.row.original.createdAt)).format('MM/DD/YYYY')}</Typography>
              )
            }
          },
          {
            Header: "Address",
            accessor: props => {return props.userAddress !== undefined ? `${props.userAddress.street} ${props.userAddress.unit === null ? '' : props.userAddress.unit} ${props.userAddress.city}, ${props.userAddress.state} ${props.userAddress.zip}` : ''},
            Cell: props => {
              return (
              <Typography>{props.row.original.userAddress !== undefined ? `${props.row.original.userAddress.street} ${props.row.original.userAddress.unit === null ? '' : props.row.original.userAddress.unit} ${props.row.original.userAddress.city}, ${props.row.original.userAddress.state} ${props.row.original.userAddress.zip}` : ''}</Typography>
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

    const fetchUsers = async () => {
    setLoading(true)
 
    try {
      // const currentUser = await Auth.currentAuthenticatedUser();
      // const sub = currentUser.signInUserSession.idToken.payload.sub

      const {data} = await API.graphql(graphqlOperation(listUsers, {
        limit: 900000,
        filter: {and: [ {setupStatus: { ne: 'selectType'}}, {setupStatus: { ne: 'getLicenseInfo'}}, {setupStatus: { ne: 'getPaymentInfo'}}, {setupStatus: { ne: null}}, {id: { ne: '111-1111-111-111'}}]}
      }))
   
      if(data.listUsers.items.length > 0) {
        setUsers(data.listUsers.items)
        setShowTable(true)
      } else {
        setUsers([{
          id: '',
          userFirstName: '',
          userLastName: '',
          email: '',
          userPhone: '',
          userAddress: {street: '', unit: '', city: '', state: '', zip: ''},
          createdAt: ''
        }])
      }
      setLoading(false)
    } catch(error) {
      console.log(error)
      setLoading(false)
      setErrorMessage('Failed to get users. Refresh the page or contact support@roosted.io')
      setOpen(true)
    }
  }
  if(props.globalUser.userType === 'broker' || props.globalUser.userType === 'admin') {
    fetchUsers();
  }
  //eslint-disable-next-line
  }, [refreshTrigger]);

  return (
    <Page
      className={classes.root}
      title="Users"
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
        userId={userId}/>
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
            data={users}
            columns={columns}
            history={props.history}
          />
        </React.Fragment> :
        <div>
          <Header history={props.history}/>
          <Card style={{marginTop: '1rem'}}>
            <Typography variant="h4" style={{padding: '3rem'}} align='center'>No Users</Typography>
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

export default connect(mapStateToProps, mapDispatchToProps)(UserList);
