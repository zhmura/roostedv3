import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { Typography } from '@mui/material';

const useStyles = makeStyles(() => ({
  root: {}
}));

function Header({ className, ...rest }) {
  const classes = useStyles();

  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <Typography
        component="h2"
        gutterBottom
        variant="overline"
      >
        Add a New Roosted License
      </Typography>
      <Typography
        component="h1"
        variant="h3"
      >
        Sign Policies and Procedure Manual
      </Typography>
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string
};

export default Header;
