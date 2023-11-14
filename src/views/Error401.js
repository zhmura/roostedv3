import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { makeStyles } from '@mui/styles';
import { Typography, Button, useTheme, useMediaQuery } from '@mui/material';

import Page from '../components/Page';

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(3),
    paddingTop: '10vh',
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center'
  },
  imageContainer: {
    marginTop: theme.spacing(6),
    display: 'flex',
    justifyContent: 'center'
  },
  image: {
    maxWidth: '100%',
    width: 560,
    maxHeight: 300,
    height: 'auto'
  },
  buttonContainer: {
    marginTop: theme.spacing(6),
    display: 'flex',
    justifyContent: 'center'
  }
}));

const Error401 = () => {
  const classes = useStyles();
  const theme = useTheme();
  const mobileDevice = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Page
      className={classes.root}
      title="Error 401"
    >
      <Typography
        align="center"
        variant={mobileDevice ? 'h4' : 'h1'}
      >
        401: We are sorry but we are not able to authenticate you.
      </Typography>
      <Typography
        align="center"
        variant="subtitle2"
      >
        Hmmmm...apparently we can't verify your credentials. Try going to https://app.roosted.io/auth/login and try again.
      </Typography>
      <div className={classes.imageContainer}>
        <img
          alt="Under development"
          className={classes.image}
          src="/images/logos/roosted_horizontal.png"
        />
      </div>
      <div className={classes.buttonContainer}>
        <Button
          color="primary"
          component={RouterLink}
          to="/"
          variant="outlined"
        >
          Back to home
        </Button>
      </div>
    </Page>
  );
};

export default Error401;
