import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { Typography, Grid } from '@mui/material';

const useStyles = makeStyles(() => ({
  root: {},
  topBar: {
    marginBottom: '1rem'
  }
}));

function Header({ className, totalLowEndPayout, totalHighEndPayout, ...rest }) {
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
            Dashboard
          </Typography>
          <Typography
            component="h1"
            variant="h3"
          >
            Roosted Metrics
          </Typography>
        </Grid>
        <Grid item>
          <Typography>{`Low End Backlog: $${totalLowEndPayout}`}</Typography>
          <Typography>{`High End Backlog: $${totalHighEndPayout}`}</Typography>
        </Grid>
      </Grid>
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string
};

export default Header;
