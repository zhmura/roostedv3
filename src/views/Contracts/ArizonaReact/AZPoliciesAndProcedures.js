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
import { isMobile } from 'react-device-detect'

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
import awsconfig from "../../../aws-exports";

//SAGA IMPORTS
import { connect } from 'react-redux';
import * as actions from '../../../store/actions/index';

//IMPORT AMPLIFY GRAPHQL ASSETS
import { Auth, API, graphqlOperation, Storage } from "aws-amplify";
import { updateRoostedLicense, updateUser, createRoostedLicense } from "../../../graphql/mutations"
import { getUser } from "../../../graphql/queries"

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

const AZPoliciesAndProcedures = props => {
  const { 
    className, 
    globalUser,
    userSetUser,
    license,
    licenseSetLicenseNumber,
    dataCollected,
    setDataCollected,
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

  const [pdf, setPdf] = useState(null)
  const [showAccept, setShowAccept] = useState(true)

  Storage.configure(awsconfig)

  useEffect(() => {
    if(Object.keys(license).length === 0 && scenario === 'addingNewLicense') {
      history.push('/license/create?type=roosted')
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
        //call the async function that will sign the PDF and add variables
        // await signPoliciesAndProceduresPDF(, )

        ///////// START PDF GENERATION
 
        const url = scenario === 'addingNewLicense' ? 
          await Storage.get(`contract-templates/${license.licenseState}PoliciesAndProcedures.pdf`, { level: 'public' }) :
          await Storage.get(`contract-templates/${globalUser.userRoostedLicenses.items[0].licenseState}PoliciesAndProcedures.pdf`, { level: 'public' })
        
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
        const signaturePage = pages[9]


        //Draw agent signature
        signaturePage.drawImage(pngImage, {
          x: 100,
          y: 126,
          width: 150,
          height: 75,
        })

        //Add the users name below the signature box
        signaturePage.drawText(` - ${globalUser.userFirstName} ${globalUser.userLastName}`, {
          x: 89,
          y: 115,
          size: 11,
          font: robotoFont,
        })

        //Add the users email below the signature box
        signaturePage.drawText(globalUser.email, {
          x: 89,
          y: 90,
          size: 11,
          font: robotoFont,
        })

        //Add the date to the policies and procedures manual under the signature
        signaturePage.drawText(moment(new Date()).format('LL'), {
          x: 89,
          y: 103,
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
        const fileName = scenario ==='addingNewLicense' ? 
          license.licenseState + '_PPM_' + globalUser.userLastName + '_' + globalUser.userFirstName + '_' + globalUser.id + `_${moment(new Date()).format('YYYYMMDD')}.pdf` :
          globalUser.userRoostedLicenses.items[0].licenseState + '_PPM_' + globalUser.userLastName + '_' + globalUser.userFirstName + '_' + globalUser.id + `_${moment(new Date()).format('YYYYMMDD')}.pdf`
        
        console.log(fileName)
        //Puts the document in S3 and gets the AWS S3 key to save into Dynamodb
        const awsKey = await Storage.put(fileName, pdfBlob, {level: 'public', type: 'application/json'})
    
        //check the scenario
        if(scenario === 'addingNewLicense') {
          const licenseParams = {
            licenseUserID: globalUser.id,
            licenseNumber: license.licenseNumber,
            licenseExpiration: license.licenseExpiration,
            licenseState: license.licenseState,
            licensePolicyAndProcedurePath: awsKey.key,
            licenseVerificationStatus: 'waitingOnICA',
            primaryLicense: false,
            licenseType: 'roosted'
          }
          const {data} = await API.graphql(graphqlOperation(createRoostedLicense, {input: licenseParams}))
          licenseSetLicenseNumber(data.createRoostedLicense.id)
        //default case would be the setup case
        } else {
          //Add the AWS key to dynamodb license to recall it later
          const params = {
            id: globalUser.userRoostedLicenses.items[0].id,
            licensePolicyAndProcedurePath: awsKey.key,
            licenseVerificationStatus: 'waitingOnICA'
          }
          await API.graphql(graphqlOperation(updateRoostedLicense, {input: params}))
        }
        
        //Update the user and return the updated user then set it as the global user
        const currentUser = await Auth.currentAuthenticatedUser();
        const sub = currentUser.signInUserSession.idToken.payload.sub
        const {data} = scenario === 'addingNewLicense' ? 
          await API.graphql(graphqlOperation(getUser, {id: sub })) :
          await API.graphql(graphqlOperation(updateUser, {input: {id: sub, setupStatus: 'signICA'}}))
          console.log(data)
        userSetUser(scenario === 'addingNewLicense' ? data.getUser : data.updateUser)


        ///////// END PDF GENERATION
      

        //Display the new set of buttons with option to download the document or continue to the next step
        setShowAccept(false)
        setDataCollected.setOpen(false)
        setDataCollected.setLoading(false)
      } catch(error) {
        setDataCollected.setLoading(false)
        setDataCollected.setErrorMessage('An error occured saving your signature. Try again or email support@roosted.io')
        setDataCollected.setOpen(true)
        console.log(error)
      }
      try{
        if(scenario !== 'addingNewLicense') {
          ////MAILCHIMP UPDATE/////
          //Mark as payment completed and take off abandon cart

          let custom3 = { 
            headers: { Authorization: `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}` },
            body: {
              action: 'policiesSigned',
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
      } catch(error) {
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
              Arizona Policy and Procedures Manual
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
              <Typography variant='h4' paragraph className={classes.firstParagraph}>
                SECTION 1 - DEFINITIONS
              </Typography>
              <Typography variant='body1' paragraph>
                Definitions of many terms are found in the Real Estate Law Book. In addition to terms defined in A.R.S. § 32-2101, 32-2171, and A.A.C. R4-28-101, the following terms may appear in this manual which are defined below: 
              </Typography>
              <ul type='none'style={{fontFamily: 'Roboto', paddingLeft: isMobile ? '1em' : '2em'}}>
                <li>
                  <Typography variant='body1' paragraph>
                    A.A.C. - Arizona Administrative Code (unofficially, the Commissioner's Rules) 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    AAR - Arizona Association of REALTORS ® 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    ADRE - Arizona Department of Real Estate 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    A.R.S. - Arizona Revised Statute 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    AMA – Arizona Multihousing Association 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                   Associate Broker – A licensed broker employed by another broker. Unless otherwise specifically provided, an associate broker has the same license privileges as a salesperson. 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    AZREEA – Arizona Real Estate Educators Association 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    Broker – A company’s designated broker 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    Company – Roosted
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    D.B.A./dba – Doing Business As name 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    Designated Broker – The natural person who is licensed as a broker under Title 32, Chapter 20, and who is either: designated to act on behalf of an employing real estate, cemetery or membership camping entity, or doing business as a sole proprietor, pursuant to A.R.S. § 32- 2101(A)(21). 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    Designated Broker – The natural person who is licensed as a broker under Title 32, Chapter 20, and who is either: designated to act on behalf of an employing real estate, cemetery or membership camping entity, or doing business as a sole proprietor, pursuant to A.R.S. § 32- 2101(A)(21). 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    Employing Broker – A person who is licensed or is required to be licensed as a broker entity pursuant to A.R.S. § 32-2125 (A) or a sole proprietorship if the sole proprietor is a broker licensed pursuant to Title 32, Chapter 20. 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    Licensee – A person to whom a license for the current license period has been granted under any provision of Title 32, Chapter 20. 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    Listing – An employment contract to represent a seller in the marketing of the seller’s property. Buyer Broker Agreement – An employment contract to represent a buyer in the intended purchase of property. 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    MLS – local multiple listing service 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    NAR – National Association of REALTORS® 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    NARPM – National Association of Residential Property Managers® 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    RESPA – Real Estate Settlement Procedures Act 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    Sales Associate - A licensed salesperson or associate broker working with the company as either an employee or an independent contractor. 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    SPDS - Seller's Property Disclosure Statement 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    SPS – ADRE Substantive Policy Statement 
                  </Typography>
                </li>
                <li>
                  <Typography variant='body1' paragraph>
                    ULI – Urban Land Institute
                  </Typography>
                </li>
              </ul>
              <Typography variant='h4' paragraph className={classes.firstParagraph}>
                SECTION 2 - ARIZONA DEPARTMENT OF REAL ESTATE REQUIREMENTS
              </Typography>

              <ol type='1'style={{fontFamily: 'Roboto', paddingLeft: '1em'}}>
                <li>
                  <Typography variant='h5'>
                    POLICY AND PROCEDURES REQUIREMENTS
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Effective August 6, 2002, Commissioner's Rule R4-28-1103, was adopted that requires a Designated Broker to exercise reasonable supervision and control over the activities of brokers, salespersons, and others in the employ of the broker. Reasonable supervision and control includes the establishment and enforcement of written policies, rules, procedures, and systems to:
                      </Typography>
                    </li>
                  </ul>
                  <ol type="a" style={{paddingLeft: isMobile ? '1em' : '2em'}}>
                    <li>
                      <Typography variant='body1' paragraph>
                        Review and manage transactions requiring a salesperson’s or broker’s license; and use of disclosure forms and contracts and if a real estate broker, this includes real estate employment agreements under A.R.S. § 32-2151.02.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Manage the filing, storing, and maintenance of transaction documents that may have a material effect upon the rights or obligations of a party to a transaction, handling of trust funds, and use of unlicensed assistants by a salesperson or broker.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Oversee delegation of authority to others to act on behalf of the broker.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Familiarize salespersons and associate brokers with the requirements of federal, state, and local laws relating to the practice of real estate (or the sale of cemetery property or membership camping contracts, if applicable).
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Review and inspect documents that may have a material effect upon the rights or obligations of a party to a transaction, and advertising and marketing by the employing broker and by all salespersons, associate brokers, and employees of the broker.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        A Designated Broker shall establish a system for monitoring compliance with statutes, rules and the Employing Broker’s policies, procedures and systems.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        A Designated Broker is responsible for the acts of all associate brokers, salespersons, and other employees acting within the scope of their employment.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Agents are obligated to remain licensed, abide by all laws and rules and abide by the broker’s policies and procedures.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        It shall be the responsibility of the broker, when out of the office for 24-hours or more, or unable to perform normal daily duties, to designate in writing the authority to a licensee under their employ, or to another Designated Broker, to handle the day to day operation of the Company. Each designation may not exceed 30 days. See A.R.S. § 32-2127(D).
                      </Typography>
                    </li>
                  </ol>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        All Roosted agents agree to follow the policies and procedures set forth in this manual.
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    License Obligations
                  </Typography>
                  <ol type="a" style={{paddingLeft: isMobile ? '1em' : '2em'}}>
                    <li>
                      <Typography variant='body1' paragraph>
                        Agent agrees to conduct all business within regulations set forth by the ADRE.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Agent agrees that they will notify ADRE of any items necessary, such as change of address, notice of convictions, or any other required reporting, within ten (10) days of occurrence or within the timeframes specified by ADRE.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Agent agrees to keep current on all continuing education classes and will renew their license at ADRE prior to their license expiring.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Agent will not practice real estate, or engage in discussions with the public regarding real estate matters that are outside of their area of expertise.
                      </Typography>
                    </li>
                  </ol>
                </li>
              </ol>
              <Typography variant='h4' paragraph className={classes.firstParagraph}>
                SECTION 3 - TRANSACTIONS
              </Typography>

              <ol type='1'style={{fontFamily: 'Roboto', paddingLeft: '1em'}}>
                <li>
                  <Typography variant='h5'>
                    TYPES OF TRANSACTIONS
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Licensees with Roosted are only allowed to generate real estate referrals and may not under any circumstance represent the public in buying or selling real estate.  Roosted agents shall act solely as a referral associate with Roosted and shall not engage in any other real estate activities for which a license is required with any other individual or entity. Agent hereby agrees to strictly limit his or her activities to the referral of prospective purchasers, sellers or other referrals. Agent agrees not to list properties for sale or lease, nor sell or show properties for the purpose of selling or leasing said properties.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Licensee should utilize prospecting methods, which will enable them to contact prospective buyers and sellers to determine their real estate needs. The Licensee should obtain the name, address, phone, email and other pertinent information about each prospect, and enter it into the Roosted System. Roosted will then promptly place the prospect with a qualified Referral Agent in the appropriate service area, or Licensee is also free to select a specific licensed agent if they know a qualified agent in the appropriate service area.
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    REQUIRED PAPERWORK
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        The only paperwork required from Roosted agents will be the referral form that is submitted through the Roosted System.  No other paperwork will be collected from licensee.  Roosted agents are only permitted to submit the referral form through the Roosted System.  Roosted will not accept referrals submitted in any other manner. 
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    AGENCY RELATIONSHIPS
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Roosted agents are not to establish agency relationships with the public.  Agents are not to provide real estate advice to the public beyond making a referral.
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    EARNEST MONEY
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Due to the referral only nature of Roosted, licensees will not collect earnest money.
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    TRANSACTION PROCESS
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Roosted agents shall make referrals through the Roosted System.  After the referral is made, Roosted will obtain a referral agreement from the referral agent.  Once the referral is placed with an agent, the Roosted agent will be provided the contact information of the referral agent in the Roosted System. 
                      </Typography>
                      </li>
                      <li>
                      <Typography variant='body1' paragraph>
                        Roosted agents are responsible for following up with the referral agent to check on the status of the referral.  If for any reason a different referral agent needs to be chosen, the Roosted agent shall notify Roosted.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Once the transaction closes escrow, Roosted will receive a referral check.  After those funds have cleared the bank, Roosted will promptly make payment to the Roosted agent for their portion of the referral amount. 
                      </Typography>
                    </li>
                  </ul>
                </li>
              </ol>
              <Typography variant='h4' paragraph className={classes.firstParagraph}>
                SECTION 4 - ADVERTISEMENTS AND MARKETING
              </Typography>

              <ol type='1'style={{fontFamily: 'Roboto', paddingLeft: '1em'}}>
                <li>
                  <Typography variant='h5'>
                    ADVERTISMENT GUIDELINES
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        All agents agree to comply with R4-28-502 Advertising Guidelines. Roosted encourages originality and creativity in advertising. Advertising for this section shall include all print advertising (flyers, classified ads, home magazines, mass mailings, internet/web sites, signs, business cards, stationery/letterhead, etc.), and mass communication intended to solicit Buyers or Sellers. Roosted is NOT obligated to pay, neither in-whole or in-part, the advertising for an agent's listing inventory or any other form of advertising including personal promotion. Prior to submitting the advertising, the Broker must approve in writing all advertising placed in any publication, mailed by any agent, or placed on the Internet. All advertising approval requests should be sent to Broker@Roosted.io 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        The following guidelines should be followed at all times: 
                      </Typography>
                    </li>
                  </ul>
                  <ol type="a" style={{paddingLeft: isMobile ? '1em' : '2em'}}>
                    <li>
                      <Typography variant='body1' paragraph>
                        Agents are encouraged to promote their accomplishments. Agent should make announcements as an individual, not on behalf of the company. 
                      </Typography>
                      </li>
                      <li>
                      <Typography variant='body1' paragraph>
                        Because other companies will be the ones representing prospective referrals, Licensee shall not discuss commissions in any advertising. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Advertising will include the name “Roosted” prominently so as to leave no question it is a Roosted ad. The phone number listed for Roosted in all ads must be answered “Roosted.” at all times. Office number and/or home number are acceptable. Trademark names or fictitious names are prohibited. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Agents may NOT advertise by using the term “team” and/or “group”
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Roosted will never have listings to advertise, however any advertising through other brokers for properties in which the roosted agent has ownership interest must include the disclosure “owner/agent”. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Because Roosted is not a member of the National Association of REALTORS®, Roosted agents shall not present themselves as a REALTOR®.  Roosted Agents may refer to themselves as “Real Estate Agent”.
                      </Typography>
                    </li>
                  </ol>
                </li>
                <li>
                  <Typography variant='h5'>
                    SINAGE
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Roosted agents are not allowed to place signage on any properties. 
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    PRINT ADVERTISING
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        All print advertising must include the Roosted logo and/or name. Logos are available on the Roosted website. The ads must contain a phone number answered “Roosted.”.  In addition, the ad must have the brokerage name, Roosted, conspicuously displayed.  
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    TELEMARKETING
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        No telemarketing calls are to be made under any circumstance.   
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    FEDERAL FAIR HOUSING ACT
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Roosted agents shall fully support all federal, state, and local fair housing laws. The Fair Housing Act prohibits discrimination in housing because of color, national origin, religion, sex, familial status, and handicap (disability). All display ads, including flyers, must have the Equal Housing Opportunity logo, and the Roosted logo. Business cards must be ordered at the agent’s expense and through a Broker-approved vendor.    
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    REGULATION Z
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Roosted agents shall not advertise specific financing options.  
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Advertisements with specific financing options must comply with Regulation Z. Roosted agents are not trained in Regulation Z advertising requirements and are therefor not allowed to advertise financing options on properties. 
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    REAL ESTATE SETTLEMENT PROCEDURES ACT (RESPA)
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        All agents shall comply with RESPA guidelines. Violators of RESPA may receive harsh penalties, including triple damages, fines, and even imprisonment.  
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    SOCIAL MEDIA
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Social Media as used in this policy shall apply to both activities at the agent’s web sites (e.g., blogging) and use of third party social media tools (e.g., Facebook, Twitter, LinkedIn, etc.). Notwithstanding anything in this policy, it remains the responsibility of the Agent to comply with the requirements of local, state and federal law. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        The scope of this policy shall extend to all uses of social media in connection with the real estate business (use in connection with the real estate business would include any use in which the agent seeks to promote or capture real estate business from consumers or other agents). This policy is not intended to cover the activities of Agents falling completely outside the real estate business; however any conduct, which reflects adversely upon broker or the brokerage, may be reviewed under the terms of this policy 
                      </Typography>
                    </li>
                  </ul>
                </li>
              </ol>
              <Typography variant='h4' paragraph className={classes.firstParagraph}>
                SECTION 5 - INSURANCE AND FINANCIAL
              </Typography>

              <ol type='1'style={{fontFamily: 'Roboto', paddingLeft: '1em'}}>
                <li>
                  <Typography variant='h5'>
                    E{`&`}O INSURANCE
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Because Roosted is not handling transactions, Roosted does not carry Errors and Omissions Insurance.  
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    SALE OF AGENT-OWNED PROPERTIES
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Roosted agents may purchase or sell real property as an unrepresented buyer or seller. In this case, the Roosted agent must disclose in any advertising that they are a licensed agent (or Owner/Agent if selling a property).  Without the representation of a REALTOR®, Roosted agents may not use the forms provided by the Arizona Association of REALTORS®.  If the Roosted Agent seeks REALTOR® representation, access to Arizona Regional Multiple Listing Service (ARMLS), or access to any other MLS, then the Roosted Agent agrees to refer the purchase or sale of the property as described herein. The Agent agrees to call the Roosted Designated Broker prior to the acquisition of real property.  
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    COVENANT TO COOPERATE
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        In the event of any claim concerning a transaction involving an agent either directly or indirectly, the agent agrees to cooperate fully in providing documents, testimony and other items that may be needed to defend a complaint, as may be deemed appropriate by our legal advisor or Broker. This covenant shall survive termination, whether voluntary or involuntary, and is without time limitations. Remedies for the failure to comply with this provision could include the Broker seeking full restitution as a result of the non-compliance in a tribunal of the Broker’s choice. In addition, the claims will have risen from a breach of contract and therefore the Broker will be entitled to recover reasonable attorney fees.  
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    AUTOMOBILE INSURANCE COVERAGE
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Roosted agents are prohibited from using their vehicle for activities involved in prospecting for clients.  Because of this, it is not necessary to provide Roosted with automobile insurance information.  If the agent violates this rule, the agent takes full responsibility for any lawsuits that may arise from their operation of the vehicle and indemnifies Roosted.  
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    ROOSTED BILLING
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Roosted billing takes place automatically through the Roosted System.  All bills will be debited on the statement due date (monthly or annual anniversary of joining Roosted or switching Roosted plans) An agent whose debit card or credit card expires or is declined is subject to either withholding of commissions, payment through commissions until card is reinstated. Agent must provide Roosted with a new credit card or debit card in a timely manner. Any delay in providing the new card information will further delay any payments of commission and/or can result in termination.   
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        If Roosted agent is more than 30 days behind on their payments, Roosted at their sole discretion can downgrade the agent to a free plan.  Any referrals made after that point will be at the referral split designated on the free plan.   
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    INDEPENDENT CONTRACTOR STATUS
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Agents acknowledge that their status with Roosted is that of an “Independent Contractor”. In addition, agents agree to the following: 
                      </Typography>
                    </li>
                  </ul>
                  <ol type="a" style={{paddingLeft: isMobile ? '1em' : '2em'}}>
                    <li>
                      <Typography variant='body1' paragraph>
                        They have not been required by the broker to maintain any specific schedule or set hours nor to attend any mandatory sales or training meetings. 
                      </Typography>
                      </li>
                      <li>
                      <Typography variant='body1' paragraph>
                        They do not have to have permission of the broker to schedule vacations. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        They have received no minimum salary or sick pay. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        They have paid and will pay all future income and FICA taxes owed. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Their association with the broker may be terminated by either party upon notice given to the other; but the rights of the parties to any fees which accrued prior to said notice shall not be divested deemed satisfied by the termination of this arrangement. 
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        They shall not be treated as an employee with respect to the services performed hereunder for state or federal tax purposes. 
                      </Typography>
                    </li>
                  </ol>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        All costs incurred by the agent in conducting their independent business shall be at their sole discretion and expense without reimbursement from Broker at any point in time. All fees for membership in trade associations, designation programs, subscriptions, printing, computers, license renewal fees, personal phones, pagers, and assistants shall be covered by the agent. Roosted has been and is fully committed to equal employment opportunity, both in principle and as a matter of policy. Roosted employment policies and practices require that we provide equal opportunity to all applicants, independent contractors and employees, without regard to race, color, religion, sex, or national origin and in full accordance with state and national polices pertaining to age.  
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    COMMISSIONS
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Roosted agents will receive referral fees once the transaction has closed escrow.  When Roosted receives a referral fee, the referring agent will be notified.  Once the funds have cleared, Roosted will promptly pay the agent their portion of the referral fee.  The agent’s portion of the referral fee can be made by check, or direct deposit.    
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        In order to receive referral fees, Roosted must have a current W-9 tax form on file for the agent.  If the W-9 is not on file, Roosted will hold the agents referral check until that form is completed.  
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Roosted agents can monitor the status of the referral through the Roosted system.  Roosted agents will be provided with the contact information of the agent handling the referral.  The Roosted agent is responsible for following up with the referral agent to know the status of the referral.   
                      </Typography>
                    </li>
                  </ul>
                </li>
              </ol>
              <Typography variant='h4' paragraph className={classes.firstParagraph}>
                SECTION 6 - ASSOCIATIONS
              </Typography>

              <ol type='1'style={{fontFamily: 'Roboto', paddingLeft: '1em'}}>
                <li>
                  <Typography variant='h5'>
                    LOCAL, STATE, NATIONAL
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Roosted is a not a member of the REALTOR® Community.   
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        All agents are encouraged to grow their referral business to the point it makes sense for them to become a full-time, practicing real estate agent.  At that point we encourage agents to become an active member of their local, state, and National Association of REALTORS®.    
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    MULTIPLE LISTING SERVICE
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Roosted is not a member of the Arizona Regional Multiple Listing Service (ARMLS), or any other MLS in the state of Arizona. Roosted agents are forbidden from accessing the MLS using another agent’s login credentials.    
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    ARBITRATION AND ETHICS HEARINGS
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        All Roosted agents agree to participate in any ethics or arbitration hearing at the state or local board that is filed against the agent, Roosted, and/or its Broker.  Agents shall report any pending ethics or arbitration matters to the Broker as soon as they become aware of the situation. All agents acknowledge that they will be liable for any arbitration fee and/or settlement, even after their termination with Roosted. In addition, Roosted reserves the right to hold all future commissions due the agent, should an arbitration be filed against the agent and/or Broker in reference to a transaction they were associated with.    
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    LICENSE RENEWAL
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        All Roosted agents agree to maintain an active Arizona real estate license with the Department of Real Estate. It is the agent’s sole responsibility to fulfill all continuing education requirements and file their renewal with ADRE in a timely manner. Should an agent elect not to renew their license prior to the expiration date, agent agrees to notify Roosted, in writing or via email, of their intent to sever their license from Roosted. Agent acknowledges that Roosted will continue to charge the agent Roosted fees until such written notification is received. Roosted may, at its sole option, sever the agent’s license with Roosted if the agent’s license is not renewed on time. In addition, agents agree to adhere to all ADRE rules and regulations. It shall be the agent’s responsibility to be knowledgeable on the rules set forth by ADRE. Should a complaint be filed against an agent at ADRE, agent agrees to immediately notify the broker, respond promptly to the complaint, and cooperate fully with ADRE.    
                      </Typography>
                    </li>
                  </ul>
                </li>
              </ol>
              <Typography variant='h4' paragraph className={classes.firstParagraph}>
                SECTION 7 - POLICIES
              </Typography>

              <ol type='1'style={{fontFamily: 'Roboto', paddingLeft: '1em'}}>
                <li>
                  <Typography variant='h5'>
                    SEXUAL HARASSMENT POLICY
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Sexual harassment is a form of unlawful sex discrimination and is in violation of both state and federal employment discrimination laws. It is also a violation of Roosted policy with respect to equal employment opportunity. Sexual harassment is defined as follows:   
                      </Typography>
                    </li>
                  </ul>
                  <ol type="a" style={{paddingLeft: isMobile ? '1em' : '2em'}}>
                    <li>
                      <Typography variant='body1' paragraph>
                        Unwelcome advances, requests for sexual favors, and other verbal or physical conduct of a sexual nature that interferes with work performance or creates a hostile work environment.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Deliberate or repeated unsolicited verbal comments, gestures, or physical contact of a sexual nature, which are unwelcome and offensive to a reasonably sensitive employee. This may include innuendos, jokes, or sexually oriented comments.
                      </Typography>
                    </li>
                    <li>
                      <Typography variant='body1' paragraph>
                        Any repeated or unwanted sexual comments, suggestions or physical contacts which are objectionable or cause any employee discomfort on the job. 
                      </Typography>
                    </li>
                  </ol>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Roosted will not tolerate sexual harassment of its employees or contractors, and any persons found responsible for sexual harassment are subject to disciplinary action up to and including immediate discharge. If you feel you have been sexually harassed, please report any and all incidents to your supervisor or a member of Roosted’s management team. This company takes such complaints very seriously and will conduct a prompt, thorough, and confidential investigation.   
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    SMOKING/DRUGS/ALCOHOL
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Illegal drugs shall not in any way be brought onto any property of Roosted. If a prescription drug is a “controlled substance,” the agent shall not use such a drug while in the performance of their duties as a Roosted agent. During that period, arrangements are to be made for someone to “cover” your business activities. All other prescribed drugs shall be used in strict compliance with the directives of the prescribing physician. There is no justifiable reason to subject us or any other person to a dangerous environment through the unwise and unprofessional uses of these substances.   
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    EQUAL OPPORTUNITY
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Roosted is unequivocally and firmly committed to the principle of Equal Opportunity in housing and the provision of professional services without discrimination based on race, color, religion, sex, handicap, familial status, or national origin. The Broker and ownership of Roosted have a legal, ethical, and moral responsibility to do everything in its power to prevent any agent from committing any act or making any statement that could be perceived in any way as discriminatory based on race, color, religion, handicap, familial status, or national origin. This policy is not a recommendation and all agents must follow it.    
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    ANTI-TRUST
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Roosted is committed to complying with all antitrust principles and staying in compliance at all times. Agents agree to be aware of antitrust compliance issues and must agree to comply at all times. Agents agree not to collectively set the price of real estate services they are providing. This means that agents should never respond to a question about fees by suggesting that all competitors in the market follow the same pricing practices. Agents agree not to price-fix, not form group boycotts, and be very cautious about taking any collective actions with licensed agents, inside of Roosted or licensed with another brokerage. 
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    VACATION
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        As an Independent Contractor with Roosted we do not restrict, offer or define an agent’s sick days or vacation days. However, agents leaving town or who are going to be unavailable for more than 24 hours need to notify Roosted. Please indicate who will be taking your calls while you are unavailable and when you will be returning, so that your calls can be handled professionally.  
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    UNLICENSED ASSISTANTS 
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Agents may not hire unlicensed assistants to aid them with their day-to-day administrative duties.  
                      </Typography>
                    </li>
                  </ul>
                </li>
                <li>
                  <Typography variant='h5'>
                    UPDATING PERSONAL INFORMATION 
                  </Typography>
                  <ul type="none">
                    <li>
                      <Typography variant='body1' paragraph>
                        Agents must notify Roosted with any change of address, phone numbers, email addresses or emergency contract information, should it change after joining Roosted. Roosted communicates frequently with the agents via e-mail, and having an e-mail address that is working is crucial to the agent’s success with Roosted. In addition, agents must notify the Arizona Department of Real Estate of any changes, as required by applicable ARS.  
                      </Typography>
                    </li>
                  </ul>
                </li>
              </ol>

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
                        dataCollected.history.push('/license/sign-ica')
                      } else {
                        dataCollected.history.push('/setup/sign-ica')
                      }
                    }
                    }
                  >
                    Proceed to Next Contract
                  </Button>
                </div>
              </React.Fragment>}
            </Grid>
          </Grid>
        </Grid> : <React.Fragment />}
      </CardContent>
    </Card>
  )

};

AZPoliciesAndProcedures.propTypes = {
  className: PropTypes.string,
};

const mapStateToProps = state => {
  return {
      globalUser: state.user.userGlobal,
      license: state.license.license
  };
};

const mapDispatchToProps = dispatch => {
  return {
      userSetUser: (user) => dispatch(actions.userSetUser(user)),
      licenseSetLicenseNumber: (licenseNumber) => dispatch(actions.licenseSetLicenseNumber(licenseNumber))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AZPoliciesAndProcedures);
