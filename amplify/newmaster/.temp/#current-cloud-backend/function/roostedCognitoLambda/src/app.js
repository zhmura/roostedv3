/*
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/




var express = require('express')
var bodyParser = require('body-parser')
var awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const aws = require('aws-sdk');
const cognitoIdentity = new aws.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' });
const region = process.env.REGION
const documentClient = new aws.DynamoDB.DocumentClient({region});

// declare a new express app
var app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
});
    //const getPublicKeyUrl =  'https://cognito-idp.' + process.env.region + '.amazonaws.com/' + UserPoolId + '/.well-known/jwks.json'

app.post('/users/delete-user', async (req, res) => {
  const deleteParams = {
    Username: req.body.username,
    UserPoolId: process.env.userPoolId
  }

try {
    await cognitoIdentity.adminDeleteUser(deleteParams).promise();
    res.status(200).json({messageSuccess: true})

  } catch(error) {
    res.status(404).json({messageSuccess: false, error: error})
    console.log(error);
  }
});

// app.post('/users/create-user', async (req, res) => {
//   const createParams = {
    
//       // ClientMetadata: { 
//       //    "string" : "string" 
//       // },
//       DesiredDeliveryMediums: [ "EMAIL" ],
//       ForceAliasCreation: false,
//       MessageAction: "SUPPRESS",
//       TemporaryPassword: req.body.password,
//       UserAttributes: [ 
//          { 
//             email: req.body.email,
//             phone: req.body.phone
//          }
//       ],
//       Username: req.body.username,
//       UserPoolId: process.env.userPoolId,
//       // ValidationData: [ 
//       //    { 
//       //       Name: "string",
//       //       Value: "string"
//       //    }
//       // ]
   
//   }

// try {
//     const newUser = await cognitoIdentity.adminCreateUser(createParams).promise();
//     if(req.body.type === 'broker') {
//       const groupParams = {
//         GroupName: "admins",
//         Username: req.body.username,
//         UserPoolId: process.env.userPoolId
//       }  
//       await cognitoIdentity.adminAddUserToGroup(groupParams).promise();
//     }
//     res.status(200).json({messageSuccess: true, newUser: newUser})

//   } catch(error) {
//     res.status(404).json({messageSuccess: false, error: error})
//     console.log(error);
//   }
// });

//This is for added agents to be able to modify the referral they are attached to on first login and the 
app.post('/users/modify-added-agent', async (req, res) => {
  const sub = req.body.sub
  const referralId = req.body.referralId

  // example data
  // const params = {
  //   TableName: process.env.ENV === 'master' ? 'User-hqewozhe55bppnhwrlydkxhnka-master' : 'User-ux4plcyf5veite3avotvsue2vq-staging',
  //   IndexName: 'emailKey',
  //   KeyConditionExpression: "email = :email",
  //   ExpressionAttributeValues: {":email": email},
  // };
  console.log(referralId)
  try{

    if(referralId !== null) {
      const referralParams = {
        TableName: process.env.ENV === 'master' ? 'Referral-hqewozhe55bppnhwrlydkxhnka-master' : 'Referral-ux4plcyf5veite3avotvsue2vq-staging',
        Key: {
          'id': referralId
        },
        UpdateExpression: 'set referralPartnerAgentID = :i',
        ExpressionAttributeValues: {':i': sub}
      }

      await documentClient.update(referralParams).promise()
    }

    const deleteParams = {
      TableName: process.env.ENV === 'master' ? 'User-hqewozhe55bppnhwrlydkxhnka-master' : 'User-ux4plcyf5veite3avotvsue2vq-staging',
      Key: {
        'id': req.body.currentDynamoId
      },
    }

    await documentClient.delete(deleteParams).promise()

    res.status(200).json({messageSuccess: true})

  } catch(error) {
    console.log(error)
    res.status(404).json({messageSuccess: false, error: error})
  }

  //example data
  // documentClient.query(params, function(error, data) {
  //   if (error) { 
  //     console.log(error);
  //     res.status(404).json({messageSuccess: false, error: error})
  //   } else {
  //     if(data.Items.length === 0) {
  //       res.status(200).json({messageSuccess: true})
  //     } else {
  //       res.status(404).json({messageSuccess: false, error: error})
  //     }
  //   }
  // })

})

//This is for brokers added to link their license to their new cognito userId
app.post('/users/add-to-group', async (req, res) => {
  const sub = req.body.sub
  const group = req.body.group

  try {
    const groupParams = {
    GroupName: group,
    Username: sub,
    UserPoolId: process.env.userPoolId
  }  
  await cognitoIdentity.adminAddUserToGroup(groupParams).promise()
  res.status(200).json({messageSuccess: true})
        
  } catch(error) {
    console.log(error)
    res.status(404).json({messageSuccess: false, error: error})
  }
})

//This is for brokers added to link their license to their new cognito userId
app.post('/users/modify-added-broker', async (req, res) => {
  const sub = req.body.sub
  const licenseId = req.body.licenseId

  try {

  //update license 
  if(licenseId !== null) {
    const licenseParams = {
      TableName: process.env.ENV === 'master' ? 'RoostedLicense-hqewozhe55bppnhwrlydkxhnka-master' : 'RoostedLicense-ux4plcyf5veite3avotvsue2vq-staging',
      Key: {
        'id': licenseId
      },
      UpdateExpression: 'set licenseUserID = :i',
      ExpressionAttributeValues: {':i': sub}
    }

    await documentClient.update(licenseParams).promise()
  } 

  const deleteParams = {
    TableName: process.env.ENV === 'master' ? 'User-hqewozhe55bppnhwrlydkxhnka-master' : 'User-ux4plcyf5veite3avotvsue2vq-staging',
    Key: {
      'id': req.body.currentDynamoId
    },
  }

  await documentClient.delete(deleteParams).promise()
    
  // const groupParams = {
  //   GroupName: "admins",
  //   Username: sub,
  //   UserPoolId: process.env.userPoolId
  // }  
  // await cognitoIdentity.adminAddUserToGroup(groupParams).promise()
  res.status(200).json({messageSuccess: true})
        
} catch(error) {
  console.log(error)
  res.status(404).json({messageSuccess: false, error: error})
}})

//This is for legacy users to adjust their licenses and referrals to match their new login
app.post('/users/modify-legacy-user', async (req, res) => {
  const sub = req.body.sub
  const roostedLicenses = req.body.roostedLicenses
  const partnerLicenses = req.body.partnerLicenses
  const referralsReceived = req.body.referralsReceived
  const referralsCreated = req.body.referralsCreated

  try {

  //update roosted licenses
  for(let i = 0 ; i < roostedLicenses.length ; i++) {
    const licenseParams = {
      TableName: process.env.ENV === 'master' ? 'RoostedLicense-hqewozhe55bppnhwrlydkxhnka-master' : 'RoostedLicense-ux4plcyf5veite3avotvsue2vq-staging',
      Key: {
        'id': roostedLicenses[i].id
      },
      UpdateExpression: 'set licenseUserID = :i',
      ExpressionAttributeValues: {':i': sub}
    }

    await documentClient.update(licenseParams).promise()
  } 

  //update partner licenses
  for(let i = 0 ; i < partnerLicenses.length ; i++) {
    const licenseParams = {
      TableName: process.env.ENV === 'master' ? 'PartnerLicense-hqewozhe55bppnhwrlydkxhnka-master' : 'PartnerLicense-ux4plcyf5veite3avotvsue2vq-staging',
      Key: {
        'id': partnerLicenses[i].id
      },
      UpdateExpression: 'set licenseUserID = :i',
      ExpressionAttributeValues: {':i': sub}
    }

    await documentClient.update(licenseParams).promise()
  } 

  //update referrals received (partner agents)
  for(let i = 0 ; i < referralsReceived.length ; i++) {
    const referralParams = {
      TableName: process.env.ENV === 'master' ? 'Referral-hqewozhe55bppnhwrlydkxhnka-master' : 'Referral-ux4plcyf5veite3avotvsue2vq-staging',
      Key: {
        'id': referralsReceived[i].id
      },
      UpdateExpression: 'set referralPartnerAgentID = :i',
      ExpressionAttributeValues: {':i': sub}
    }

    await documentClient.update(referralParams).promise()
  } 

  //update referrals created (roosted agents)
  for(let i = 0 ; i < referralsCreated.length ; i++) {
    const referralParams = {
      TableName: process.env.ENV === 'master' ? 'Referral-hqewozhe55bppnhwrlydkxhnka-master' : 'Referral-ux4plcyf5veite3avotvsue2vq-staging',
      Key: {
        'id': referralsCreated[i].id
      },
      UpdateExpression: 'set referralRoostedAgentID = :i',
      ExpressionAttributeValues: {':i': sub}
    }

    await documentClient.update(referralParams).promise()
  } 


  const deleteParams = {
    TableName: process.env.ENV === 'master' ? 'User-hqewozhe55bppnhwrlydkxhnka-master' : 'User-ux4plcyf5veite3avotvsue2vq-staging',
    Key: {
      'id': req.body.currentDynamoId
    },
  }

  await documentClient.delete(deleteParams).promise()
    
  res.status(200).json({messageSuccess: true})
        
} catch(error) {
  console.log(error)
  res.status(404).json({messageSuccess: false, error: error})
}})


app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app