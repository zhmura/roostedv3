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

function Overview(
  { 
    className, 
    totalIncome, 
    totalActiveReferrals,
    totalUnderContractReferrals,
    totalClosedReferrals,
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
          md={3}
          sm={6}
          xs={12}
        >
          <Typography
            component="h2"
            gutterBottom
            variant="overline"
          >
            Total Income All Time
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
          md={3}
          sm={6}
          xs={12}
        >
          <Typography
            component="h2"
            gutterBottom
            variant="overline"
          >
            Current Active Referrals
          </Typography>
          <div className={classes.valueContainer}>
            <Typography variant="h3">
              {totalActiveReferrals}
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
          md={3}
          sm={6}
          xs={12}
        >
          <Typography
            component="h2"
            gutterBottom
            variant="overline"
          >
            Current Under Contract
          </Typography>
          <div className={classes.valueContainer}>
            <Typography variant="h3">{totalUnderContractReferrals}</Typography>
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
          md={3}
          sm={6}
          xs={12}
        >
          <Typography
            component="h2"
            gutterBottom
            variant="overline"
          >
            Total Closed All Time
          </Typography>
          <div className={classes.valueContainer}>
            <Typography variant="h3">{totalClosedReferrals}</Typography>
          </div>
        </Grid>
      </Grid>
    </Card>
  );
}

Overview.propTypes = {
  className: PropTypes.string
};

export default Overview;
