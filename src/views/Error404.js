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

const Error404 = () => {
  const classes = useStyles();
  const theme = useTheme();
  const mobileDevice = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Page
      className={classes.root}
      title="Error 404"
    >
      <Typography
        align="center"
        variant={mobileDevice ? 'h4' : 'h1'}
      >
        404: The page you are looking for isn’t here
      </Typography>
      <Typography
        align="center"
        variant="subtitle2"
      >
        Uh oh...you tried to access a part of the Roost that doesn't exist apparently. Use the back button on your browser or try directly navigating to the page you were looking for.
      </Typography>
      <div className={classes.imageContainer}>
        <img
          alt="Owly"
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

export default Error404;
