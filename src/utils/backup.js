
const aws = require('aws-sdk');
const region = process.env.REGION
const documentClient = new aws.DynamoDB.DocumentClient({region});

exports.handler = async (event, context, callback) => {

    if ( event.triggerSource === "UserMigration_Authentication" ) {

        // authenticate the user with your existing user directory service
        //user = authenticateUser(event.userName, event.request.password);
        //find the user
        const email = event.userName
        const params = {
            TableName: process.env.ENV === 'master' ? 'User-hqewozhe55bppnhwrlydkxhnka-master' : 'User-ux4plcyf5veite3avotvsue2vq-staging',
            IndexName: 'emailKey',
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {":email": email},
        };
        const user = await documentClient.query(params).promise()

        if ( user ) {
            event.response.userAttributes = {
                "email": user.emailAddress,
                "email_verified": "true"
            };
            event.response.finalUserStatus = "CONFIRMED";
            event.response.messageAction = "SUPPRESS";
            context.succeed(event);
        }
        else {
            // Return error to Amazon Cognito
            callback("Bad password");
        }
    }
    else if ( event.triggerSource === "UserMigration_ForgotPassword" ) {

        // Lookup the user in your existing user directory service
        const email = event.userName
        const params = {
            TableName: process.env.ENV === 'master' ? 'User-hqewozhe55bppnhwrlydkxhnka-master' : 'User-ux4plcyf5veite3avotvsue2vq-staging',
            IndexName: 'emailKey',
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {":email": email},
        };
        const user = await documentClient.query(params).promise()

        if ( user ) {
            event.response.userAttributes = {
                "email": user.emailAddress,
                // required to enable password-reset code to be sent to user
                "email_verified": "true"  
            };
            event.response.messageAction = "SUPPRESS";
            context.succeed(event);
        }
        else {
            // Return error to Amazon Cognito
            callback("Bad password");
        }
    }
    else { 
        // Return error to Amazon Cognito
        callback("Bad triggerSource " + event.triggerSource);
    }
};
