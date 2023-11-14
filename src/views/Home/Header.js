import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { Typography, Card, Container, CardContent} from '@mui/material';
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
            <div className={classes.header}>
              <Typography
                align="center"
                gutterBottom
                variant="h1"
                style={{fontFamily: 'Roboto'}}
              >
                Welcome to Roosted.io
              </Typography>
              <Typography
                align="center"
                component="h2"
                variant="subtitle1"
                style={{fontFamily: 'Roboto'}}
              >
                The first digital real estate referral platform.
              </Typography>
              <div align="center" style={{marginTop: '1rem'}}>
                    <img
                      alt="Owlie"
                      src="/images/logos/owlie_transparent.png"
                      height="90px"
                    />
              </div>
            </div>
            <div align='center'>
            <Typography variant='subtitle1' > Need Help? support@roosted.io </Typography>
          </div>
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
