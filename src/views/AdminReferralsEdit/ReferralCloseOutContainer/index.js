import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { Grid } from '@mui/material';
import ReferralFinancials from './ReferralCloseOut'

const useStyles = makeStyles(() => ({
  root: {}
}));

function ReferralPayoutContainer({ className, referral, dataCollected, setDataCollected, ...rest }) {
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
        <ReferralFinancials referral={referral} dataCollected={dataCollected} setDataCollected={setDataCollected} />
      </Grid>
    </Grid>
  );
}

ReferralPayoutContainer.propTypes = {
  className: PropTypes.string
};

export default ReferralPayoutContainer;
