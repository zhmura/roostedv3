import React from 'react';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  Typography,
  colors,
} from '@mui/material';
import CardInformation from './PerchCardInformation'

const useStyles = makeStyles((theme) => ({
  root: {},
  header: {
    paddingBottom: 0
  },
  content: {
    padding: 0,
    '&:last-child': {
      paddingBottom: 0
    }
  },
  description: {
    padding: theme.spacing(2, 3, 1, 3)
  },
  tags: {
    padding: theme.spacing(0, 3, 2, 3),
    '& > * + *': {
      marginLeft: theme.spacing(1)
    }
  },
  learnMoreButton: {
    marginLeft: theme.spacing(2)
  },
  likedButton: {
    color: colors.red[600]
  },
  shareButton: {
    marginLeft: theme.spacing(1)
  },
  details: {
    padding: theme.spacing(0, 2, 3, 3)
  }
}));

function PlanCard({ 
  className, 
  paymentPeriod,
  planSelected,
  promoCodeValid,
  setPlanSelected, 
  promoCode,
  paymentIntent,
  globalUser,
  setOpen,
  setErrorMessage,
  setLoading,
  loading,
  userSetUser,
  history,
  ...rest }) {
  const classes = useStyles();

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardHeader
        avatar={(
          <Avatar
            alt="Author"
            src='/images/icons/bird-house.png'
          />
        )}
        className={classes.header}
        disableTypography
        subheader={(
          <Typography variant="body2">
            70/30 Commission Share With Roosted
          </Typography>
        )}
        title={<Typography variant='h5'>Perch Plan</Typography>}
      />
      <Divider style={{marginTop: '0.5rem'}}/>
      <CardContent className={classes.content}>
        <div align='center' className={classes.description}>
          <Typography variant="h6" gutterBottom>Great for 3 to 4 referrals per year</Typography>
          <Typography variant="h6" gutterBottom>Keep 70% of the referral commission</Typography>
        </div>
     
        <div className={classes.details}>
          <Grid
            alignItems="center"
            container
            justify="space-between"
            spacing={3}
          >
            <Grid item align='center'>
              {paymentPeriod ?
              <>
                <Typography variant="h5">
                  $9
                </Typography>
                <Typography variant="body2">Per Month</Typography> 
              </> :
              <>
                <Typography variant="h6">
                  $72 (save 33%)
                </Typography>
                <Typography variant="body2">Per Year</Typography> 
              </>
              }

            </Grid>
            <Grid item align='center'>
              <Typography variant={paymentPeriod ? "h5" : 'h6'}>$0</Typography>
              <Typography variant="body2">{'MLS/REALTOR Dues'}</Typography>
            </Grid>
            <Grid item align='center'>
              {promoCodeValid ? <Typography variant={paymentPeriod ? "h5" : 'h6'} color='error'><strike>$25</strike> $0</Typography> : <Typography variant={paymentPeriod ? "h5" : 'h6'}>$25</Typography>}
              <Typography variant="body2">Setup Fee</Typography>
            </Grid>
            <Grid item align='center' xs={12}>
              <Button
                variant={planSelected === 'perch' ? 'contained' : 'outlined'}
                size="small"
                color='primary'
                onClick={() => setPlanSelected('perch')}
              >
                {planSelected === 'perch' ? 'Selected Plan' : 'Select Plan'}
              </Button>
              </Grid>
          </Grid>
        </div>
      {planSelected === 'perch' ?
         <>
          <Divider style={{marginBottom: '1rem'}}/>
          <CardInformation
            promoCode={promoCode}
            planSelected={planSelected}
            paymentPeriod={paymentPeriod}
            promoCodeValid={promoCodeValid}
            paymentIntent={paymentIntent}
            globalUser={globalUser}
            setOpen={setOpen}
            setErrorMessage={setErrorMessage}
            setLoading={setLoading}
            loading={loading}
            userSetUser={userSetUser}
            history={history}/>
          </> :
          <React.Fragment/>}
      </CardContent>
    </Card>
  );
}

export default PlanCard;
