import React, { useEffect, useState, useMemo } from 'react';
import { makeStyles } from '@mui/styles';
import { Container, Typography, LinearProgress, Card, IconButton } from '@mui/material';
import Page from 'src/components/Page';
import Header from './Header';
import Results from './Referrals';
import { getReferralStatusStepsObject, getClientStatusStepsObject, getReferralStatusStepsObjectColor, getClientStatusStepsObjectColor } from '../../utils/utilities'
import ZoomInIcon from '@mui/icons-material/ZoomIn';

//IMPORT ALERT
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation } from "aws-amplify";
import { listReferrals } from "../../graphql/queries"

import Label from '../../components/Label'

const AlertFunk = React.forwardRef((props, ref) => (
  <Alert elevation={6} variant="filled" ref={ref} {...props} />
));

const useStyles = makeStyles((theme) => ({
  root: {},
  container: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
  results: {
    marginTop: theme.spacing(3)
  }
}));

function ReferralList(props) {
  const classes = useStyles();
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTable, setShowTable] = useState(false)
  const [id, setId] = useState('')

  //Required to identify the headers for a table
  const columns = useMemo(
    () => [
      {
        Header: "Referrals You Created",
        columns: [
          {
            Header: "View Referral",
            Cell: localProps => {
              return (
                <>
                <IconButton
                  color='primary'
                  onClick={() => props.history.push(`/referrals/details/roosted/${localProps.row.original.id}/referraldata?id=${id}`)}>
                  <ZoomInIcon/>
                </IconButton>
                </>
              )
            }
          },
          {
            Header: "Client",
            accessor: props => {return (`${props.referralClient.clientLastName}, ${props.referralClient.clientFirstName}`)},
            Cell: props => {
              return (
              <Typography>{props.row.original.referralClient.clientLastName}{`, ${props.row.original.referralClient.clientFirstName}`}</Typography>
              )
            }
          },
          {
            Header: "Type",
            accessor: props => {return (props.referralType === 'buyerReferral' ? 'Buyer' : 'Seller')},
            Cell: props => {
              return (
                props.row.original.referralType === 'buyerReferral' ?
                <Typography>Buyer</Typography> :
                <Typography>Seller</Typography>
              )
            }
          },
          {
            Header: "Referral Status",
            accessor: props => {return getReferralStatusStepsObject(props.referralStatus)},
            Cell: props => {
              return (
                <Label style={{marginLeft: '0.25rem', marginRight: '0.25rem'}} color={getReferralStatusStepsObjectColor(props.row.original.referralStatus)}>{getReferralStatusStepsObject(props.row.original.referralStatus)}</Label>
              )
            }
          },
          {
            Header: "Client Status",
            accessor: props => {return getClientStatusStepsObject(props.referralClientStatus) },
            Cell: props => {
              return (
                <Label style={{marginLeft: '0.25rem', marginRight: '0.25rem'}} color={getClientStatusStepsObjectColor(props.row.original.referralClientStatus)}>{getClientStatusStepsObject(props.row.original.referralClientStatus)}</Label>
              )
            }
          },
          {
            Header: "Referred To",
            accessor: props => {return (props.referralPartnerAgent === undefined || props.referralPartnerAgent === null ? '' :  props.referralPartnerAgent.email === 'support@roosted.io' ? 'Roosted Selects' : `${props.referralPartnerAgent.userLastName}, ${props.referralPartnerAgent.userFirstName}`)},
            Cell: props => {
              return (
                props.row.original.referralPartnerAgent === undefined || props.row.original.referralPartnerAgent === null ? '' :   props.row.original.referralPartnerAgent.email === 'support@roosted.io' ?
                <Typography>Roosted Selects</Typography> :
                <Typography>{props.row.original.referralPartnerAgent.userLastName}{`, ${props.row.original.referralPartnerAgent.userFirstName}`}</Typography>
              )
            }
          },
          {
            Header: "Zip Code",
            accessor: "referralAddress.zip"
          },
        ]
      },

      // Example if I need second group headers in the future
      // {
      //   // Second group - Details
      //   Header: "Details",
      //   // Second group columns
      //   columns: [
      //     {
      //       Header: "Language",
      //       accessor: "show.language"
      //     },
      //     {
      //       Header: "Genre(s)",
      //       accessor: "show.genres"
      //     },
      //     {
      //       Header: "Runtime",
      //       accessor: "show.runtime"
      //     },
      //     {
      //       Header: "Status",
      //       accessor: "show.status"
      //     }
      //   ]
      // }
    ],
    // eslint-disable-next-line
    []
  );

  //SNACKBAR State Variables
  const [open, setOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('Unknown Error')

  //SNACKBAR close method
  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  useEffect(() => {

    const fetchReferrals = async () => {
    setLoading(true)
 
    try {
      const currentUser = await Auth.currentAuthenticatedUser();
      const sub = currentUser.signInUserSession.idToken.payload.sub
      setId(sub)
      const {data} = await API.graphql(graphqlOperation(listReferrals, {
        filter: {
          referralRoostedAgentID: { eq: sub}, 
        },
        limit: 900000
      }))
      if(data.listReferrals.items.length > 0) {
        setReferrals(data.listReferrals.items)
        setShowTable(true)
      } else {
        setReferrals([{
          id: '',
          referralClient: {items: [{clientFirstName: '', clientLastName: ''}]},
          referralStatus: '',
          referralClientStatus: '',
          referralPartnerAgent: {items: [{userFirstName: '', userLastName: ''}]},
          referralAddress: {zip: ''}
        }])
      }
      setLoading(false)
    } catch(error) {
      console.log(error)
      setLoading(false)
      setErrorMessage('Failed to get prior referrals. Refresh the page or contact support@roosted.io')
      setOpen(true)
    }
  }
    fetchReferrals();
  }, []);

  return (
    <Page
      className={classes.root}
      title="Referrals Created"
    >
      <Snackbar open={open} onClose={handleClose} anchorOrigin={{vertical: 'top', horizontal: 'center' }}>
        <AlertFunk onClose={handleClose} severity="error">
          {errorMessage}
        </AlertFunk>
       </Snackbar>
      <Container
        maxWidth={false}
        className={classes.container}
      >
        {loading ? <LinearProgress/> : 
        showTable ?
        <React.Fragment>
          <Header history={props.history}/>
          <Results
            className={classes.results}
            data={referrals}
            columns={columns}
          />
        </React.Fragment> :
        <div>
          <Header history={props.history}/>
          <Card style={{marginTop: '1rem'}}>
            <Typography variant="h4" style={{padding: '3rem'}} align='center'>No Referrals Created</Typography>
          </Card>
        </div>}
      </Container>
    </Page>
  );
}

export default ReferralList;
