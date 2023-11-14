import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { Typography, Card, Container, CardContent, Button} from '@mui/material';
import { isMobile } from 'react-device-detect'

const useStyles = makeStyles((theme) => ({
  root: {
    paddingTop: theme.spacing(6),
  },
  header: {
    width: theme.breakpoints.values.md,
    maxWidth: '100%',
    margin: '0 auto',
    padding: '45px 24px',
    [theme.breakpoints.up('md')]: {
      padding: '45px 24px'
    }
  },
  text: {
    margin: theme.spacing(3)
  }, 
}));

function Header({ className, ...rest }) {
  const classes = useStyles();

  return (
    <div
    {...rest}
    className={clsx(classes.root, className)}
    >
      <Container width='100vw' align='center'>
        <Card
          style={{
            maxWidth: '100%',
            width: isMobile ? '100%' : '80%',
          }}>
          <CardContent >
          <Typography className={classes.headers} variant="h4">Who is Eligible:</Typography>
          <Typography className={classes.text} variant="body1">
            Whether you are a Partner Agent that receives our referrals or a Roosted Agent that makes them, we've partnered with the CEShop.com to provide access to discounted continuing education in all 50 states.
          </Typography>
          <Typography variant="h4">How to Claim the Discount:</Typography>
          <Typography className={classes.text} variant="body1">
            Click the button below to access Roosted's CEShop domain or visit: {!isMobile ? <a href='https://roosted.theceshop.com' target="_blank" rel="noopener noreferrer">https://roosted.theceshop.com</a> : 'https://roosted.theceshop.com'}
          </Typography>
          <Typography variant="h4">What to Expect:</Typography>
          <Typography className={classes.text} variant="body1">
            Going to The CE Shops website will take you off Roosted's page. They require a separate login, so you will need to create an account with them. Your Roosted username and password won't work.
          </Typography>
          {!isMobile ? 
          <div className={classes.buttons}>
              <Button
                className={classes.navButton}
                variant="contained"
                color="primary"
                onClick={() => {window.open("https://roosted.theceshop.com/")}}
              >
                Go to The CE Shop
              </Button>
          </div> : <React.Fragment/>}
          </CardContent>
        </Card>
      </Container>
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string
};

export default Header;
