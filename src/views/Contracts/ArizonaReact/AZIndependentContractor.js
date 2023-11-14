import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import GetAppIcon from '@mui/icons-material/GetApp';
import { PDFDocument } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit'
import FileSaver from 'file-saver'
import { dataUriToBuffer } from 'data-uri-to-buffer';
import moment from 'moment'

//IMPORT STYLES
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';
import { Box, CircularProgress } from '@mui/material';

//MATERIAL-UI IMPORTS
import {
  Grid,
  colors,
  Card,
  CardContent,
  Typography,
  Divider,
  Button

} from '@mui/material';

//PACKAGE IMPORTS
import SignaturePad from 'react-signature-pad-wrapper';
import { isMobile } from 'react-device-detect';
import awsconfig from "../../../aws-exports";

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation, Storage } from "aws-amplify";
import { updateRoostedLicense, updateUser } from "../../../graphql/mutations"
import { getUser, getRoostedLicense } from "../../../graphql/queries"

const useStyles = makeStyles(theme => ({
  root: {},
  content: {
    padding: isMobile ? theme.spacing(2) : theme.spacing(6)
  },
  marginTop: {
    marginTop: theme.spacing(4)
  },
  dates: {
    padding: theme.spacing(2),
    backgroundColor: colors.grey[100]
  },
  firstParagraph: {
    marginTop: theme.spacing(3)
  },
  signatureBlock: {
    marginTop: theme.spacing(1),
    maxWidth: 960,
    borderWidth: 2, 
    borderColor: '#D3D3D3',
    borderRadius: '5px'

  }, 
  signatureBlockMobile: {
    marginTop: theme.spacing(1),
    maxWidth: 960,
    marginLeft: isMobile ? theme.spacing(-1) : theme.spacing(-5),
    marginRight: isMobile ? theme.spacing(-1) : theme.spacing(-5),
  }, 
  roostedSignatureBlock: {
    marginTop: theme.spacing(4),
    maxWidth: 200,
    paddingLeft: theme.spacing(4),
    marginBottom: theme.spacing(-4)
  }, 
  buttons: {
    margin: theme.spacing(1)
  }
}));

