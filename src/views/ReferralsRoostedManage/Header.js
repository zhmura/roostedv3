import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { Grid, Typography, Button } from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle'

const useStyles = makeStyles(() => ({
  root: {}
}));

function Header({ className, history, ...rest }) {
  const classes = useStyles();

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
            Roosted Referrals
          </Typography>
          <Typography
            component="h1"
            variant="h3"
          >
            Manage Referrals
          </Typography>
        </Grid>
        <Grid item>
          <Button
            color="primary"
            variant="contained"
            endIcon={<AddCircleIcon/>}
            onClick={() => history.push('/referrals/create/select-type')}
          >
            Create Referral
          </Button>
        </Grid>
      </Grid>
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string
};

export default Header;
