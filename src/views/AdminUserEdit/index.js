import React, { useState, useEffect, useMemo } from 'react';
import { makeStyles } from '@mui/styles';
import { Container, Typography, IconButton, LinearProgress } from '@mui/material';
import Receipt from '@mui/icons-material/Receipt';
import Page from 'src/components/Page';
import Header from './Header';
import EditAgentForm from './EditAgentInfo';
import RoostedLicenseInformation from './RoostedLicenseInformation'
import PartnerLicenseInformation from './PartnerLicenseInformation'
import ReferralList from './ReferralList'
import Results from './PriorPayments';
import moment from 'moment'

//IMPORT ALERT
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { getUser } from '../../graphql/queries'

const AlertFunk = React.forwardRef((props, ref) => (
  <Alert elevation={6} variant="filled" ref={ref} {...props} />
));

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
  getLicenseInfo: {
    marginTop: theme.spacing(3)
  },
}));

function EditAgentInfo(props) {

  const classes = useStyles();
  const [payments, setPayments] = useState([{created: '', description: '', amount: 0, refunded: 0, receipt_url: ''}])
  //const [customer, setCustomer] = useState({})
  const [loading, setLoading] = useState(false)
  //const [primaryRoostedLicenseState, setPrimaryRoostedLicenseState] = useState(null)
  const [showPaymentsTable, setShowPaymentsTable] = useState(false)
  const [user, setUser] = useState({})

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



    const fetchPriorPayments = async () => {

      try {
        // const currentUser = await Auth.currentAuthenticatedUser();
        // const sub = currentUser.signInUserSession.idToken.payload.sub
        //Get Prior Payments

        setLoading(true)

        const {data} = await API.graphql(graphqlOperation(getUser, {id: props.match.params.id}))
        setUser(data.getUser)

        if(data.getUser.roostedAgent !== null && data.getUser.roostedAgent !== undefined && data.getUser.roostedAgent.stripeCustomerId !== null && data.getUser.roostedAgent.stripeCustomerId !== undefined) {

          let primaryRoostedState = 'AZ'

          //check if roosted license already exists with primary designation so we can use that for stripe
          if(data.getUser.userRoostedLicenses.items.length > 0) {
            for(let i = 0; i < data.getUser.userRoostedLicenses.items.length; i++) {
              if(data.getUser.userRoostedLicenses.items[i].primaryLicense) {
                primaryRoostedState = (data.getUser.userRoostedLicenses.items[i].licenseState)
              }
            }
          }


          let custom = { 
            headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
            body: { 
              stripeState: primaryRoostedState,
              stripeCustomerId: data.getUser.roostedAgent.stripeCustomerId
            }
          }
          const priorPaymentResponse = await API.post(
            'roostedRestAPI', 
            '/stripe/get-prior-payments',
            custom 
          )

          setPayments(priorPaymentResponse.priorPayments)
          //In the response I also grab the customer data to display their current payment information
    
          //setCustomer(priorPaymentResponse.customer)
          setShowPaymentsTable(true)
        }
        setLoading(false)
      } catch(error) {
        console.log(error)
        setLoading(false)
        setErrorMessage('Failed to get prior payments. Refresh the page or contact support@roosted.io')
        setOpen(true)
      }
    }
  
  fetchPriorPayments()

  // eslint-disable-next-line
  }, []);





  return (
    <Page
      className={classes.root}
      title="User Edit"
    >
      <Container maxWidth="lg">
        <Header />
        <Snackbar open={open} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
          <AlertFunk onClose={handleClose} severity="error">
            {errorMessage}
          </AlertFunk>
        </Snackbar>
        {loading ? <LinearProgress/> :
        <React.Fragment>
          <EditAgentForm 
            className={classes.getLicenseInfo}
            setErrorMessage={setErrorMessage}
            setOpen={setOpen}
            history={props.history}
            location={props.location}
            agentId={props.match.params.id}
            user={user} />
          <RoostedLicenseInformation user={user} history={props.history}/>
          <PartnerLicenseInformation user={user} history={props.history}/>
          <ReferralList user={user} history={props.history}/>
          {showPaymentsTable ? 
          <Results
                className={classes.results}
                data={payments}
                columns={columns}
                history={props.history}
          /> : <React.Fragment/>}
        </React.Fragment>}
      </Container>
    </Page>
  );
}

export default EditAgentInfo;
