// const AWS = require('aws-sdk')
// const region = process.env.REGION
// const documentClient = new AWS.DynamoDB.DocumentClient({region});
// exports.handler = async (event, context, callback) => {
// //const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ apiVersion: '2016-04-18' })
// //insert code to be executed by your lambda trigger
//   const email = event.request.userAttributes.email
//   const params = {
//     TableName: process.env.ENV === 'master' ? 'User-hqewozhe55bppnhwrlydkxhnka-master' : 'User-ux4plcyf5veite3avotvsue2vq-staging',
//     IndexName: 'emailKey',
//     KeyConditionExpression: "email = :email",
//     ExpressionAttributeValues: {":email": email},
//   };
//   documentClient.query(params, function(err, data) {
//   if (err) { 
//   console.log(err);
//     callback('codeFailedQueryingUser');
//   }
//   else {
//   if(data.Items.length === 0) {
//     callback(null, event);
//   } else {
//     callback('codeDifferentProvider');
//   }
//   }});
// };

const AWS = require('aws-sdk');
const cognitoIdp = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});

exports.handler = function(event, context) {
  console.log(JSON.stringify(event));

  // check if email is already in use
  if (event.request.userAttributes.hasOwnProperty('email')) {
    const email = event.request.userAttributes.email;
    
    const params = {
      UserPoolId: event.userPoolId,
      Filter: 'email = "' + email + '"',
    };
    
    cognitoIdp.listUsers(params).promise()
    .then (results => {
      console.log(JSON.stringify(results));
      // if the usernames are the same, dont raise and error here so that
      // cognito will raise the duplicate username error
      if (results.Users.length > 0 && results.Users[0].Username !== event.userName) {
        console.log('Duplicate email address in signup. ' + email);
        context.done(Error('A user with the same email address exists'));
      }
      context.done(null, event);
    })
    .catch (error => {
      console.error(error);
      context.done(error);      
    });
  }
};

// const AWS = require('aws-sdk');
// const cognitoIdp = new AWS.CognitoIdentityServiceProvider({apiVersion: '2016-04-18'});


// const getUserByEmail = async (userPoolId, email) => {
//   const params = {
//     UserPoolId: userPoolId,
//     Filter: `email = "${email}"`
//   }
//   return await cognitoIdp.listUsers(params).promise()
// }

// const linkProviderToUser = async (username, userPoolId, providerName, providerUserId) => {
//   console.log(username)
//   console.log(userPoolId)
//   console.log(providerName)
//   console.log(providerUserId)
//   const params = {
//     DestinationUser: {
//       ProviderAttributeValue: username,
//       ProviderName: 'Cognito'
//     },
//     SourceUser: {
//       ProviderAttributeName: 'Cognito_Subject',
//       ProviderAttributeValue: providerUserId,
//       ProviderName: providerName
//     },
//     UserPoolId: userPoolId
//   }

//   const result = await cognitoIdp.adminLinkProviderForUser(params).promise()
//   console.log(result)
//   return result

// }

// const createNewUser = async (userPooldId, email) => {
//   const params = {
//     UserPoolId: userPooldId, /* required */
//     Username: email, /* required */
//     DesiredDeliveryMediums: [
//         'EMAIL'
//     ],
//     ForceAliasCreation: false,
//     MessageAction: 'SUPPRESS',
//     TemporaryPassword: 'tempPassword1',
//     UserAttributes: [
//         {
//           Name: 'email', /* required */
//           Value: email
//         },
//         {
//           Name: 'email_verified',
//           Value: 'true'
//         }
//     ]
//   };

//   const result = await cognitoIdp.adminCreateUser(params).promise()

//   return result

// }

// exports.handler = async (event, context, callback) => {
//   try {
//   console.log(event)
//   if (event.triggerSource === 'PreSignUp_ExternalProvider') {
//     const userRs = await getUserByEmail(event.userPoolId, event.request.userAttributes.email)
//     console.log(userRs)
//     if (userRs && userRs.Users.length > 0) {
//       const [ providerName, providerUserId ] = event.userName.split('_') // event userName example: "Facebook_12324325436"
//       await linkProviderToUser(userRs.Users[0].Username, event.userPoolId, providerName, providerUserId)
//     } else {
//       const newUser = await createNewUser(event.userPoolId, event.request.userAttributes.email)
//       console.log('Created User: ' + newUser)
//       console.log(newUser)
//       const [ providerName, providerUserId ] = event.userName.split('_') // event userName example: "Facebook_12324325436"
//       console.log('Username: ' + event.userName)
//       console.log('provderName: ' + providerName)
//       console.log(('providerUserId ' + providerUserId))
//       await linkProviderToUser(newUser.User.Username, event.userPoolId, providerName, providerUserId)
//     }
//   }
//   return callback(null, event)
//   }catch(error) {
//     console.log('Adminlink Failed')
//     console.log(error)
//   }
// }