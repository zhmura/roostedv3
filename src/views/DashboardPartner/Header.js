import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { Typography } from '@mui/material';

const useStyles = makeStyles(() => ({
  root: {},
  topBar: {
    marginBottom: '1rem'
  }
}));

function Header({ className, ...rest }) {
  const classes = useStyles();

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}

    >
      <div className={classes.topBar}>
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
          Partner Referral Metrics
        </Typography>
      </div>
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string
};

export default Header;
