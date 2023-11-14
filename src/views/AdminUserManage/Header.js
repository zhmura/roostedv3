import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { Grid, Typography, Button} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle'
//import { Auth, API } from 'aws-amplify'

const useStyles = makeStyles(() => ({
  root: {}
}));

function Header({ className, history, globalUser, ...rest }) {
  const classes = useStyles();
  
  // const transferData = async () => {
  //   try {
      
  //     ////TRANSFER LAMBDA CALL

  //     let custom = { 
  //       headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
  //       body: {}
  //     }
  //     console.log(custom)
  //     const transferResponse = await API.post(
  //       'roostedRestAPI', 
  //       '/transfer/v2-to-v3',
  //       custom
  //     )
  //     console.log(transferResponse)
  //   }catch(error) {
  //     console.log(error)
  //   }
  // }

  // const transferReferrals = async () => {
  //   try {
      
  //     ////TRANSFER LAMBDA CALL

  //     let custom = { 
  //       headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
  //       body: {}
  //     }
  //     console.log(custom)
  //     const transferResponse = await API.post(
  //       'roostedRestAPI', 
  //       '/transfer/referrals',
  //       custom
  //     )
  //     console.log(transferResponse)
  //   }catch(error) {
  //     console.log(error)
  //   }
  // }


  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <Grid
        alignItems="flex-end"
        container
        justify="space-between"
        spacing={3}
      >
        <Grid item>
          <Typography
            component="h2"
            gutterBottom
            variant="overline"
          >
            Admin
          </Typography>
          <Typography
            component="h1"
            variant="h3"
          >
            Manage Users
          </Typography>
        </Grid>
        <Grid item>
          <Button
            color="primary"
            variant="contained"
            endIcon={<AddCircleIcon/>}
            onClick={() => history.push('/users/create/broker')}>
            Add Broker
          </Button>
        </Grid>
        {/* <Grid item>
          <Button
            color="primary"
            variant="contained"
            endIcon={<AddCircleIcon/>}
            onClick={transferData}>
            Transfer User Data
          </Button>
        </Grid>
        <Grid item>
          <Button
            color="primary"
            variant="contained"
            endIcon={<AddCircleIcon/>}
            onClick={transferReferrals}>
            Transfer Referrals
          </Button>
        </Grid> */}
      </Grid>
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string
};

export default Header;
