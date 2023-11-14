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
import ReferralsByMonthChart from './ReferralsByMonthChart';
import { numberWithCommas, getMonths } from '../../utils/utilities'

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { listReferrals } from "../../graphql/queries"
//import {  } from "../../graphql/mutations"

//IMPORT ALERT
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

const AlertFunk = React.forwardRef((props, ref) => (
  <Alert elevation={6} variant="filled" ref={ref} {...props} />
));

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  }
}));

function DashboardAnalytics() {
  const classes = useStyles();

  const [loading, setLoading] = useState(false)
  const [totalIncome, setTotalIncome] = useState(0)
  const [totalActiveReferrals, setTotalActiveReferrals] = useState(0)
  const [totalUnderContractReferrals, setTotalUnderContractReferrals] = useState(0)
  const [totalClosedReferrals, setTotalClosedReferrals] = useState(0)
  const [currentYear, setCurrentYear] = useState((new Date()).getFullYear())
  const [referralsByMonth, setReferralsByMonth] = useState([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

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

        const currentUser = await Auth.currentAuthenticatedUser();
        const sub = currentUser.signInUserSession.idToken.payload.sub

        //get all the referrals created by a user
        let { data } = await API.graphql(graphqlOperation(listReferrals, {
          limit: 900000, 
          filter: { referralRoostedAgentID: { eq: sub}}
        }))
        console.log(data.listReferrals)
        //THE FOLLOWING GETS THE TOTAL INCOME
        let totalIncomeLoop = 0;
        if(data.listReferrals.items.length > 0) {
          for(let i = 0; i < data.listReferrals.items.length; i++) {
            if(data.listReferrals.items[i].referralClientStatus === 'closed') {
            totalIncomeLoop = totalIncomeLoop + data.listReferrals.items[i].referralRoostedAgentPayoutActual === null ? 0 : data.listReferrals.items[i].referralRoostedAgentPayoutActual
          }
        }
          setTotalIncome(numberWithCommas(totalIncomeLoop))
        } else { 
          setTotalIncome(0)
        }
        //END TOTAL INCOME

        //THE FOLLOWING GETS TOTAL ACTIVE REFERRALS
        let totalActiveLoop = 0;
        if(data.listReferrals.items.length > 0) {
          for(let i = 0; i < data.listReferrals.items.length; i++) {
            if(data.listReferrals.items[i].referralStatus === 'accepted') {
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
        if(data.listReferrals.items.length > 0) {
          for(let i = 0; i < data.listReferrals.items.length; i++) {
            if(data.listReferrals.items[i].referralStatus === 'underContract') {
              totalUnderContractLoop = totalUnderContractLoop + 1
            }
          }
          setTotalUnderContractReferrals(numberWithCommas(totalUnderContractLoop))
        } else { 
          setTotalUnderContractReferrals(0)
        }
        //END TOTAL UNDER CONTRACT REFERRALS

        //THE FOLLOWING GETS TOTAL CLOSED REFERRALS
        let totalClosedLoop = 0;
        if(data.listReferrals.items.length > 0) {
          for(let i = 0; i < data.listReferrals.items.length; i++) {
            if(data.listReferrals.items[i].referralStatus === 'closed') {
              totalClosedLoop = totalClosedLoop + 1
            }
          }
          setTotalClosedReferrals(numberWithCommas(totalClosedLoop))
        } else { 
          setTotalClosedReferrals(0)
        }
        //END TOTAL CLOSED REFERRALS

        //THE FOLLOWING GETS REFERRALS THIS YEAR
        let referralsByMonth = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        if(data.listReferrals.items.length > 0) {
          for(let i = 0; i < data.listReferrals.items.length; i++) {
            if((new Date(data.listReferrals.items[i].createdAt)).getFullYear() === currentYear) {
              referralsByMonth[new Date(data.listReferrals.items[i].createdAt).getMonth()] = referralsByMonth[new Date(data.listReferrals.items[i].createdAt).getMonth()] + 1 
            }
          }
          setReferralsByMonth(referralsByMonth)
        } else { 
          setReferralsByMonth([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
        }

        //END GETTING REFERRALS THIS YEAR

        setLoading(false)

      }catch(error) {
        console.log(error)
        setLoading(false)
        setErrorMessage('Failed to retrieve referral metrics.')
        setOpen(true)
      }
      
    }

    fetchReferrals()

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

  return (
    <Page
      className={classes.root}
      title="Analytics Dashboard"
    >
      <Snackbar open={open} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
        <AlertFunk onClose={handleClose} severity="error">
          {errorMessage}
        </AlertFunk>
      </Snackbar>
      <Container maxWidth={false}>
        <Header />
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
            totalIncome={totalIncome}
            totalActiveReferrals={totalActiveReferrals}
            totalUnderContractReferrals={totalUnderContractReferrals}
            totalClosedReferrals={totalClosedReferrals}/>
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

export default DashboardAnalytics;
