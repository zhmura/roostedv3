import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';
import {
  Container,
  Tabs,
  Tab,
  Divider,
  colors,
  LinearProgress
} from '@mui/material';
import Page from 'src/components/Page';
import Header from './Header';
import ReferralData from './ReferralDataContainer'
import ReferralFinancials from './ReferralFinancialContainer'

//IMPORT ALERT
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { API, graphqlOperation } from "aws-amplify";
import { getReferral } from "../../graphql/queries"

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
  tabs: {
    marginTop: theme.spacing(3)
  },
  divider: {
    backgroundColor: colors.grey[300]
  },
  content: {
    marginTop: theme.spacing(3)
  }
}));

const AlertFunk = React.forwardRef((props, ref) => (
  <Alert elevation={6} variant="filled" ref={ref} {...props} />
));


function ReferralDetails({ match, history }) {
  const classes = useStyles();
  //const {tab: currentTab } = match.params;

  const [loading, setLoading] = useState(false)
  const [referral, setReferral] = useState({})

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

  const currentTab = match.params.currentTab
  const tabs = [
    { value: 'referraldata', label: 'Referral Data' },
    { value: 'financial', label: 'Contract Summary' },
  ];

  const handleTabsChange = (event, value) => {
    history.push(value);
  };

  useEffect(() => {

    const fetchReferral = async () => {
      try {
        setLoading(true)
        // const currentUser = await Auth.currentAuthenticatedUser();
        // const sub = currentUser.signInUserSession.idToken.payload.sub
        const { data } = await API.graphql(graphqlOperation(getReferral, {id: match.params.referralId}))
        setReferral(data.getReferral)
        setLoading(false)
      }catch(error) {
        console.log(error)
        setLoading(false)
        setErrorMessage('Failed to retreive referral information. Try again or email support@roosted.io.')
      }
    }

    fetchReferral()
  
  // eslint-disable-next-line
  }, []
  )

  const dataCollected = {
    open: open,
    errorMessage: errorMessage,
    loading: loading,
    history: history
  }

  const setDataCollected = {
    setOpen: setOpen,
    setErrorMessage: setErrorMessage,
    setLoading: setLoading,
    setReferral: setReferral
  }

  return (
    <Page
      className={classes.root}
      title="Referral Details"
    >
        <Snackbar open={open} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
        <AlertFunk onClose={handleClose} severity="error">
          {errorMessage}
        </AlertFunk>
       </Snackbar>
      <Container maxWidth={false}>
        <Header dataCollected={dataCollected} setDataCollected={setDataCollected} history={history} referral={referral}/>
        <Tabs
          className={classes.tabs}
          onChange={handleTabsChange}
          scrollButtons="auto"
          value={currentTab}
          variant="scrollable"
        >
          {tabs.map((tab) => (
            <Tab
              key={tab.value}
              label={tab.label}
              value={tab.value}
            />
          ))}
        </Tabs>
        <Divider className={classes.divider} />
        {loading ? <LinearProgress style={{marginTop: '1rem'}} /> :
        <div className={classes.content}>
          {currentTab === 'referraldata' && <ReferralData referral={referral} dataCollected={dataCollected} setDataCollected={setDataCollected}/>}
          {currentTab === 'financial' && <ReferralFinancials referral={referral} dataCollected={dataCollected} setDataCollected={setDataCollected}/>}
        </div>}
      </Container>
    </Page>
  );
}

ReferralDetails.propTypes = {
  history: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired
};

export default ReferralDetails;
