import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { Grid } from '@mui/material';
import ReferralClientStatus from './ReferralClientStatus';
import ReferralClientInformation from './ReferralClientInformation';
import ReferralPartnerAgentInformation from './ReferralPartnerAgentInformation'
import ReferralDataCard from './ReferralDataCard'

const useStyles = makeStyles(() => ({
  root: {}
}));

function ReferralDataContainer({ className, referral, dataCollected, setDataCollected, ...rest }) {
  const classes = useStyles();
  // const [customer, setCustomer] = useState();

  // useEffect(() => {
  //   let mounted = true;

  //   const fetchCustomer = () => {
  //     axios.get('/api/management/customers/1/summary').then(response => {
  //       if (mounted) {
  //         setCustomer(response.data.summary);
  //       }
  //     });
  //   }

  //   fetchCustomer();

  //   return () => {
  //     mounted = false;
  //   };
  // }, []);

  if (!referral.id) {
    return null;
  }

  return (
    dataCollected.loading ? <React.Fragment/> :
    <Grid
      {...rest}
      className={clsx(classes.root, className)}
      container
      spacing={3}
    >
      <Grid
        item
        xs={12}
      >
        <ReferralClientStatus referral={referral} dataCollected={dataCollected} setDataCollected={setDataCollected} />
      </Grid>
      <Grid
        item
        md={4}
        xs={12}
      >
        <ReferralClientInformation referral={referral} dataCollected={dataCollected} setDataCollected={setDataCollected}/>
      </Grid>
      <Grid
        item
        md={4}
        xs={12}
      >
        <ReferralPartnerAgentInformation referral={referral} dataCollected={dataCollected} setDataCollected={setDataCollected} />
      </Grid>
      <Grid
        item
        md={4}
        xs={12}
      >
        <ReferralDataCard referral={referral} dataCollected={dataCollected} setDataCollected={setDataCollected} />
      </Grid>
    </Grid>
  );
}

ReferralDataContainer.propTypes = {
  className: PropTypes.string
};

export default ReferralDataContainer;
