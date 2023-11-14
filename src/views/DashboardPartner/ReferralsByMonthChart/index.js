import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
//import PerfectScrollbar from 'react-perfect-scrollbar';
import { makeStyles } from '@mui/styles';
import { Card, CardHeader, CardContent, Divider, TextField } from '@mui/material';
//import GenericMoreButton  from 'src/components/GenericMoreButton';
import { Chart } from 'react-charts'
import { getYears } from '../../../utils/utilities'

const useStyles = makeStyles(theme => ({
  root: {
    height: '100%'
  },
  content: {
    padding: theme.spacing(0, 0, 0, 0)
  },
  inner: {
    minWidth: 700
  },
  chart: {
    padding: theme.spacing(2, 2, 2, 2),
    maxHeight: '400px',
    height: '100%',
    width: '98%'
  }
}));

function ReferralsByMonth({ className, data, axes, series, setCurrentYear, currentYear, ...rest }) {
  const classes = useStyles();

  const handleYearChange = (event) => {
    event.persist()
    console.log(event.target.value)
    setCurrentYear(parseInt(event.target.value))
  }

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <CardHeader
       // action={<GenericMoreButton />}
        title="Referrals Received By Month"
        action={
          <TextField
            label='Year:'
            variant='outlined'
            margin='dense'
            defaultValue={currentYear}
            select
            onChange={handleYearChange}     
            // eslint-disable-next-line react/jsx-sort-props
            SelectProps={{ native: true }}>
            {getYears().map(year => (
              <option
                key={year}
                value={year}
              >
                {year}
              </option>
            ))}
          </TextField>
        }
      />
      <Divider />
      <CardContent className={classes.content}>
        {/* <PerfectScrollbar> */}
          <div className={classes.chart}>
            <Chart 
              data={data}
              axes={axes}
              series={series}
              tooltip
            />
          </div>
         {/* </PerfectScrollbar>  */}
      </CardContent>
    </Card>
  );
}

ReferralsByMonth.propTypes = {
  className: PropTypes.string
};

export default ReferralsByMonth;
