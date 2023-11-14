import React, { useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import { 
  Container, 
  Grid,
  LinearProgress,
 } from '@mui/material';
import Page from 'src/components/Page';
import Header from './Header';
import Overview from './Overview';
import Overview2 from './Overview2';
import ReferralsByMonthChart from './ReferralsByMonthChart';
import RoostedAgentsByMonthChart from './RoostedByMonthChart';
import PartnerAgentsByMonthChart from './PartnerByMonthChart';
import { numberWithCommas, getMonths } from '../../utils/utilities'

//IMPORT AMPLIFY GRAPHQL ASSETS
import { API, graphqlOperation } from "aws-amplify";
import { listReferrals, listRoostedLicenses, listPartnerLicenses } from "../../graphql/queries"
//import {  } from "../../graphql/mutations"

//IMPORT ALERT
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../store/actions/index';

function AlertFunk(props) {
  return <Alert elevation={6} variant="filled" {...props} />;
}

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }
}));

function MasterDashboard(props) {
  const classes = useStyles();

  const [loading, setLoading] = useState(false)
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalRoostedAgentIncome, setTotalRoostedAgentIncome] = useState(0)
  const [totalPartnerIncome, setTotalPartnerIncome] = useState(0)
  const [totalRoostedAgents, setTotalRoostedAgents] = useState(0)
  const [totalPartnerAgents, setTotalPartnerAgents] = useState(0)
  const [totalWaitingOnVerification, setTotalWaitingOnVerification] = useState(0)
  const [totalActiveReferrals, setTotalActiveReferrals] = useState(0)
  const [totalPendingReferrals, setTotalPendingReferrals] = useState(0)
  const [totalWaitingReferrals, setTotalWaitingReferrals] = useState(0)
  const [totalClientLostReferrals, setTotalClientLostReferrals] = useState(0)
  const [totalUnderContractReferrals, setTotalUnderContractReferrals] = useState(0)
  const [totalClosedReferrals, setTotalClosedReferrals] = useState(0)
  const [totalLowEndPayout, setTotalLowEndPayout] = useState(0)
  const [totalHighEndPayout, setTotalHighEndPayout] = useState(0)
  const [currentYear, setCurrentYear] = useState((new Date()).getFullYear())
  const [referralsByMonth, setReferralsByMonth] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  const [partnersByMonth, setPartnersByMonth] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
  const [roostedByMonth, setRoostedByMonth] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

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
  
    const fetchReferrals = async () => {
      setLoading(true)
      try {
        // const currentUser = await Auth.currentAuthenticatedUser();
        // const sub = currentUser.signInUserSession.idToken.payload.sub

        let referralsArray = {}
        let roostedAgents = {}
        let partnerAgents = {}

        if(props.globalUser.userType === 'broker') { 
          //get all the referrals reated by a user
          referralsArray = await API.graphql(graphqlOperation(listReferrals, {
          limit: 900000, 
          filter: {or: [{referralReferringAgentState: {eq: props.globalUser.brokerState}}, {referralState: {eq: props.globalUser.brokerState}}]}
          }))

          roostedAgents = await API.graphql(graphqlOperation(listRoostedLicenses, {
          limit: 900000, 
          filter: {or: [{referralReferringAgentState: {eq: props.globalUser.brokerState}}, {referralState: {eq: props.globalUser.brokerState}}]}
          }))

          partnerAgents = await API.graphql(graphqlOperation(listPartnerLicenses, {
          limit: 900000, 
          filter: {or: [{referralReferringAgentState: {eq: props.globalUser.brokerState}}, {referralState: {eq: props.globalUser.brokerState}}]}
          }))

        } else {
        //get all the referrals reated by a user
          referralsArray = await API.graphql(graphqlOperation(listReferrals, {
          limit: 900000, 
          }))

          roostedAgents = await API.graphql(graphqlOperation(listRoostedLicenses, {
          limit: 900000, 
          }))

          partnerAgents = await API.graphql(graphqlOperation(listPartnerLicenses, {
          limit: 900000, 
          }))

        }
        
        //THE FOLLOWING GETS THE TOTAL INCOME FOR ROOSTED
        let totalIncomeLoop = 0;
        if(referralsArray.data.listReferrals.items.length > 0) {
          for(let i = 0; i < referralsArray.data.listReferrals.items.length; i++) {
            if(referralsArray.data.listReferrals.items[i].referralClientStatus === 'closed') {
              totalIncomeLoop = totalIncomeLoop + referralsArray.data.listReferrals.items[i].referralRoostedPayoutActual === null ? 0 : referralsArray.data.listReferrals.items[i].referralRoostedPayoutActual
            }
          }
          setTotalIncome(numberWithCommas(totalIncomeLoop))
        } else { 
          setTotalIncome(0)
        }
        //END TOTAL INCOME

        //THE FOLLOWING GETS THE TOTAL INCOME FOR ROOSTED AGENTS
        let totalRoostedAgentIncomeLoop = 0;
        if(referralsArray.data.listReferrals.items.length > 0) {
          for(let i = 0; i < referralsArray.data.listReferrals.items.length; i++) {
            if(referralsArray.data.listReferrals.items[i].referralClientStatus === 'closed') {
              totalRoostedAgentIncomeLoop = totalRoostedAgentIncomeLoop + referralsArray.data.listReferrals.items[i].referralRoostedAgentPayoutActual === null ? 0 : referralsArray.data.listReferrals.items[i].referralRoostedAgentPayoutActual
            }
          }
          setTotalRoostedAgentIncome(numberWithCommas(totalRoostedAgentIncomeLoop))
        } else { 
          setTotalRoostedAgentIncome(0)
        }
        //END TOTAL INCOME

        //THE FOLLOWING GETS THE TOTAL INCOME FOR PARTNER AGENTS
        let totalPartnerAgentIncomeLoop = 0;
        if(referralsArray.data.listReferrals.items.length > 0) {
          for(let i = 0; i < referralsArray.data.listReferrals.items.length; i++) {
            if(referralsArray.data.listReferrals.items[i].referralClientStatus === 'closed') {
              totalPartnerAgentIncomeLoop = totalPartnerAgentIncomeLoop + referralsArray.data.listReferrals.items[i].referralPartnerPayoutActual === null ? 0 : referralsArray.data.listReferrals.items[i].referralPartnerPayoutActual
            }
          }
          setTotalPartnerIncome(numberWithCommas(totalPartnerAgentIncomeLoop))
        } else { 
          setTotalPartnerIncome(0)
        }
        //END TOTAL INCOME

        //THE FOLLOWING GETS TOTAL ACTIVE REFERRALS
        let totalActiveLoop = 0;
        if(referralsArray.data.listReferrals.items.length > 0) {
          for(let i = 0; i < referralsArray.data.listReferrals.items.length; i++) {
            if(referralsArray.data.listReferrals.items[i].referralStatus === 'accepted') {
              totalActiveLoop = totalActiveLoop + 1
            }
          }
          setTotalActiveReferrals(numberWithCommas(totalActiveLoop))
        } else { 
          setTotalActiveReferrals(0)
        }
        //END TOTAL ACTIVE REFERRALS

        //THE FOLLOWING GETS TOTAL UNDER CONTRACT REFERRALS
        let totalUnderContractLoop = 0;
        if(referralsArray.data.listReferrals.items.length > 0) {
          for(let i = 0; i < referralsArray.data.listReferrals.items.length; i++) {
            if(referralsArray.data.listReferrals.items[i].referralClientStatus === 'underContract') {
              totalUnderContractLoop = totalUnderContractLoop + 1
            }
          }
          setTotalUnderContractReferrals(numberWithCommas(totalUnderContractLoop))
        } else { 
          setTotalUnderContractReferrals(0)
        }
        //END TOTAL UNDER CONTRACT REFERRALS

        //THE FOLLOWING GETS TOTAL LOW END PAYOUT
        let totalLowEndLoop = 0;
        if(referralsArray.data.listReferrals.items.length > 0) {
          for(let i = 0; i < referralsArray.data.listReferrals.items.length; i++) {
            if(referralsArray.data.listReferrals.items[i].referralStatus !== 'closed' && referralsArray.data.listReferrals.items[i].referralStatus !== 'clientLost' && referralsArray.data.listReferrals.items[i].referralStatus !== 'deleted' && referralsArray.data.listReferrals.items[i].referralStatus !== 'rejected') {
              totalLowEndLoop = totalLowEndLoop + referralsArray.data.listReferrals.items[i].referralRoostedPayoutLow
            }
          }
          setTotalLowEndPayout(numberWithCommas(totalLowEndLoop))
        } else { 
          setTotalLowEndPayout(0)
        }
        //END TOTAL LOW END PAYOUT

        //THE FOLLOWING GETS TOTAL HIGH END PAYOUT
        let totalHighEndLoop = 0;
        if(referralsArray.data.listReferrals.items.length > 0) {
          for(let i = 0; i < referralsArray.data.listReferrals.items.length; i++) {
            if(referralsArray.data.listReferrals.items[i].referralStatus !== 'closed' && referralsArray.data.listReferrals.items[i].referralStatus !== 'clientLost' && referralsArray.data.listReferrals.items[i].referralStatus !== 'deleted' && referralsArray.data.listReferrals.items[i].referralStatus !== 'rejected') {
              totalHighEndLoop = totalHighEndLoop + referralsArray.data.listReferrals.items[i].referralRoostedPayoutHigh
            }
          }
          setTotalHighEndPayout(numberWithCommas(totalHighEndLoop))
        } else { 
          setTotalHighEndPayout(0)
        }
        //END TOTAL HIGH END PAYOUT

        //THE FOLLOWING GETS TOTAL PENDING REFERRALS
        let totalPendingLoop = 0;
        if(referralsArray.data.listReferrals.items.length > 0) {
          for(let i = 0; i < referralsArray.data.listReferrals.items.length; i++) {
            if(referralsArray.data.listReferrals.items[i].referralStatus === 'pending') {
              totalPendingLoop = totalPendingLoop + 1
            }
          }
          setTotalPendingReferrals(numberWithCommas(totalPendingLoop))
        } else { 
          setTotalPendingReferrals(0)
        }
        //END TOTAL UNDER CONTRACT REFERRALS

        //THE FOLLOWING GETS TOTAL WAITING REFERRALS
        let totalWaitingLoop = 0;
        if(referralsArray.data.listReferrals.items.length > 0) {
          for(let i = 0; i < referralsArray.data.listReferrals.items.length; i++) {
            if(referralsArray.data.listReferrals.items[i].referralStatus === 'waitingForAgentAssignment') {
              totalWaitingLoop = totalWaitingLoop + 1
            }
          }
          setTotalWaitingReferrals(numberWithCommas(totalWaitingLoop))
        } else { 
          setTotalWaitingReferrals(0)
        }
        //END TOTAL WAITING REFERRALS

        //THE FOLLOWING GETS TOTAL CLOSED REFERRALS
        let totalClosedLoop = 0;
        if(referralsArray.data.listReferrals.items.length > 0) {
          for(let i = 0; i < referralsArray.data.listReferrals.items.length; i++) {
            if(referralsArray.data.listReferrals.items[i].referralStatus === 'closed') {
              totalClosedLoop = totalClosedLoop + 1
            }
          }
          setTotalClosedReferrals(numberWithCommas(totalClosedLoop))
        } else { 
          setTotalClosedReferrals(0)
        }
        //END TOTAL CLOSED REFERRALS

        //THE FOLLOWING GETS TOTAL LOST CLIENT REFERRALS
        let totalLostLoop = 0;
        if(referralsArray.data.listReferrals.items.length > 0) {
          for(let i = 0; i < referralsArray.data.listReferrals.items.length; i++) {
            if(referralsArray.data.listReferrals.items[i].referralStatus === 'clientLost') {
              totalLostLoop = totalLostLoop + 1
            }
          }
          setTotalClientLostReferrals(numberWithCommas(totalLostLoop))
        } else { 
          setTotalClientLostReferrals(0)
        }
        //END TOTAL LOST CLIENT REFERRALS

        //THE TOTAL ROOSTED AGENTS
        let totalRoostedAgentsLoop = 0;
        if(roostedAgents.data.listRoostedLicenses.items.length > 0) {
          for(let i = 0; i < roostedAgents.data.listRoostedLicenses.items.length; i++) {
            if(roostedAgents.data.listRoostedLicenses.items[i].primaryLicense === true && roostedAgents.data.listRoostedLicenses.items[i].licenseVerificationStatus === 'verified') {
              totalRoostedAgentsLoop = totalRoostedAgentsLoop + 1
            }
          }
          setTotalRoostedAgents(numberWithCommas(totalRoostedAgentsLoop))
        } else { 
          setTotalRoostedAgents(0)
        }
        //END TOTAL ROOSTED AGENTS

        //THE TOTAL ROOSTED AGENTS WAITING
        let totalRoostedWaitingAgentsLoop = 0;
        if(roostedAgents.data.listRoostedLicenses.items.length > 0) {
          for(let i = 0; i < roostedAgents.data.listRoostedLicenses.items.length; i++) {
            if(roostedAgents.data.listRoostedLicenses.items[i].licenseVerificationStatus === 'waitingOnRoosted') {
              totalRoostedWaitingAgentsLoop = totalRoostedWaitingAgentsLoop + 1
            }
          }
          setTotalWaitingOnVerification(numberWithCommas(totalRoostedWaitingAgentsLoop))
        } else { 
          setTotalWaitingOnVerification(0)
        }
        //END TOTAL ROOSTED AGENTS WAITING

        //THE TOTAL PARTNER AGENTS
        let totalPartnerAgentsLoop = 0;
        if(partnerAgents.data.listPartnerLicenses.items.length > 0) {
          for(let i = 0; i < partnerAgents.data.listPartnerLicenses.items.length; i++) {
            if(partnerAgents.data.listPartnerLicenses.items[i].primaryLicense === true && partnerAgents.data.listPartnerLicenses.items[i].licenseVerificationStatus === 'verified') {
              totalPartnerAgentsLoop = totalPartnerAgentsLoop + 1
            }
          }
          setTotalPartnerAgents(numberWithCommas(totalPartnerAgentsLoop))
        } else { 
          setTotalPartnerAgents(0)
        }
        //END TOTAL PARTNER AGENTS

        //THE FOLLOWING GETS REFERRALS THIS YEAR
        let referralsByMonthLoop = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        if(referralsArray.data.listReferrals.items.length > 0) {
          for(let i = 0; i < referralsArray.data.listReferrals.items.length; i++) {
            if((new Date(referralsArray.data.listReferrals.items[i].createdAt)).getFullYear() === currentYear) {
              referralsByMonthLoop[new Date(referralsArray.data.listReferrals.items[i].createdAt).getMonth()] = referralsByMonthLoop[new Date(referralsArray.data.listReferrals.items[i].createdAt).getMonth()] + 1 
            }
          }
          setReferralsByMonth(referralsByMonthLoop)
        } else { 
          setReferralsByMonth([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
        }

        //END GETTING REFERRALS THIS YEAR

        //THE FOLLOWING GETS ROOSTED SIGN UPS
        let roostedByMonthLoop = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        if(roostedAgents.data.listRoostedLicenses.items.length > 0) {
          for(let i = 0; i < roostedAgents.data.listRoostedLicenses.items.length; i++) {
            if((new Date(roostedAgents.data.listRoostedLicenses.items[i].createdAt)).getFullYear() === currentYear && roostedAgents.data.listRoostedLicenses.items[i].primaryLicense) {
              roostedByMonthLoop[new Date(roostedAgents.data.listRoostedLicenses.items[i].createdAt).getMonth()] = roostedByMonthLoop[new Date(roostedAgents.data.listRoostedLicenses.items[i].createdAt).getMonth()] + 1 
            }
          }
          setRoostedByMonth(roostedByMonthLoop)
        } else { 
          setRoostedByMonth([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
        }

        //END GETTING ROOSTED SIGN UP

        //THE FOLLOWING GETS ROOSTED SIGN UPS
        let partnerByMonthLoop = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        if(partnerAgents.data.listPartnerLicenses.items.length > 0) {
          for(let i = 0; i < partnerAgents.data.listPartnerLicenses.items.length; i++) {
            if((new Date(partnerAgents.data.listPartnerLicenses.items[i].createdAt)).getFullYear() === currentYear && partnerAgents.data.listPartnerLicenses.items[i].primaryLicense) {
              partnerByMonthLoop[new Date(partnerAgents.data.listPartnerLicenses.items[i].createdAt).getMonth()] = partnerByMonthLoop[new Date(partnerAgents.data.listPartnerLicenses.items[i].createdAt).getMonth()] + 1 
            }
          }
          setPartnersByMonth(partnerByMonthLoop)
        } else { 
          setPartnersByMonth([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
        }

        //END GETTING ROOSTED SIGN UPS

        setLoading(false)

      }catch(error) {
        console.log(error)
        setLoading(false)
        setErrorMessage('Failed to retrieve referral metrics.')
        setOpen(true)
      }
      
    }

    if(props.globalUser.userType === 'admin' || props.globalUser.userType === 'broker') {
      fetchReferrals()
    }

  // eslint-disable-next-line
  },[currentYear])

  //Set Data for Chart
  const data = [
    {
      label: currentYear, 
      datums: 
        referralsByMonth.map((month, index) => {
          return {
            x: `${getMonths()[index]}`,
            y: month,
            r: undefined
          }
        })
    }
  ]

  const series = React.useMemo(
    () => ({
      showPoints: false,
      type: 'bar'
    }),
    []
  )

  //Set Axes for chart
  const axes = React.useMemo(
    () => [
      { primary: true, type: 'ordinal', position: 'bottom' },
      { type: 'linear', position: 'left', stacked: false }
    ],
    []
  )

  //Set Data for Chart
  const roostedData = [
    {
      label: currentYear, 
      datums: 
        roostedByMonth.map((month, index) => {
          return {
            x: `${getMonths()[index]}`,
            y: month,
            r: undefined
          }
        })
    }
  ]

  const roostedSeries = React.useMemo(
    () => ({
      showPoints: false,
      type: 'bar'
    }),
    []
  )

  //Set Axes for chart
  const roostedAxes = React.useMemo(
    () => [
      { primary: true, type: 'ordinal', position: 'bottom' },
      { type: 'linear', position: 'left', stacked: false }
    ],
    []
  )

  //Set Data for Chart
  const partnerData = [
    {
      label: currentYear, 
      datums: 
        partnersByMonth.map((month, index) => {
          return {
            x: `${getMonths()[index]}`,
            y: month,
            r: undefined
          }
        })
    }
  ]

  const partnerSeries = React.useMemo(
    () => ({
      showPoints: false,
      type: 'bar'
    }),
    []
  )

  //Set Axes for chart
  const partnerAxes = React.useMemo(
    () => [
      { primary: true, type: 'ordinal', position: 'bottom' },
      { type: 'linear', position: 'left', stacked: false }
    ],
    []
  )

  return (
    <Page
      className={classes.root}
      title="Admin Dashboard"
    >
      <Snackbar open={open} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
        <AlertFunk onClose={handleClose} severity="error">
          {errorMessage}
        </AlertFunk>
      </Snackbar>
      <Container maxWidth={false}>
        <Header totalLowEndPayout={totalLowEndPayout} totalHighEndPayout={totalHighEndPayout}/>
        {loading ? <LinearProgress/> :
        <Grid
          container
          spacing={3}
        >
          <Grid
            item
            xs={12}
          >
            <Overview 
            totalClientLostReferrals={totalClientLostReferrals}
            totalActiveReferrals={totalActiveReferrals}
            totalUnderContractReferrals={totalUnderContractReferrals}
            totalClosedReferrals={totalClosedReferrals}
            totalPendingReferrals={totalPendingReferrals}
            totalWaitingReferrals={totalWaitingReferrals}/>
          </Grid>
          <Grid
            item
            xs={12}
          >
            <Overview2 
            totalIncome={totalIncome}
            totalRoostedAgentIncome={totalRoostedAgentIncome}
            totalPartnerIncome={totalPartnerIncome}
            totalRoostedAgents={totalRoostedAgents}
            totalPartnerAgents={totalPartnerAgents}
            totalWaitingOnVerification={totalWaitingOnVerification}/>
          </Grid>
          <Grid
            item
            // lg={8}
            // xl={9}
            xs={12}
          >
            <div style={{maxHeight: '100%'}}>
              <ReferralsByMonthChart 
              data={data}
              axes={axes}
              series={series}
              setCurrentYear={setCurrentYear}
              currentYear={currentYear}/>
            </div>
          </Grid>
          <Grid
            item
            // lg={8}
            // xl={9}
            xs={12}
          >
            <div style={{maxHeight: '100%'}}>
              <RoostedAgentsByMonthChart 
              data={roostedData}
              axes={roostedAxes}
              series={roostedSeries}
              setCurrentYear={setCurrentYear}
              currentYear={currentYear}/>
            </div>
          </Grid>
          <Grid
            item
            // lg={8}
            // xl={9}
            xs={12}
          >
            <div style={{maxHeight: '100%'}}>
              <PartnerAgentsByMonthChart 
              data={partnerData}
              axes={partnerAxes}
              series={partnerSeries}
              setCurrentYear={setCurrentYear}
              currentYear={currentYear}/>
            </div>
          </Grid>
          {/* <Grid
            item
            lg={4}
            xl={3}
            xs={12}
          >
            <EarningsSegmentation />
          </Grid>
          <Grid
            item
            lg={8}
            xs={12}
          >
            <LatestOrders />
          </Grid>
          <Grid
            item
            lg={4}
            xs={12}
          >
            <CustomerActivity />
          </Grid>
          <Grid
            item
            lg={8}
            xs={12}
          >
            <MostProfitableProducts />
          </Grid>
          <Grid
            item
            lg={4}
            xs={12}
          >
            <TopReferrals />
          </Grid> */}
        </Grid> }
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
      userSetUser: (user) => dispatch(actions.userSetUser(user)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MasterDashboard);
