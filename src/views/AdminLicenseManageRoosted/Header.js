import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@mui/styles';
import { Grid, Typography, Button, TextField } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import queryString from 'query-string'

const useStyles = makeStyles(() => ({
  root: {}
}));

function Header({ className, history, location, globalUser, refreshTrigger, setRefreshTrigger, ...rest }) {
  const classes = useStyles();

  const [filter, setFilter] = useState(queryString.parse(location.search).filter)

  const handleSetFilter = () => {
    history.push(`/license/admin/roosted?filter=${filter}`)
    setRefreshTrigger(!refreshTrigger)
  }

  const handleChange = async (event) => {
    setFilter(event.target.value)
  }

  console.log(location)
  return (
    <div
      {...rest}
      className={clsx(classes.root, className)}
    >
      <Grid
        alignItems="flex-end"
        container
        justify="space-between"
        spacing={3}
      >
        <Grid item>
          <Typography
            component="h2"
            gutterBottom
            variant="overline"
          >
            Admin
          </Typography>
          <Typography
            component="h1"
            variant="h3"
          >
            Manage Roosted Licenses
          </Typography>
        </Grid>
        <Grid item>
          <div >
            <TextField
              style={{verticalAlign: 'middle', marginRight: '1rem'}}
              variant='outlined'
              margin='dense'
              onChange={handleChange} 
              defaultValue={queryString.parse(location.search).filter} 
              select     
              // eslint-disable-next-line react/jsx-sort-props
              SelectProps={{ native: true }}>
              {[{value: 'none', name: 'None'}, {value: 'waitingOnPayment', name: 'Waiting On Payment'}, {value: 'waitingOnPolicies', name: 'Waiting On Policies'}, {value: 'waitingOnICA', name: 'Waiting On ICA'}, {value: 'waitingOnTransfer', name: 'Waiting On Transfer'}, {value: 'waitingOnRoosted', name: 'Waiting On Roosted'}].map(option => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.name}
                </option>
              ))}
            </TextField>
            <Button
              style={{verticalAlign: 'middle'}}
              color="primary"
              variant="contained"
              endIcon={<CheckCircleOutlineIcon/>}
              onClick={handleSetFilter}>

              Filter
            </Button>
          </div>
        </Grid>
      </Grid>
    </div>
  );
}

Header.propTypes = {
  className: PropTypes.string
};

export default Header;
