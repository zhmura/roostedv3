import React, { useEffect, useState, useMemo } from 'react';
import { makeStyles } from '@mui/styles';
import { Container, Typography, LinearProgress, Card, IconButton, Grid } from '@mui/material';
import Page from 'src/components/Page';
import Header from './Header';
import Results from './PriorPayments';
import Receipt from '@mui/icons-material/Receipt';
import moment from 'moment'
import ManagePlan from './ManagePlan'
import ManageCC from './ManageCC'

//IMPORT ALERT
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API } from "aws-amplify";

//Stripe object creation
import {loadStripe} from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js'

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

function PriorPayments(props) {
  const classes = useStyles();
  const [payments, setPayments] = useState([{created: '', description: '', amount: 0, refunded: 0, receipt_url: ''}])
  const [customer, setCustomer] = useState({})
  const [loading, setLoading] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [primaryRoostedLicenseState, setPrimaryRoostedLicenseState] = useState(null)
  const [warningSeverity, setWarningSeverity] = useState('error')
  const [stripePromise, setStripePromise] = useState(process.env.STRIPE_KEY_AZ === undefined ? process.env.REACT_APP_STRIPE_KEY_AZ : process.env.STRIPE_KEY_AZ)

  //Dialog Messages

  //SNACKBAR State Variables
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('Unknown Error')

  //SNACKBAR close method
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
    setWarningSeverity('error')
  };

  //Required to identify the headers for a table
  const columns = useMemo(
    () => [
      {
        Header: 'Prior Payments',
        columns: [
          {
            Header: 'View Receipt',
            Cell: props => {
              return (
                <>
                <IconButton
                  color='primary'
                  onClick={() => { window.open(props.row.original.receipt_url, '_blank') }}>
                  <Receipt/>
                </IconButton>
                </>
              )
            }
          },
          {
            Header: "Date",
            accessor: props => { return moment(new Date((props.created*1000)).toISOString()).format('MM/DD/YYYY')},
            Cell: props => {
              return (
                <Typography>{moment(new Date((props.row.original.created*1000)).toISOString()).format('MM/DD/YYYY')}</Typography>
              )
            }
          },
          {
            Header: "Description",
            accessor: props => { return props.description },
            Cell: props => {
              return (
              <Typography>{`${props.row.original.description}`}</Typography>
              )
            }
          },
          {
            Header: "Amount",
            accessor: props => { return props.amount },
            Cell: props => {
              return (
              <Typography>{`$${((props.row.original.amount)/100).toFixed(2)}`}</Typography>
              )
            }
          },
          {
            Header: "Amount Refunded",
            accessor: props => { return props.amount_refunded },
            Cell: props => {
              return (
              <Typography>{props.row.original.amount_refunded > 0 ? (props.row.original.amount_refunded/100).toFixed(0) : ' - '}</Typography>
              )
            }
          }
        ]
      },
    ],
    // eslint-disable-next-line
    []
  );

  useEffect(() => {

    //check if roosted license already exists with primary designation so we can use that for stripe
    if(props.globalUser.userRoostedLicenses.items.length > 0) {
      for(let i = 0; i < props.globalUser.userRoostedLicenses.items.length; i++) {
        if(props.globalUser.userRoostedLicenses.items[i].primaryLicense) {
          setPrimaryRoostedLicenseState(props.globalUser.userRoostedLicenses.items[i].licenseState)
        }
      }
    }

    const fetchPriorPayments = async () => {
      let stripeState = props.globalUser.roostedAgent.stripeState

      //initiate stripe key based on state
      if(stripeState === 'AZ') {
        setStripePromise(loadStripe(process.env.STRIPE_KEY_AZ === undefined ? process.env.REACT_APP_STRIPE_KEY_AZ : process.env.STRIPE_KEY_AZ));
      } else if(stripeState === 'CA') {
        setStripePromise(loadStripe(process.env.STRIPE_KEY_CA === undefined ? process.env.REACT_APP_STRIPE_KEY_CA : process.env.STRIPE_KEY_CA));
      }
 
      try {
        // const currentUser = await Auth.currentAuthenticatedUser();
        // const sub = currentUser.signInUserSession.idToken.payload.sub
        //Get Prior Payments

        setLoading(true)
        let custom = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: { 
            stripeState: props.globalUser.roostedAgent.stripeState,
            stripeCustomerId: props.globalUser.roostedAgent.stripeCustomerId
          }
        }
        const priorPaymentResponse = await API.post(
          'roostedRestAPI', 
          '/stripe/get-prior-payments',
          custom 
        )

        setPayments(priorPaymentResponse.priorPayments)
        //In the response I also grab the customer data to display their current payment information
  
        setCustomer(priorPaymentResponse.customer)
        setShowTable(true)
        setLoading(false)
      } catch(error) {
        console.log(error)
        setLoading(false)
        setErrorMessage('Failed to get prior payments. Refresh the page or contact support@roosted.io')
        setOpen(true)
      }
    }
  if(props.globalUser.roostedAgent !== null) {
    fetchPriorPayments()
  }
  // eslint-disable-next-line
  }, []);
 
  return (
    <Page
      className={classes.root}
      title="Prior Payments"
    >
      <Snackbar open={open} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
        <AlertFunk onClose={handleClose} severity={warningSeverity}>
          {errorMessage}
        </AlertFunk>
       </Snackbar>
      <Container
        maxWidth={false}
        className={classes.container}
      >
        {loading ? <LinearProgress/> : 
        showTable ?
        <React.Fragment>
          <Header/>
          <Grid container spacing={1}>
            <Grid item xs={12} md={6}>
            <Elements stripe={stripePromise}>
              <ManageCC 
                customer={customer}
                setErrorMessage={setErrorMessage} 
                setOpen={setOpen} 
                history={props.history}
                licenseState={primaryRoostedLicenseState}
                setWarningSeverity={setWarningSeverity}/>
            </Elements>  
            </Grid> 
            <Grid item xs={12} md={6}>
              <ManagePlan 
                setErrorMessage={setErrorMessage} 
                setOpen={setOpen} 
                history={props.history}/>
            </Grid> 
            <Grid item xs={12}>
              <Results
                className={classes.results}
                data={payments}
                columns={columns}
                history={props.history}
              />
            </Grid>     
          </Grid>
        </React.Fragment> :
        <div>
          <Header history={props.history}/>
          <Card style={{marginTop: '1rem'}}>
            <Typography variant="h4" style={{paddingTop: '3rem', paddingLeft: '3rem', paddingRight: '3rem'}} align='center' gutterBottom>No Active Billing Plans.</Typography>
            <Typography variant="h6" style={{paddingBottom: '3rem', paddingLeft: '3rem', paddingRight: '3rem'}} align='center'>You can add one by creating a Roosted license and hanging that license with us under "License Management"</Typography>
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

export default connect(mapStateToProps, mapDispatchToProps)(PriorPayments);
