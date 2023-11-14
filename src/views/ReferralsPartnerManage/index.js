import React, { useEffect, useState, useMemo } from 'react';
import { makeStyles } from '@mui/styles';
import { Container, Typography, LinearProgress, Card, IconButton } from '@mui/material';
import Page from 'src/components/Page';
import Header from './Header';
import Results from './Referrals';
import { getReferralStatusStepsObject, getClientStatusStepsObject, getReferralStatusStepsObjectColor, getClientStatusStepsObjectColor } from '../../utils/utilities'
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import FileSaver from 'file-saver'
import DescriptionIcon from '@mui/icons-material/Description';
import { isMobile } from 'react-device-detect'

//IMPORT ALERT
import { Alert } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation, Storage } from "aws-amplify";
import { listReferrals } from "../../graphql/queries"

import Label from '../../components/Label'
import awsconfig from '../../aws-exports'

//SAGA IMPORTS
import { connect } from 'react-redux';
//import * as actions from '../../store/actions/index';

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
  const [showExpired, setShowExpired] = useState(false)
  const [id, setId] = useState('')

  Storage.configure(awsconfig)

  const fetchS3 = async (key) => {
    console.log(key)
    const pdf = await Storage.get(key, { level: 'public' })
    console.log(pdf)
    FileSaver.saveAs(pdf)
  }

  //Required to identify the headers for a table
  const columns = useMemo(
    () => [
      {
        Header: "Referrals Sent To You",
        columns: [
          {
            Header: "View Referral",
            Cell: localProps => {
              return (
                <>
                <IconButton
                  color='primary'
                  onClick={() => props.history.push(`/referrals/details/partner/${localProps.row.original.id}/referraldata?id=${id}`)}>
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
            Header: "Referred From",
            accessor: props => {return (props.referralRoostedAgent === undefined || props.referralRoostedAgent === null ? '' :  `${props.referralRoostedAgent.userLastName}, ${props.referralRoostedAgent.userFirstName}`)},
            Cell: props => {
              return (
                props.row.original.referralRoostedAgent === undefined || props.row.original.referralRoostedAgent === null ? '' :  <Typography>{props.row.original.referralRoostedAgent.userLastName}{`, ${props.row.original.referralRoostedAgent.userFirstName}`}</Typography>
              )
            }
          },
          {
            Header: "Zip Code",
            accessor: "referralAddress.zip"
          },
          {
            Header: "View Signed Agreement",
            Cell: props => {
              return (
                isMobile ? <Typography style={{marginRight: '0.5rem', marginLeft: '0.5rem'}}>Not Available on Mobile.</Typography> :
                props.row.original.referralContractPath === null || props.row.original.referralContractPath === undefined || props.row.original.referralContractPath === '' ? <Typography style={{marginRight: '0.5rem', marginLeft: '0.5rem'}}>Agreement not signed.</Typography> :
                <>
                <IconButton
                  color='primary'
                  onClick={() => fetchS3(props.row.original.referralContractPath)}>
                  <DescriptionIcon/>
                </IconButton>
                </>
              )
            }
          }
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

      let expired = false

      for(let i=0 ; i < props.globalUser.userPartnerLicenses.items.length ; i++ ) {
        if(props.globalUser.userPartnerLicenses.items[i].primaryLicense && (props.globalUser.userPartnerLicenses.items[i].licenseVerificationStatus !== 'verified' || (new Date(props.globalUser.userPartnerLicenses.items[i].licenseExpiration)).getTime() < (new Date()).getTime())) {
          setShowTable(false)
          setShowExpired(true)
          expired = true
          console.log('partner set disabled')
        }
      }

      if(!expired) {
        const currentUser = await Auth.currentAuthenticatedUser();
        const sub = currentUser.signInUserSession.idToken.payload.sub
        setId(sub)
        const {data} = await API.graphql(graphqlOperation(listReferrals, {
          filter: {
            referralPartnerAgentID: { eq: sub}, 
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
            referralRoostedAgent: {items: [{userFirstName: '', userLastName: ''}]},
            referralAddress: {zip: ''}
          }])
        }
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

  // eslint-disable-next-line 
  }, []);

  return (
    <Page
      className={classes.root}
      title="Referrals Received"
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
        showExpired ?
        <div>
        <Header history={props.history}/>
        <Card style={{marginTop: '1rem'}}>
          <Typography variant="h4" style={{padding: '3rem'}} align='center'>Your license is expired. To view referrals update it under "License Management".</Typography>
        </Card>
      </div> :
        <div>
          <Header history={props.history}/>
          <Card style={{marginTop: '1rem'}}>
            <Typography variant="h4" style={{padding: '3rem'}} align='center'>No Referrals Received</Typography>
          </Card>
        </div>}
      </Container>
    </Page>
  );
}

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
   };
};

export default connect(mapStateToProps, null)(ReferralList);
