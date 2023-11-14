import React from 'react';
//import { Link as RouterLink } from 'react-router-dom';
//import clsx from 'clsx';
import PropTypes from 'prop-types';
//import { makeStyles } from '@mui/styles';
import { AppBar, Toolbar } from '@mui/material';

// const useStyles = makeStyles(() => ({
//   root: {
//     boxShadow: 'none'
//   }
// }));

function Topbar({ className, ...rest }) {
  //const classes = useStyles();
  return (
    <AppBar
      {...rest}
      style={{
        boxShadow: 'none'
      }}
      color="primary"
    >
      <Toolbar style={
        {backgroundColor: '#0F3164',
        paddingTop: '5px',
        paddingBottom: '5px',
        }}>
          <img
            alt="Logo"
            src="/images/logos/roosted_horizontal.png"
            height="50px"
          />
      </Toolbar>
    </AppBar>
  );
}

Topbar.propTypes = {
  className: PropTypes.string
};

export default Topbar;
