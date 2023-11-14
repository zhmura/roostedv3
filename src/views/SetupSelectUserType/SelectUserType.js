import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import {
  Card,
  CardContent,
  Typography,
  Radio,
  colors,
  LinearProgress
} from '@mui/material';

const useStyles = makeStyles((theme) => ({
  root: {},
  option: {
    border: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'flex-start',
    padding: theme.spacing(2),
    maxWidth: 560,
    '& + &': {
      marginTop: theme.spacing(2)
    }
  },
  selectedOption: {
    backgroundColor: colors.grey[50]
  },
  optionRadio: {
    margin: -10
  },
  optionDetails: {
    marginLeft: theme.spacing(2)
  }
}));

const options = [
  {
    value: 'roosted',
    title: 'Roosted Agent Account',
    description: 'Hang your license with Roosted, create referrals, and stop paying Association Dues and MLS Fees.'
  },
  {
    value: 'partner',
    title: 'Partner Agent Account',
    description: 'Keep your license with your current broker, pay all annual dues, receieve referrals and create referrals.'
  }
];

function SelectUserType({ 
  className,
  dataCollected,
  setDataCollected,
  loading,
  ...rest }) {

  const classes = useStyles();

  const handleChange = (event, option) => {
    setDataCollected.setSetupUserType(option.value)
  };
  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      {loading ? <LinearProgress/> : <React.Fragment/>}
      <CardContent>
        {options.map((option) => (
          <div
            className={clsx(classes.option, {
              [classes.selectedOption]: dataCollected.setupUserType === option.value
            })}
            key={option.value}
          >
            <Radio
              checked={dataCollected.setupUserType === option.value}
              className={classes.optionRadio}
              color="primary"
              onClick={(event) => handleChange(event, option)}
            />
            <div className={classes.optionDetails}>
              <Typography
                gutterBottom
                variant="h5"
              >
                {option.title}
              </Typography>
              <Typography variant="body1">{option.description}</Typography>
            </div>
          </div>
        ))}
        <div align='center' style={{marginTop: '1rem'}}>
          <Typography variant='caption'>Need Support? support@roosted.io</Typography>
        </div>
      </CardContent>
      {loading ? <LinearProgress/> : <React.Fragment/>}
    </Card>
  );
}

SelectUserType.propTypes = {
  className: PropTypes.string
};

export default SelectUserType;