const AZICA = props => {
  const { 
    className, 
    globalUser,
    userSetUser,
    licenseNumber,
    licenseSetLicenseNumber,
    scenario,
    history,
    dataCollected,
    setDataCollected,
    ...rest } = props;

  const classes = useStyles();

  let signaturePad = {};

  const sigProps = {
    borderColor: '#D3D3D3',
    border: 1,
  };

  const clearSignature = () => {
    signaturePad.clear()
    setDataCollected.setOpen(false)
  }

  const [pdf, setPdf] = useState(null)
  const [showAccept, setShowAccept] = useState(true) 

  const [license, setLicense] = useState({})
  const [planName, setPlanName] = useState('')
  const [paymentPeriod, setPaymentPeriod] = useState('')

  Storage.configure(awsconfig)

  useEffect(() => {
  
    if(licenseNumber === '' && scenario === 'addingNewLicense') {
      history.push('/license/create?type=roosted')
    }

    if((dataCollected.newPlan === '' && scenario === 'changingPlan') || (dataCollected.state === '' && scenario === 'changingPlan')) {
      history.push('/settings/billing')
    }

    const fetchLicense = async () => {
      try {
        dataCollected.setLoading(true)
        // const currentUser = await Auth.currentAuthenticatedUser();
        // const sub = currentUser.signInUserSession.idToken.payload.sub
        const {data} = await API.graphql(graphqlOperation(getRoostedLicense, {id: licenseNumber}))
        setLicense(data.getRoostedLicense)
        setDataCollected.setLoading(false)
      } catch(error) {
        console.log(error)
        setDataCollected.setLoading(false)
        setDataCollected.setErrorMessage('Failed to get licenses. Refresh the page or contact support@roosted.io')
        setDataCollected.setOpen(true)
      }
    }

    if(scenario === 'changingPlan') {
      if(dataCollected.newPlan === 'nestMonthly') {
        setPlanName('nest')
        setPaymentPeriod('monthly')
      } else if(dataCollected.newPlan === 'nestAnnual') {
        setPlanName('nest')
        setPaymentPeriod('annual')
      } else if(dataCollected.newPlan === 'perchMonthly') {
        setPlanName('perch')
        setPaymentPeriod('monthly')
      } else if(dataCollected.newPlan === 'perchAnnual') {
        setPlanName('perch')
        setPaymentPeriod('annual')
      } else if(dataCollected.newPlan === 'flightMonthly') {
        setPlanName('flight')
        setPaymentPeriod('monthly')
      } else if(dataCollected.newPlan === 'flightAnnual') {
        setPlanName('flight')
        setPaymentPeriod('annual')
      }
    }

    if(licenseNumber !== '' && scenario === 'addingNewLicense') {
      fetchLicense()
    }

  // eslint-disable-next-line 
  }, [])

  const saveSignatureSetup = async () => {
    if(signaturePad.isEmpty()) { //DO A SNACK BAR
      setDataCollected.setErrorMessage('A signature is required.')
      setDataCollected.setOpen(true)
    } else {

      //convert signature to data URL then convert it to a data buffer that the PDF-Lib can save into the PDF template
      const signatureURL = signaturePad.toDataURL()
      const dataBuffer = dataUriToBuffer (signatureURL)
      
      try {
        setDataCollected.setLoading(true)

        console.log(Storage)
        /////////START PDF GENERATION
        const url = scenario === 'addingNewLicense' ? 
          await Storage.get(`contract-templates/${license.licenseState}IndependentContractorAgreement.pdf`, { level: 'public' }) :
          scenario === 'changingPlan' ? await Storage.get(`contract-templates/${dataCollected.currentState}IndependentContractorAgreement.pdf`) :
          await Storage.get(`contract-templates/${globalUser.userRoostedLicenses.items[0].licenseState}IndependentContractorAgreement.pdf`, { level: 'public' })
        console.log(url)
        //const url = `/pdfs/${globalUser.userRoostedLicenses.items[0].licenseState}IndependentContractorAgreement.pdf`
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
        
        //Add Roboto as custom font
        const fontUrl = '/fonts/Roboto-Medium.ttf'
        const fontBytes = await fetch(fontUrl).then(res => res.arrayBuffer())

        //Load the existing PDF template
        const pdfDoc = await PDFDocument.load(existingPdfBytes)

        //Add the customer font kit to the pdfDoc and then add roboto font
        pdfDoc.registerFontkit(fontkit)
        const robotoFont = await pdfDoc.embedFont(fontBytes)
        
        //Scale PNG by 18%
        const pngImage = await pdfDoc.embedPng(dataBuffer)

        //Get total pages
        const pages = pdfDoc.getPages()

        //Get pages
        const firstPage = pages[0]
        const plansPage = pages[2]
        const signaturePage = pages[4]

        //Add user's name to the first page
        firstPage.drawText(`${globalUser.userFirstName} ${globalUser.userLastName}`, {
          x: 37,
          y: 665,
          size: 11,
          font: robotoFont,
        })

        //Add date to the first page
        firstPage.drawText(moment(new Date()).format('LL'), {
          x: 351,
          y: 677,
          size: 11,
          font: robotoFont,
        })

        //Add plan selected to the ICA
        if(scenario === 'changingPlan') {
          if(dataCollected.newPlan === 'nestMonthly') {
            plansPage.drawText('X', {
              x: 93,
              y: 429,
              size: 11,
              font: robotoFont,
            })
          } else if(dataCollected.newPlan === 'nestMonthly') {
            plansPage.drawText('X', {
              x: 93,
              y: 429,
              size: 11,
              font: robotoFont,
            })
          } else if(dataCollected.newPlan === 'perchMonthly') {
            plansPage.drawText('X', {
              x: 92,
              y: 418,
              size: 11,
              font: robotoFont,
            })
          } else if(dataCollected.newPlan === 'perchAnnual') {
            plansPage.drawText('X', {
              x: 93,
              y: 394,
              size: 11,
              font: robotoFont,
            })
          } else if(dataCollected.newPlan === 'flightMonthly') {
            plansPage.drawText('X', {
              x: 93,
              y: 370,
              size: 11,
              font: robotoFont,
            })
          } else if(dataCollected.newPlan === 'flightAnnual') {
            plansPage.drawText('X', {
              x: 93,
              y: 346,
              size: 11,
              font: robotoFont,
            })
          }
        } else {
          if(globalUser.roostedAgent.stripeProductName === 'nest') {
            plansPage.drawText('X', {
              x: 93,
              y: 429,
              size: 11,
              font: robotoFont,
            })
          } else if(globalUser.roostedAgent.stripeProductName === 'perch' && globalUser.roostedAgent.stripeProductPeriod === 'monthly') {
            plansPage.drawText('X', {
              x: 92,
              y: 418,
              size: 11,
              font: robotoFont,
            })
          } else if(globalUser.roostedAgent.stripeProductName === 'perch' && globalUser.roostedAgent.stripeProductPeriod === 'annual') {
            plansPage.drawText('X', {
              x: 93,
              y: 394,
              size: 11,
              font: robotoFont,
            })
          } else if(globalUser.roostedAgent.stripeProductName === 'flight' && globalUser.roostedAgent.stripeProductPeriod === 'monthly') {
            plansPage.drawText('X', {
              x: 93,
              y: 370,
              size: 11,
              font: robotoFont,
            })
          } else if(globalUser.roostedAgent.stripeProductName === 'flight' && globalUser.roostedAgent.stripeProductPeriod === 'annual') {
            plansPage.drawText('X', {
              x: 93,
              y: 346,
              size: 11,
              font: robotoFont,
            })
          }
        }

        //Draw agent signature
        signaturePage.drawImage(pngImage, {
          x: 95,
          y: 220,
          width: 150,
          height: 75,
        })

        //Add the users name below the signature box
        signaturePage.drawText(` - ${globalUser.userFirstName} ${globalUser.userLastName}`, {
          x: 70,
          y: 206,
          size: 11,
          font: robotoFont,
        })

        //Add the date to the independent contractor agreement under the signature
        signaturePage.drawText(moment(new Date()).format('LL'), {
          x: 72,
          y: 194,
          size: 11,
          font: robotoFont,
        })

        //Add the users email below the signature box
        signaturePage.drawText(globalUser.email, {
          x: 72,
          y: 182,
          size: 11,
          font: robotoFont,
        })

        //Add the date to the independent contractor agreement for the broker
        signaturePage.drawText(moment(new Date()).format('LL'), {
          x: 358,
          y: 195,
          size: 11,
          font: robotoFont,
        })

        //Create PDF and it returns and Unit8Array
        const signedPDF = await pdfDoc.save()

        //Conver the Unit8Array to a new blob that can be used to store on S3
        const pdfBlob = new Blob([signedPDF], { type: 'application/pdf' })

        //User this for FilerSaver to download the PDF with a download button
        const pdfUrl = URL.createObjectURL(pdfBlob);

        //Set URL to state variable that can be called by FilerSaver later to download the PDF
        setPdf(pdfUrl)

        //Save a variable with the file name using the agents state, name, and date
        const fileName = scenario === 'addingNewLicense' ? 
          license.licenseState + '_ICA_' + globalUser.userLastName + '_' + globalUser.userFirstName + '_' + globalUser.id + `_${moment(new Date()).format('YYYYMMDD')}.pdf` :
          scenario === 'changingPlan' ? dataCollected.currentState + '_ICA_' + globalUser.userLastName + '_' + globalUser.userFirstName + '_' + globalUser.id + `_${moment(new Date()).format('YYYYMMDD')}.pdf` :
          globalUser.userRoostedLicenses.items[0].licenseState + '_ICA_' + globalUser.userLastName + '_' + globalUser.userFirstName + '_' + globalUser.id + `_${moment(new Date()).format('YYYYMMDD')}.pdf`
        
        //Puts the document in S3 and gets the AWS S3 key to save into Dynamodb
        const awsKey = await Storage.put(fileName, pdfBlob, 'public', {type: "application/pdf"})

        //get license number when changing plan
        let licenseId = ''
        for(let i=0 ; i < globalUser.userRoostedLicenses.items.length ; i++) {
          if(globalUser.userRoostedLicenses.items[i].licenseState === dataCollected.currentState) {
            licenseId = globalUser.userRoostedLicenses.items[i].id
          }
        }

        //Add the AWS key to dynamodb license to recall it later
        const params = {
          id: scenario === 'addingNewLicense' ? licenseNumber : scenario === 'changingPlan' ? licenseId : globalUser.userRoostedLicenses.items[0].id,
          licenseICAPath: awsKey.key,
          licenseVerificationStatus: 'waitingOnTransfer'
        }
        await API.graphql(graphqlOperation(updateRoostedLicense, {input: params}))
    

        ////////END PDF GENERATION

        //If changing plans, I need to then charge them on stripe
        let changeSubscription = {}
        let updatedRoostedAgent = {...globalUser.roostedAgent}
        if(scenario === 'changingPlan') {
          let custom = { 
            headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
            body: { 
              stripeSubscriptionId: globalUser.roostedAgent.stripeSubscriptionId,
              planName: planName,
              paymentPeriod: paymentPeriod,
              planState: dataCollected.currentState,
            }
          }
   
          changeSubscription = await API.post(
            'roostedRestAPI', 
            '/stripe/change-subscription',
            custom 
          )

          updatedRoostedAgent.stripeProductId = changeSubscription.subscription.items.data[0].plan.id
          updatedRoostedAgent.stripeProductName = planName
          updatedRoostedAgent.stripeProductPeriod = paymentPeriod
        
        }

  

        //Update the user and return the updated user then set it as the global user
        const currentUser = await Auth.currentAuthenticatedUser();
        const sub = currentUser.signInUserSession.idToken.payload.sub
        const {data} = scenario === 'addingNewLicense' ? await API.graphql(graphqlOperation(getUser, {id: sub})) :
          scenario === 'changingPlan' ? await API.graphql(graphqlOperation(updateUser, {input: {id: sub, roostedAgent: updatedRoostedAgent}})) :
          await API.graphql(graphqlOperation(updateUser, {input: {id: sub, setupStatus: 'transferLicense'}}))
        userSetUser(scenario === 'addingNewLicense' ? data.getUser : data.updateUser)

        //Display the new set of buttons with option to download the document or continue to the next step
        setShowAccept(false)
        setDataCollected.setOpen(false)
        setDataCollected.setLoading(false)
      } catch(error) {
        console.log(error)
        setDataCollected.setLoading(false)
        setDataCollected.setErrorMessage('An error occured saving your signature. Try again or email support@roosted.io')
        setDataCollected.setOpen(true)
      }

      try {
      if(scenario !== 'addingNewLicense' && scenario !== 'changingPlan') {
        ////MAILCHIMP UPDATE/////
        //Mark as payment completed and take off abandon cart

        let custom3 = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            action: 'ICASigned',
            emailData: {
              EMAIL: globalUser.email,
              FNAME: '',
              LNAME: '',
              PHONE: '',
              STATE: '',
              BROKER: '',
              EXPIRATION: ''
            }
          }
        }
        console.log(custom3)
        const mailChimpResponse = await API.post(
          'roostedRestAPI', 
          '/mailchimp/execute-update',
          custom3
        )
        console.log(mailChimpResponse)

        ////MAILCHIMP UPDATE/////
      }
      }catch(error) {
        console.log(error)
      }
    }
  }
  return ( 
    <Card
      {...rest}
      className={clsx(classes.root, className)}
      style={{marginTop: '1rem'}}
    >
      <CardContent className={classes.content}>
      {globalUser.userFirstName !== undefined && globalUser.userFirstName !== null ?
        <Grid
          container
          justify="space-between"
          alignItems='center'
        >
          <Grid item align={isMobile ? 'center' : ''}>
            <Typography
              component="h3"
              variant="h3"
            >
              Independent Contractor Agreement
            </Typography>
          </Grid>
          <Grid item>
            <div style={isMobile ? {marginTop: '3em'} : {}}>
              <img
                alt="Brand"
                src="/images/logos/roosted_horizontal.png"
                width='150'
              />
            </div>
          </Grid>
          <Grid container spacing={2}>
            <Grid item>
              <Typography variant='body1' paragraph className={classes.firstParagraph}>
                {`This Independent Contractor Agreement ("Agreement") is made on ${moment(new Date()).format('LL')} ("Effective Date"), by and between ${globalUser.userFirstName} ${globalUser.userLastName}, hereinafter referred to as "LICENSEE", and ROOSTED AZ, LLC, hereinafter referred to as "Roosted".`} 
              </Typography>
              <Typography variant='body1' paragraph>
                <b>WHEREAS</b> ROOSTED is an independently owned and operated is operating as a real estate brokerage business in Arizona; and
              </Typography>
              <Typography variant='body1' paragraph>
                <b>WHEREAS</b> LICENSEE has been issued a real estate (Salesperson’s/Broker’s) license by this state and is desirous of receiving the services, facilities, programs, and opportunities offered by ROOSTED;
              </Typography>
              <Typography variant='body1' paragraph>
                <b>NOW THEREFORE</b> , in consideration of the promises and mutual covenants contained in this Agreement, it is agreed as follows:
              </Typography>
              <ol type='1'style={{fontFamily: 'Roboto', paddingLeft: isMobile ? '1em' : '2em'}}>
                <li>
                  <Typography variant='h5'>
                    BROKER
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        ROOSTED represents that Broker is duly licensed as a real estate broker by the State of Arizona, doing business as ROOSTED, LLC. Broker shall keep Broker’s license current during the term of this Agreement.
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    INDEPENDENT CONTRACTOR STATUS:
                  </Typography>
                  <ul type="none">
                    <li >
                      <Typography variant='body1' paragraph>
                        LICENSEE is retained by ROOSTED as an independent contractor. The LICENSEE shall devote to ROOSTED such portion of Representative’s time, energy, effort and skill as Representative sees fit and to establish Representative’s own endeavors. The LICENSEE shall not have mandatory duties or responsibilities except those required by state law and those specifically outlined in this Agreement. Nothing contained in this Agreement shall be regarded as creating any relationship such as joint venture, partnership or shareholder between ROOSTED and LICENSEE. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE acknowledges that as an independent contractor (non-employee) affiliated with ROOSTED, LICENSEE is responsible for the payment of all LICENSEE’S own federal income taxes and LICENSEE’S own self-employment taxes (FICA) together with any and all corresponding state, county and local taxes, if any, and LICENSEE hereby agrees to meet such responsibilities. LICENSEE hereby waives any claims LICENSEE has or may have against ROOSTED now or in the future respecting such taxes or the right of ROOSTED to withhold, pay or contribute to such taxes on behalf of LICENSEE. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE acknowledges that as an independent contractor with ROOSTED, LICENSEE agrees to the following: They have not been required by ROOSTED to maintain any specific schedule nor to attend any mandatory sales or training meetings. They have not been required by ROOSTED to maintain any specific schedule or set hours nor to attend any mandatory sales or training meetings. They do not have to have permission of the broker to schedule vacations. They have received no minimum salary or sick pay. They have paid and will pay all future income and FICA taxes owed. Their association with ROOSTED may be terminated by either party upon notice given to the other; but the rights of the parties to any fees which accrued prior to said notice shall not be divested deemed satisfied by the termination of this arrangement. They shall not be treated as an employee with respect to the services performed hereunder for state or federal tax purposes. All costs incurred by the agent in conducting their independent business shall be at their sole discretion and expense without reimbursement from ROOSTED at any point in time. ROOSTED has been and is fully committed to equal employment and contract opportunity, both in principle and as a matter of policy. ROOSTED. employment policies and practices require that we provide equal opportunity to all applicants, independent contractors and employees, without regard to race, color, religion, sex, or national origin and in full accordance with state and national polices pertaining to age.
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    RESPONSIBILITIES
                  </Typography>
                  <ol type="a" style={{paddingLeft: isMobile ? '1em' : '2em'}}>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE shall make referrals of people interested in buying or selling real estate and shall refer them to a real estate agent that conducts transactions. LICENSEE agrees that any and all referrals shall be made in the name of ROOSTED. The referrals shall be submitted by LICENSEE to ROOSTED immediately, and shall become and remain the exclusive property of ROOSTED.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE shall assure that all fees earned in connection with the referral and any interest therein are made payable to ROOSTED.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE shall be responsible for all his or her personal expenses, included but not limited to automobile, travel, disability insurance and other insurance, entertainment, food, lodging, license fees and dues, all income taxes, self-employment taxes, which result or may result from being licensed, engaged in the real estate business and/or associated with ROOSTED.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE shall comply with all laws, rules and regulations relating to real estate brokerages and licensed agents.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE need only devote such portion of their time and energy as LICENSEE deems appropriate to the furtherance of LICENSEE’s real estate career. However, the amount of time and energy so expended by the LICENSEE shall not alter or in any way reduce the fees and/or charges for costs and expenses to be paid to ROOSTED pursuant to the terms of this Agreement.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE shall abide by the quality controls and safeguards established or enacted by ROOSTED. LICENSEE agrees to do everything possible and required to protect and maintain the highest ethical standards in the conduct of LICENSEE’s real estate business. The LICENSEE shall provide dependable, efficient, courteous, high quality and professional real estate services to the public, of the same high quality and integrity as other brokers and LICENSEES affiliated with ROOSTED. In this regard, LICENSEE further agrees to strictly observe the most current operating procedures established by ROOSTED in the ROOSTED POLICY AND PROCEDURES MANUAL. The LICENSEE acknowledges that LICENSEE’s agreement to adhere to such procedures and policy directives is a material consideration for the execution of this Agreement by ROOSTED. ROOSTED’s Policies and Procedures Manual is attached hereto as EXHIBIT 1 to this agreement.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        At all times, LICENSEE shall act under a duty of loyalty in support and in furtherance of ROOSTED and shall maintain a proper attitude toward the public, ROOSTED and other ROOSTED LICENSEES. LICENSEE shall not engage in any acts or activities that may disrupt or discredit the ROOSTED, its operations or Representative’s office, or that may detract from or tend to undermine the growth of ROOSTED, including without limitation any acts in furtherance of non-ROOSTED real estate business or the establishment of, or the taking of, an investment or ownership interest in a non-ROOSTED real estate business or real estate related activities, including without limitation mortgage, insurance operations, or the recruiting of any ROOSTED LICENSEES for any existing or future non-ROOSTED real estate business which does or may compete with ROOSTED.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        The LICENSEE shall maintain a valid real estate broker’s or sales license under state law.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        ROOSTED is not a member of the National Association of REALTORS® or any local Multiple Listing Service (MLS). 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE shall follow all procedures and use all disclosure statements, business contracts and other forms prescribed by ROOSTED as part of any program to effect loss control or claims avoidance or reduce insurance premiums.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE shall not use their vehicle for any purposes relating to their work as a ROOSTED agent. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        All checks or cash received by LICENSEE relating, directly or indirectly, to LICENSEE’s responsibilities under this Agreement shall immediately be turned over and delivered to ROOSTED and LICENSEE shall, in no circumstances, endorse or negotiate on behalf of ROOSTED, any such check or instrument. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE shall abide by all national, state and local laws governing real estate transactions.
                      </Typography>
                    </li>
                  </ol>
                </li>  
                <li>
                  <Typography variant='h5'>
                  PROHIBITIED ACTIONS:
                  </Typography>
                  <ol type="a" style={{fontWeight: 'bold', paddingLeft: isMobile ? '1em' : '2em'}}>
                    <li>
                      <Typography variant='body1' paragraph>
                        <b>
                          LICENSEE ACKNOWLEDGES THAT ROOSTED IS A REFERRAL ONLY BROKERAGE. LICENSEE IS NOT ALLOWED TO REPRESENT ANYONE IN A REAL ESTATE TRANSACTION AND MAY ONLY MAKE REFERRALS. LICENSEE IS ONLY ALLOWED TO DISCUSS WITH THE PUBLIC THEIR LEVEL OF INTEREST IN BUYING OR SELLING REAL ESTATE AND MAY NOT OFFER ADVICE ON HOME VALUES, CONTRACT QUESTIONS, ADVICE PERTAINING TO A TRANSACTION, OR ANY OTHER INFORMATION THAT MAY ESTABLISH AN AGENCY RELATIONSHIP.
                        </b>
                      </Typography>
                    </li>
                  </ol>
                </li>
                <li>
                  <Typography variant='h5'>
                    RECURRING FEES/BILLING:
                  </Typography>
                  <ol type="a" style={{paddingLeft: isMobile ? '1em' : '2em'}}>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE shall select the monthly plan/compensation model they so choose. ROOSTED will charge LICENSEE for any monthly fees on the monthly anniversary date of LICENSEE joining ROOSTED or annual anniversary date of the LICENSEE switching their plan or joining ROOSTED.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE can upgrade to a higher cost plan at any time through the ROOSTED system. Any changes to the monthly plan will take effect at their next billing cycle. When the LICENSEE switches to a plan that is less expensive than fees they have already paid for a period, the prior payments will act as a credit towards future payments until all credits have been offset by required payments.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        If LICENSEE wishes to downgrade to a lower cost plan, they can do so provided they have been at their current plan for three (3) months. If LICENSEE has been on current plan for less than three (3) months, the change will occur at the next billing cycle after the three (3) month period has elapsed. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE billing information will be stored by a third-party software provider. ROOSTED does not retain credit card or billing info for licensees. Third party software providers chosen for this purpose are up to current standards for PCI DSS (Payment Company Industry Data Security Standards). 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE authorizes ROOSTED to charge the credit card on file for the fees agreed to.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        In the event that payment for monthly fees is declined, ROOSTED will notify LICENSEE through email. LICENSEE is responsible for all monthly fees accrued and is responsible for updating their billing info through the ROOSTED system.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        In the event that LICENSEE is more than thirty (30) days behind on fees, ROOSTED can at their sole discretion change the LICENSEE’S plan to a no cost option. If ROOSTED changes the licensees plan due to non-payment, ROOSTED will notify LICENSEE.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        If LICNESEE is behind on payments to ROOSTED and is owed a referral fee, ROOSTED is entitled to deduct the past due fees from the compensation owed to LICENSEE.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE acknowledges that no refunds will be made for fees paid to ROOSTED. In the event that the LICENSEE or ROOSTED chooses to terminate this agreement, no proration of fees paid or refunds will be made. This includes any monthly or annual fees paid to ROOSTED.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        In the event that the LICENSEE has elected to pay ROOSTED for a plan on an annual basis. LICENSEE acknowledges that on the annual anniversary date LICENSEE will be billed for another year at their current plan.
                      </Typography>
                    </li>
                  </ol>
                </li> 
                <li>
                  <Typography variant='h5'>
                    ROOSTED PLANS:
                  </Typography>
                  <ol type="a" style={{paddingLeft: isMobile ? '1em' : '2em'}}>
                    <li>
                      <Typography variant='body1' paragraph>
                        ROOSTED reserves the right to change or modify these plans in anyway at any time with Thirty (30) days notice to LICENSEE.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE has selected the monthly plan indicated below and agrees to pay the fees associated with selected plan.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE agrees to receive the indicated percentage of referral fee income that is generated by LICENSEES referrals.
                      </Typography>
                    </li>
                  </ol>
                  {scenario === 'changingPlan' ? 
                  <ul type='none' style={{paddingLeft: isMobile ? '1em' : '2em'}}>

                    <li>
                      <Typography variant='body1' paragraph>
                      {`[ ${dataCollected.newPlan === 'nestMonthly' || dataCollected.newPlan === 'nestAnnual' ? 'X' : ' '} ] - BASIC – No Monthly Fee, all referral fees generated will be split 50% to LICENSEE and 50% to ROOSTED.`}
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                      {`[ ${dataCollected.newPlan === 'perchMonthly' ? 'X' : ' '} ] - BASIC – MID TIER (MONTHLY) - $9 per month fee, all referral fees generated will be split 70% to LICENSEE and 30% to ROOSTED.`}
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                      {`[ ${dataCollected.newPlan === 'perchAnnual' ? 'X' : ' '} ] - MID TIER (ANNUAL) - $72 per year fee, all referral fees generated will be split 70% to LICENSEE and 30% to ROOSTED.`}
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                      {`[ ${dataCollected.newePlan === 'flightMonthly' ? 'X' : ' '} ] - TOP TIER (MONTHLY) - $19 per month fee, all referral fees generated will be split 90% to LICENSEE and 10% to ROOSTED.`}
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                      {`[ ${dataCollected.newPlan === 'flightAnnual' ? 'X' : ' '} ] – TOP TIER (ANNUAL) - $144 per year fee, all referral fees generated will be split 90% to LICENSEE and 10% to ROOSTED.`}
                      </Typography>
                    </li>
                  </ul> :
                   <ul type='none' style={{paddingLeft: isMobile ? '1em' : '2em'}}>
                   <li>
                     <Typography variant='body1' paragraph>
                     {`[ ${globalUser.roostedAgent.stripeProductName === 'nest' ? 'X' : ' '} ] - BASIC – No Monthly Fee, all referral fees generated will be split 50% to LICENSEE and 50% to ROOSTED.`}
                     </Typography>
                   </li>
                   <li>
                     <Typography variant='body1' paragraph>
                     {`[ ${globalUser.roostedAgent.stripeProductName === 'perch' && globalUser.roostedAgent.stripeProductPeriod === 'monthly' ? 'X' : ' '} ] - BASIC – MID TIER (MONTHLY) - $9 per month fee, all referral fees generated will be split 70% to LICENSEE and 30% to ROOSTED.`}
                     </Typography>
                   </li>
                   <li>
                     <Typography variant='body1' paragraph>
                     {`[ ${globalUser.roostedAgent.stripeProductName === 'perch' && globalUser.roostedAgent.stripeProductPeriod === 'annual' ? 'X' : ' '} ] - MID TIER (ANNUAL) - $72 per year fee, all referral fees generated will be split 70% to LICENSEE and 30% to ROOSTED.`}
                     </Typography>
                   </li>
                   <li>
                     <Typography variant='body1' paragraph>
                     {`[ ${globalUser.roostedAgent.stripeProductName === 'flight' && globalUser.roostedAgent.stripeProductPeriod === 'monthly' ? 'X' : ' '} ] - TOP TIER (MONTHLY) - $19 per month fee, all referral fees generated will be split 90% to LICENSEE and 10% to ROOSTED.`}
                     </Typography>
                   </li>
                   <li>
                     <Typography variant='body1' paragraph>
                     {`[ ${globalUser.roostedAgent.stripeProductName === 'flight' && globalUser.roostedAgent.stripeProductPeriod === 'annual' ? 'X' : ' '} ] – TOP TIER (ANNUAL) - $144 per year fee, all referral fees generated will be split 90% to LICENSEE and 10% to ROOSTED.`}
                     </Typography>
                   </li>
                 </ul> }
                </li>
                <li>
                  <Typography variant='h5'>
                    REMUNERATION:
                  </Typography>
                  <ol type="a" style={{paddingLeft: isMobile ? '1em' : '2em'}}>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEES will be paid at the rate indicated in Section 5 of this agreement. LICENSEE hereby irrevocably directs ROOSTED to deduct from any commissions payable to the LICENSEE, the amount of any indebtedness owed to ROOSTED as outlined in this Agreement.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        ROOSTED hereby declares that any monies received from as a result of referrals made by LICENSEE shall be made payable to ROOSTED and ROOSTED shall disperse the monies owed to the LICENSEE in a timely fashion. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        ROOSTED shall not pledge any portion of the Referral Funds held on behalf of the LICENSEE as collateral for any loan or use said amount for any other personal or corporate reason without the express written consent of the LICENSEE. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        ROOSTED is not responsible for tracking referrals made by LICENSEE or responsible for referral fees that are unpaid by the agent receiving the referral.
                      </Typography>
                    </li>
                  </ol>
                </li>  
                <li>
                  <Typography variant='h5'>
                    TERMINATION:
                  </Typography>
                  <ol type="a" style={{paddingLeft: isMobile ? '1em' : '2em'}}>
                    <li>
                      <Typography variant='body1' paragraph>
                        Except as otherwise provided, the term of Agreement shall be for a period of one (1) year from the date first written above. The Agreement will be automatically renewed for further periods of one (1) year unless terminated in writing by one party or another at least thirty (30) days before the end of the term in effect. Upon renewal a Renewal Form shall be completed by both parties. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Either party may terminate this Agreement without cause on giving not less than thirty (30) days written notice to the other party.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        If LICENSEE fails to conduct LICENSEE’s business in accordance with the terms of this Agreement, this will be considered reasonable cause for ROOSTED to terminate this Agreement immediately.
                      </Typography>
                    </li>
                  </ol>
                </li>  
                <li>
                  <Typography variant='h5'>
                    LIABILITY AND INDEMNIFICATION:
                  </Typography>
                  <ol type="a" style={{paddingLeft: isMobile ? '1em' : '2em'}}>
                    <li>
                      <Typography variant='body1' paragraph>
                        ROOSTED shall not be liable to LICENSEE for any expenses incurred by LICENSEE, nor shall LICENSEE have authority to bind ROOSTED by any promise or representation, unless specifically authorized in advance and in writing by ROOSTED. From time to time, claims, complaints or litigation involving ROOSTED and/or its officers may arise directly from the activities of LICENSEE. In such cases, LICENSEE agrees to pay all damages, costs and expenses, including but not limited to the full amount of any errors and omissions insurance deductible assessed against or incurred by ROOSTED and/or its officers in defending or satisfying any claim or judgment against ROOSTED and/or its officers because of LICENSEE’s activities, even if such claim or judgment is brought or filed subsequent to the expiration or termination of this Agreement. Further, LICENSEE agrees to pay all reasonable attorneys’ fees, costs and any other out-of-pocket expenses incurred by ROOSTED or its officers that arise from LICENSEE’s activities. ROOSTED agrees to work closely with LICENSEE to keep such expenses at a minimum, but ROOSTED and its officers reserve the right to select the attorneys and reserve the right to settle or defend any such complaint, claim or litigation in any manner or on any terms ROOSTED, in its sole discretion, deems appropriate. LICENSEE shall indemnify and hold harmless ROOSTED and its officers from all settlement costs, damages, fines, levies, suits, proceedings, claims, actions or causes of action of any kind and of whatsoever nature, including but not limited to all costs, court costs, litigation expenses and reasonable attorney(s)’ fees arising from, growing out of, or incurred in connection with or incidental to LICENSEE’s activities in real estate. Maintenance of any insurance required by this Agreement shall not relieve LICENSEE of liability under this section.
                      </Typography>
                    </li>
                  </ol>
                </li>
                <li>
                  <Typography variant='h5'>
                    DISPUTE RESOLUTION:
                  </Typography>
                  <ol type="a" style={{paddingLeft: isMobile ? '1em' : '2em'}}>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE shall promptly report to the duly designated broker or broker’s representative (Broker or office manager or other person designated by ROOSTED to field such potential claims) all problems, complaints and other circumstances which may lead to claims, disputes or controversies. LICENSEE agrees that any failure on his or her part to promptly report such problems, complaints or other circumstances, or any failure to cooperate fully with ROOSTED in satisfaction of this section, shall be grounds for termination by ROOSTED, immediately and without prior notice, of this Agreement. In the event of termination of this agreement, ROOSTED shall have the right, in addition to other remedies it may have against LICENSEE, to withhold commissions due or that become due LICENSEE, to offset the costs, attorneys’ fees and liability, if any, assessed against ROOSTED as a result of any problem, complaint or circumstance that was not timely reported.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE shall cooperate with ROOSTED by supporting and fully participating in all efforts to resolve any problem or complaint through mediation and/or arbitration.
                      </Typography>
                    </li>
                  </ol>
                </li>
                <li>
                  <Typography variant='h5'>
                    RESTRICTIONS ON SUBSEQUENT BUSINESS ACTIVITIES:
                  </Typography>
                  <ol type="a" style={{paddingLeft: isMobile ? '1em' : '2em'}}>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE shall not, after the termination or expiration of this Agreement, for any reason use, permit, suffer or tolerate the use, to his or her own advantage or the advantage of others, of any information gained from the files or business of ROOSTED. LICENSEE further agrees that the sales plans, programs, materials, manuals, rosters, forms, contracts, agreements, brochures and other training, listing and sales materials provided hereunder by ROOSTED irrespective of the origin or ultimate source, are and shall remain the exclusive property of ROOSTED. LICENSEE shall not utilize or divulge such materials in connection with any business hereafter carried on by LICENSEE, whether alone or in conjunction with others. All such materials shall be returned promptly to ROOSTED upon termination or expiration of this Agreement. Following termination or expiration of this Agreement, LICENSEE shall be free to continue in real estate with competing real estate operations or to establish his or her own brokerage operation, alone or in concert with others. LICENSEE agrees to refrain from all representations, advertisements, actions and business activities that may mislead others in the real estate business and/or the public to believe he or she is still part of, affiliated with or sponsored in some way by ROOSTED if such is not the case. LICENSEE shall not adopt or use in connection with, or in the name of, any subsequent real estate business the term ROOSTED or any term confusingly similar to such term or any other term which may have the effect of creating confusion or question regarding his affiliation with ROOSTED
                      </Typography>
                    </li>
                  </ol>
                </li>
                <li>
                  <Typography variant='h5'>
                    MISCELLANEOUS PROVISIONS:
                  </Typography>
                  <ol type="a" style={{paddingLeft: isMobile ? '1em' : '2em'}}>
                    <li>
                      <Typography variant='body1' paragraph>
                        If ROOSTED is required to employ an attorney to enforce any of the provisions of this Agreement, or to institute legal proceedings incident to such enforcement, LICENSEE covenants and agrees to pay, in addition to all other sums to which LICENSEE may be found liable, reasonable attorneys’ fees, court costs and litigation expenses incurred by ROOSTED.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        All payments and communications which may be or are required to be given by LICENSEE or ROOSTED to the other of them, shall (in the absence of any specific provision to the contrary) be in writing and delivered to LICENSEE or ROOSTED at the principal address of ROOSTED, provided, in the case of LICENSEE, ROOSTED may instead if it deems it appropriate, deliver or mail the same by prepaid first class mail to the last home address of such LICENSEE appearing in the records of ROOSTED. Any payment or communication so delivered shall be conclusively deemed to have been received at the time of delivery or mailing, as the case may be.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        This Agreement constitutes the entire agreement between ROOSTED and LICENSEE relative to the retention of the services of LICENSEE by ROOSTED and supersedes all understanding prior agreements in that regard. It may be changed only by an agreement in writing.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        No waiver of any breach of any condition herein shall constitute a waiver of any subsequent breach. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        This Agreement shall be governed and construed in accordance with the laws of the state of Arizona.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        If any provision of this Agreement or the application of such provision or to any person or circumstance shall, to any extent, be invalid or unenforceable, the remainder of this Agreement, or the application of such provision to persons of circumstances other than those as to which it is held invalid or unenforceable, shall not be affected and each provision of this Agreement shall be valid and enforced to the fullest extent permitted by law and be independent of every other provision of this Agreement.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        No remedy conferred upon or reserved to LICENSEE or to ROOSTED shall exclude any other remedy or existing at law or in equity or by statute, but each shall be cumulative and in addition to every other remedy given or now or hereafter existing. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        This Agreement is personal to LICENSEE and no rights or obligations of LICENSEE under this Agreement shall be assignable by LICENSEE. ROOSTED may assign its rights and obligations under this Agreement to any successor to the business of ROOSTED or any part of its business, and ROOSTED shall be relieved of all obligations under this Agreement arising subsequent to the date of the assignment. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        It is understood that LICENSEE may be purchasing or selling, in his or her own right and title, a personal residence or investment property. In that event, LICENSEE may refer themselves through the ROOSTED system. LICENSEE is entitled to compensation as outlined in this agreement. UNDER NO CIRCUMSTANCE IS THE LICENSEE TO REPRESENT THEMSELVES in the transaction.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        The success of LICENSEE in a ROOSTED real estate service business is speculative and will depend on many factors, including, to a large extent, LICENSEE’s independent business ability. LICENSEE has not relied on any warranty or representation written, printed, or oral, express or implied, as to Representative’s potential success in the business venture contemplated hereby.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        LICENSEE agrees to all terms of the attached Policies and Procedures Manual.
                      </Typography>
                    </li>
                  </ol>
                </li>      
              </ol>
              <Typography variant='body1' paragraph>
                LICENSEE acknowledges having read and understood the foregoing prior to signing it and acknowledges being in receipt of a fully executed copy of this Agreement.
              </Typography>
            </Grid>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <div className={isMobile ? classes.signatureBlockMobile : classes.signatureBlock }>
                    <Box {...sigProps}>
                      <SignaturePad options={{backgroundColor: 'rgb(255,255,255)'}} ref={(ref) => {signaturePad = ref}} /> 
                    </Box>
                  </div>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant='body1'>
                      BY: (sign above then hit accept)
                    </Typography>
                    <Divider width='100%'/>
                    <Typography variant='body1'>
                      {`${globalUser.userFirstName} ${globalUser.userLastName}`}   
                    </Typography>
                    <Typography variant='body1'>
                      AGENT  
                    </Typography>
                    <Typography variant='body1'>
                      {`DATE: ${moment(new Date()).format('MM/DD/YYYY')}`}   
                    </Typography>
                    <Typography variant='body1'>
                      {`EMAIL: ${globalUser.email}`} 
                    </Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={6} align='center'>
            {showAccept ?
              <React.Fragment>
                <Button 
                  variant='contained' 
                  color='primary' 
                  className={classes.buttons}
                  onClick={saveSignatureSetup}
                >
                  Accept
                </Button>
                <Button 
                  variant='contained' 
                  //color='primary' 
                  className={classes.buttons}
                  onClick={clearSignature}>
                  Clear Signature
                </Button>
                <div align='center'>
                  {dataCollected.loading ? <CircularProgress/> : <React.Fragment/>}
                </div>
              </React.Fragment> :
              <React.Fragment>
                <div>
                  <Button
                    variant='contained' 
                    color='primary' 
                    className={classes.buttons}
                    endIcon={<GetAppIcon/>}
                    onClick={() => FileSaver.saveAs(pdf)}>
                    Download A Copy
                  </Button>
                </div>
                <div>
                  <Button 
                    variant='contained' 
                    color='primary' 
                    className={classes.buttons}
                    endIcon={<ArrowForwardIosIcon/>}
                    onClick={() => {
                      if(scenario === 'addingNewLicense') {
                        history.push('/license/transfer-license')
                      } else if(scenario === 'changingPlan') {
                        history.push('/settings/billing')
                      } else {
                        dataCollected.history.push('/setup/transfer-license')}}
                      }
                  >
                    {scenario === 'addingNewLicense' || scenario === 'changingPlan' ? `Done` : `Proceed to Next Step`}
                  </Button>
                </div>
              </React.Fragment>}
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <div className={classes.roostedSignatureBlock}>
                      <img alt="Signature" src="/images/signatures/AZBrokerSignature.png" width='100%'/>
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant='body1'>
                    BY:
                  </Typography>
                  <Divider width='100%'/>
                  <Typography variant='body1'>
                    Caroline J. McCormick - Designated Broker, Roosted AZ, LLC
                  </Typography>
                  <Typography variant='body1'>
                    {`DATE: ${moment(new Date()).format('MM/DD/YYYY')}`}   
                  </Typography>
                  <Typography variant='body1'>
                    EMAIL: referrals@roosted.io
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid> : <React.Fragment />}
      </CardContent>
    </Card>
  )

};

AZICA.propTypes = {
  className: PropTypes.string,
};

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
      licenseNumber: state.license.licenseNumber,
  };
};

const mapDispatchToProps = dispatch => {
  return {
      userSetUser: (user) => dispatch(actions.userSetUser(user)),
      licenseSetLicenseNumber: (licenseNumber) => dispatch(actions.licenseSetLicenseNumber(licenseNumber))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AZICA);
