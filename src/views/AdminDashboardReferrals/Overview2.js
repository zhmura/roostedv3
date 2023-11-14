import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import {
  Card, Typography, Grid, //colors
} from '@mui/material';
//import Label from 'src/components/Label';

const useStyles = makeStyles((theme) => ({
  root: {},
  content: {
    padding: 0
  },
  item: {
    padding: theme.spacing(3),
    textAlign: 'center',
    [theme.breakpoints.up('md')]: {
      '&:not(:last-of-type)': {
        borderRight: `1px solid ${theme.palette.divider}`
      }
    },
    [theme.breakpoints.down('sm')]: {
      '&:not(:last-of-type)': {
        borderBottom: `1px solid ${theme.palette.divider}`
      }
    }
  },
  valueContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  label: {
    marginLeft: theme.spacing(1)
  }
}));

function Overview2(
  { 
    className, 
    totalRoostedAgentIncome, 
    totalPartnerIncome,
    totalPartnerAgents,
    totalRoostedAgents,
    totalIncome,
    totalWaitingOnVerification,
    ...rest 
  }) {
  const classes = useStyles();

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <Grid
        alignItems="center"
        container
        justify="space-between"
      >
        <Grid
          className={classes.item}
          item
          md={2}
          sm={6}
          xs={12}
        >
          <Typography
            component="h2"
            gutterBottom
            variant="overline"
          >
            Brokerage Income
          </Typography>
          <div className={classes.valueContainer}>
            <Typography variant="h3">
              $
              {totalIncome}
            </Typography>
            {/* <Label
              className={classes.label}
              color={colors.green[600]}
              variant="contained"
            >
              +25%
            </Label> */}
          </div>
        </Grid>
        <Grid
          className={classes.item}
          item
          md={2}
          sm={6}
          xs={12}
        >
          <Typography
            component="h2"
            gutterBottom
            variant="overline"
          >
           Roosted Income
          </Typography>
          <div className={classes.valueContainer}>
            <Typography variant="h3">
              $
              {totalRoostedAgentIncome}
            </Typography>
            {/* <Label
              className={classes.label}
              color={colors.green[600]}
              variant="contained"
            >
              +25%
            </Label> */}
          </div>
        </Grid>
        <Grid
          className={classes.item}
          item
          md={2}
          sm={6}
          xs={12}
        >
          <Typography
            component="h2"
            gutterBottom
            variant="overline"
          >
            Partner Income
          </Typography>
          <div className={classes.valueContainer}>
            <Typography variant="h3">
              ${totalPartnerIncome}
            </Typography>
            {/* <Label
              className={classes.label}
              color={colors.green[600]}
              variant="contained"
            >
              +12%
            </Label> */}
          </div>
        </Grid>
        <Grid
          className={classes.item}
          item
          md={2}
          sm={6}
          xs={12}
        >
          <Typography
            component="h2"
            gutterBottom
            variant="overline"
          >
           Roosted Agents
          </Typography>
          <div className={classes.valueContainer}>
            <Typography variant="h3">{totalRoostedAgents}</Typography>
            {/* <Label
              className={classes.label}
              color={colors.red[600]}
              variant="contained"
            >
              -20%
            </Label> */}
          </div>
        </Grid>
        <Grid
          className={classes.item}
          item
          md={2}
          sm={6}
          xs={12}
        >
          <Typography
            component="h2"
            gutterBottom
            variant="overline"
          >
            Partner Agents
          </Typography>
          <div className={classes.valueContainer}>
            <Typography variant="h3">{totalPartnerAgents}</Typography>
          </div>
        </Grid>
        <Grid
          className={classes.item}
          item
          md={2}
          sm={6}
          xs={12}
        >
          <Typography
            component="h2"
            gutterBottom
            variant="overline"
          >
          Verification Neeed
          </Typography>
          <div className={classes.valueContainer}>
            <Typography variant="h3">{totalWaitingOnVerification}</Typography>
          </div>
        </Grid>
      </Grid>
    </Card>
  );
}

Overview2.propTypes = {
  className: PropTypes.string
};

export default Overview2;
