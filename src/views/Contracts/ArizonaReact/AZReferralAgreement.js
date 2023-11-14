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

// import { getReferralStatusStepsObject } from '../../../utils/utilities'

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
import { updateReferral } from "../../../graphql/mutations"

import { getRoostedEmail } from '../../../utils/utilities'

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

const AZReferralAgreement = props => {
  const { 
    className, 
    globalUser,
    userSetUser,
    dataCollected,
    setDataCollected,
    referral,
    history,
    scenario,
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

  const [loading, setLoading] = useState(false)
  const [pdf, setPdf] = useState(null)
  const [showAccept, setShowAccept] = useState(true)

  Storage.configure(awsconfig)
  
  useEffect(() => {
    // if(Object.keys(referral).length === 0 && scenario === 'addingNewLicense') {
    //   history.push('/manage-referrals-received')
    // }

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

        setLoading(true)
        //call the async function that will sign the PDF and add variables
        // await signPoliciesAndProceduresPDF(, )

        ///////// START PDF GENERATION

        const url = await Storage.get(`contract-templates/${referral.referralReferringAgentState}ReferralAgreement.pdf`, { level: 'public' })

        
        //const url = `/pdfs/${globalUser.userRoostedLicenses.items[0].licenseState}PoliciesAndProcedures.pdf`
        console.log(url)
        const existingPdfBytes = await fetch(url).then(res => res.arrayBuffer())
        //const existingPdfBytes = pdfTemplate.arrayBuffer()
        
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

        //Get signature page
        const page = pages[0]

        //Add the date to the opening line of the agreement
        page.drawText(moment(new Date()).format('LL'), {
          x: 245,
          y: 694,
          size: 11,
          font: robotoFont,
        })

        //Add the partner agent's name in the top line
        page.drawText(`${referral.referralPartnerAgent.userFirstName} ${referral.referralPartnerAgent.userLastName}`, {
          x: 20,
          y: 683,
          size: 11,
          font: robotoFont,
        })

        //Add type of the agreement
        page.drawText(referral.referralType === 'buyerReferral' ? 'buyer referral' : 'seller referral', {
          x: 55,
          y: 671,
          size: 11,
          font: robotoFont,
        })

        //Add the client's name in the top line
        page.drawText(`${referral.referralClient.clientFirstName} ${referral.referralClient.clientLastName}`, {
          x: 240,
          y: 671,
          size: 11,
          font: robotoFont,
        })

        //Add the roosted agent's name in the top line
        page.drawText(`${referral.referralRoostedAgent.userFirstName} ${referral.referralRoostedAgent.userLastName}`, {
          x: 437,
          y: 671,
          size: 11,
          font: robotoFont,
        })

        //1st instance of fee
        page.drawText((referral.referralFeeOffered).toString(), {
          x: 165,
          y: 493,
          size: 11,
          font: robotoFont,
        })

        //2nd instance of fee
        page.drawText((referral.referralFeeOffered).toString(), {
          x: 138,
          y: 465,
          size: 11,
          font: robotoFont,
        })

        //3rd instance of fee
        page.drawText((referral.referralFeeOffered).toString(), {
          x: 104,
          y: 437,
          size: 11,
          font: robotoFont,
        })

        //4th instance of fee
        page.drawText((referral.referralFeeOffered).toString(), {
          x: 398,
          y: 409,
          size: 11,
          font: robotoFont,
        })

        //Draw agent signature
        page.drawImage(pngImage, {
          x: 95,
          y: 95,
          width: 120,
          height: 65,
        })

        //Add the users name below the signature box
        page.drawText(` - ${referral.referralPartnerAgent.userFirstName} ${referral.referralPartnerAgent.userLastName}`, {
          x: 90,
          y: 82,
          size: 11,
          font: robotoFont,
        })

        //Add the users email below the signature box
        page.drawText(referral.referralPartnerAgent.email, {
          x: 89,
          y: 60,
          size: 11,
          font: robotoFont,
        })

        //Add the date to the partner signed
        page.drawText(moment(new Date()).format('LL'), {
          x: 85,
          y: 71,
          size: 11,
          font: robotoFont,
        })

        //Add the date for the broker
        page.drawText(moment(new Date()).format('LL'), {
          x: 338,
          y: 71,
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
        const fileName = referral.referralReferringAgentState + '_' +  (referral.referralType === 'buyerReferral' ? 'Buyer' : 'Seller') + '_Referral_Agreement_' + referral.referralPartnerAgent.userFirstName + '_' + referral.referralPartnerAgent.userLastName + '_' + referral.referralClient.clientLastName + '_' + globalUser.id + `_${moment(new Date()).format('YYYYMMDD')}.pdf` 
        
        console.log(fileName)
        //Puts the document in S3 and gets the AWS S3 key to save into Dynamodb
        const awsKey = await Storage.put(fileName, pdfBlob, {level: 'public', type: 'application/json'})



        ///////// END PDF GENERATION
    
        let params = {
          id: referral.id,
          referralStatus: 'accepted',
          referralContractPath: awsKey.key
        }

        await API.graphql(graphqlOperation(updateReferral, {input: params}))
      
        ////SENDGRID EMAIL TEMPLATE/////
  
        let fromEmail = getRoostedEmail(referral.referralReferringAgentState, 'referral')

        let custom = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            emailData: {
              templateId: 'd-a98528240daa41edb806a8a4cad30a20',
              toEmail: referral.referralRoostedAgent.email,
              toFullName: referral.referralRoostedAgent.userFirstName + ' ' + referral.referralRoostedAgent.userLastName,
              fromEmail: fromEmail,
              clientFirstName: referral.referralClient.clientFirstName,
              clientLastName: referral.referralClient.clientLastName,
              roostedAgentFirstName: referral.referralRoostedAgent.userFirstName,
              roostedAgentLastName: referral.referralRoostedAgent.userLastName,
              partnerAgentFirstName: referral.referralPartnerAgent.userFirstName,
              partnerAgentLastName: referral.referralPartnerAgent.userLastName,
              status: 'Accepted'
            }
          }
        }
        console.log(custom)
        const sendGridResponse = await API.post(
          'roostedRestAPI', 
          '/sendgrid/send-email',
          custom
        )
        console.log(sendGridResponse)
        //SENDGRID EMAIL TEMPLATE/////

          //SENDGRID EMAIL TEMPLATE/////

          let toEmail = getRoostedEmail(referral.referralReferringAgentState, 'flock')
   
          let custom2 = { 
            headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
            body: {
              emailData: {
                templateId: 'd-295449abeb6c40f4bf94ecea7109ac99',
                toEmail: toEmail,
                toFullName: 'The Flock',
                fromEmail: fromEmail,
                roostedAgentFirstName: referral.referralRoostedAgent.userFirstName,
                roostedAgentLastName: referral.referralRoostedAgent.userLastName,
                type: referral.referralType === 'buyerReferral' ? 'Buyer' : 'Seller',
                clientFirstName: referral.referralClient.clientFirstName,
                clientLastName: referral.referralClient.clientLastName,
                partnerAgentFirstName: globalUser.userFirstName,
                partnerAgentLastName: globalUser.userLastName,
                state: referral.referralState,
                referralLink: `https://app.roosted.io/referrals/details/roosted/${referral.id}/referraldata?id=${referral.referralRoostedAgent.id}`
              }
            }
          }
          console.log(custom2)
          const sendGridResponse2 = await API.post(
            'roostedRestAPI', 
            '/sendgrid/send-email',
            custom2
          )
          console.log(sendGridResponse2)
          //SENDGRID EMAIL TEMPLATE/////
        

        //Display the new set of buttons with option to download the document or continue to the next step
        setShowAccept(false)
        setDataCollected.setOpen(false)
        setLoading(false)
      } catch(error) {
        setLoading(false)
        setDataCollected.setErrorMessage('An error occured saving your signature. Try again or email support@roosted.io')
        setDataCollected.setOpen(true)
        console.log(error)
      }

      try {
        //TWILIO TEXT/////

        let textData = { 
          headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
          body: {
            phoneNumber: referral.referralRoostedAgent.userPhone,
            message: `A Roosted referral just got accepted by ${globalUser.userFirstName} ${globalUser.userLastName}!`
            }
          }
          console.log(textData)
          const twilioResponse = await API.post(
            'roostedRestAPI', 
            '/sendgrid/send-twilio-text',
            textData
          )
          console.log(twilioResponse)
        //TWILIO TEXT/////
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
      {Object.keys(referral).length === 0  ? <React.Fragment/> :
        <Grid
          container
          justify="space-between"
          alignItems='center'
        >
          <Grid item>
            <Typography
              align="right"
              component="h3"
              variant="h3"
            >
              Referral Agreement
            </Typography>
          </Grid>
          <Grid item>
            <img
              alt="Brand"
              src="/images/logos/roosted_horizontal.png"
              width='150'
            />
          </Grid>
          <Grid container spacing={2}>
            <Grid item>
              <Typography variant='body1' paragraph className={classes.firstParagraph}>
                {`This Referral Agreement ("Agreement") is made on ${moment(new Date()).format('LL')} ("Effective Date"), by and between ${referral.referralPartnerAgent.userFirstName} ${referral.referralPartnerAgent.userLastName}, hereinafter referred to as "Agent", and ROOSTED AZ, LLC, hereinafter referred to as "Roosted" for the ${referral.referralType === 'buyerReferral' ? 'buyer' : 'seller'} referral with a referral ID in Roosted's system of ${referral.id} for the client ${referral.referralClient.clientFirstName} ${referral.referralClient.clientLastName} referred by ${referral.referralRoostedAgent.userFirstName} ${referral.referralRoostedAgent.userLastName}.`}
              </Typography>
              <Typography variant='h5'>
                DEFINITION OF A REFERRAL
              </Typography>
              <Typography variant='body1' paragraph>
                {`Roosted agents make referrals of buyers and sellers of real estate ("Clients") to a real estate agent who can best serve their needs. "A Referral" is defined as when Roosted has recommended the Agent to the Client. Roosted will notify the Agent of the referral through the Roosted system and via email.`}
              </Typography>
              <Typography variant='h5'>
                VOLUNTARY PARTICIPATION
              </Typography>
              <Typography variant='body1' paragraph>
                {`The Agent's participation in Roosted's referral program is voluntary and can be terminated by either party at any time with written notice. However, any Referrals made prior to such termination are still bound by this agreement, and referral fees will be due upon close of any transactions resulting from such Referrals.`}
              </Typography>
              <Typography variant='h5'>
                REFERRAL FEE
              </Typography>
              <Typography variant='body1' paragraph>
              {`For referrals made, the Agent agrees to pay Roosted a referral fee through the Agent's employing broker as follows:`}
              </Typography>
              <ul>
                <li style={{marginLeft: isMobile ? '1em' : '2em'}}>
                  <Typography variant='body1'>
                  {`A referral fee is triggered when a transaction closes within two years of the date of the Referral.`}
                  </Typography>
                </li>
                <li style={{marginLeft: isMobile ? '1em' : '2em'}}>
                  <Typography variant='body1'>
                    {`The referral fee shall be ${referral.referralFeeOffered}% of the Agent's side of the gross commission.`}
                  </Typography>
                </li>
                <li style={{marginLeft: isMobile ? '1em' : '2em'}}>
                  <Typography variant='body1'>
                    {`If an Agent represents both a buyer and seller on the same transaction where both parties are Roosted Referrals, the referral fee will be ${referral.referralFeeOffered}% of the total gross commission unless otherwise agreed to by Roosted and the Agent.`}
                  </Typography>
                </li>
                <li style={{marginLeft: isMobile ? '1em' : '2em'}}>
                  <Typography variant='body1'>
                    {`If an Agent represents both a buyer and seller on the same transaction and one party is a Roosted Referral, referral fee will be ${referral.referralFeeOffered}% of 1/2 of the total gross commission of the transaction unless otherwise agreed to by Roosted and the Agent.`}
                  </Typography>
                </li>
                <li style={{marginLeft: isMobile ? '1em' : '2em'}}>
                  <Typography variant='body1'>
                    {`If an Agent represents a client referred by Roosted in multiple transactions, a ${referral.referralFeeOffered}% referral fee will apply to those additional transactions unless otherwise agreed to by Roosted and the Agent`}
                  </Typography>
                </li>
                <li style={{marginLeft: isMobile ? '1em' : '2em'}}>
                  <Typography variant='body1'>
                    {`Gross commission is calculated as the amount received by the Agent's broker prior to any split of commission with the agent or any other brokers on the Agent’s side of the transaction.`}
                  </Typography>
                </li>
                <li style={{marginLeft: isMobile ? '1em' : '2em'}}>
                  <Typography variant='body1'>
                    {`Upon execution of a contract for a transaction involving a Referral, the Agent will promptly update the referral in the Roosted System and indicate the anticipated closing date.`}
                  </Typography>
                </li>
                <li style={{marginLeft: isMobile ? '1em' : '2em'}}>
                  <Typography variant='body1'>
                    {`The Agent will have the resulting referral fee paid directly from escrow or by the employing broker within ten days of close of escrow.`}
                  </Typography>
                </li>
              </ul> 
              <Typography variant='h5' className={classes.firstParagraph}>
                FINE PRINT AND OTHER DETAILS
              </Typography>
              <ul>
                <li style={{marginLeft: isMobile ? '1em' : '2em'}}>
                  <Typography variant='body1'>
                  {`The Agent is responsible for the real estate brokerage services provided to the Clients. The Agent agrees to indemnify and hold Roosted harmless from any claims, costs, and damages incurred by Roosted arising from claims by Clients regarding the brokerage services provided by the Agent.`}
                  </Typography>
                </li>
                <li style={{marginLeft: isMobile ? '1em' : '2em'}}>
                  <Typography variant='body1'>
                    {`The Agent is responsible for maintaining his or her real estate license and for following all applicable real estate laws regarding disclosures, documentation and other broker responsibilities.`}
                  </Typography>
                </li>
                <li style={{marginLeft: isMobile ? '1em' : '2em'}}>
                  <Typography variant='body1'>
                    {`In the unlikely event of a legal dispute between Roosted and the Agent, the prevailing party will be entitled to recover its attorneys’ fees and costs from the other party.`}
                  </Typography>
                </li>
                <li style={{marginLeft: isMobile ? '1em' : '2em'}}>
                  <Typography variant='body1'>
                    {`This Agreement will be governed by Arizona law, without regard to its conflict of laws provisions.`}
                  </Typography>
                </li>
                <li style={{marginLeft: isMobile ? '1em' : '2em'}}>
                  <Typography variant='body1' paragraph>
                    {`Any notices between Roosted and the Agent are to be sent to the email addresses below. The agent is responsible for notifying Roosted if their email address changes. `}
                  </Typography>
                </li>
              </ul>   
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
                      {`${referral.referralPartnerAgent.userFirstName} ${referral.referralPartnerAgent.userLastName}`}   
                    </Typography>
                    <Typography variant='body1'>
                      AGENT  
                    </Typography>
                    <Typography variant='body1'>
                      {`DATE: ${moment(new Date()).format('MM/DD/YYYY')}`}   
                    </Typography>
                    <Typography variant='body1'>
                      {`EMAIL: ${referral.referralPartnerAgent.email}`} 
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
                  {loading ? <CircularProgress/> : <React.Fragment/>}
                </div>
              </React.Fragment> :
              <React.Fragment>
                <Button
                  variant='contained' 
                  color='primary' 
                  className={classes.buttons}
                  endIcon={<GetAppIcon/>}
                  onClick={() => FileSaver.saveAs(pdf)}>
                  Download A Copy
                </Button>
                <Button 
                  variant='contained' 
                  color='primary' 
                  className={classes.buttons}
                  endIcon={<ArrowForwardIosIcon/>}
                  onClick={() => history.push(`/referrals/details/partner/${referral.id}/referraldata`)}
                >
                  Go To Referral
                </Button>
              </React.Fragment>}
            </Grid>
          </Grid>


          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <div className={classes.roostedSignatureBlock}>
                      <img alt="Signature" src={`/images/signatures/${referral.referralReferringAgentState}BrokerSignature.png`} width='100%'/>
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
        </Grid>}
      </CardContent>
    </Card>
  )

};

AZReferralAgreement.propTypes = {
  className: PropTypes.string,
};

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
  };
};

const mapDispatchToProps = dispatch => {
  return {
      userSetUser: (user) => dispatch(actions.userSetUser(user)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AZReferralAgreement);
