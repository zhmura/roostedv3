
//roostedv3LambdaRole019e2df5-staging
const aws = require('aws-sdk');
const region = process.env.REGION
const documentClient = new aws.DynamoDB.DocumentClient({region});

//USE THIS FOR SEND GRID INTEGRATION
const sgMail = require('@sendgrid/mail');

//SET SEND GRID API KEY
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async (event) => {

    try {
        let response = {};
        
        const getClientStatusStepsObject = (step) => {
            const statusObject = 
            {
                new: 'New Referral', 
                clientContacted: 'Client Contacted', 
                agreementSignedBuyer: 'Buyer Agreement Signed', 
                agreementSignedSeller: 'Listing Agreement Signed',
                touring: 'Touring', 
                underContract: 'Under Contract', 
                clientLost: 'Client Lost',
                closed: 'Closed',
                listed: 'Home Listed',
                reviewingOffers: 'Reviewing Offers',
            }
        return statusObject[step]
  
}
        
        let thirtyDaysPrior = new Date();
        thirtyDaysPrior.setDate(thirtyDaysPrior.getDate() - 30)
        
        //find all the expired userIDs and store them in "items"
        let params = {
            TableName: process.env.ENV === 'master' ? 'Referral-hqewozhe55bppnhwrlydkxhnka-master' : 'Referral-ux4plcyf5veite3avotvsue2vq-staging',
            ProjectionExpression: "referralPartnerAgentID, referralClientID, referralClientStatus, id",
            FilterExpression: "#updatedAt < :thirtyDaysPrior and referralStatus <> :clientLost and referralStatus <> :closed and referralUpdateReminder <> :referralUpdateReminder",
            ExpressionAttributeNames: {
                "#updatedAt": "updatedAt",
            },
            ExpressionAttributeValues: {
                ":thirtyDaysPrior": thirtyDaysPrior.toISOString(),
                ":clientLost": 'clientLost',
                ":closed": 'closed',
                ":referralUpdateReminder": true
            }
        };
    
        let items = []

        let result = await documentClient.scan(params).promise()
        items = items.concat(result.Items);
        console.log(new Date().toISOString())
        console.log("Logging Result")
        console.log(result)
        
        while(result.LastEvaluatedKey) {
            params.ExclusiveStartKey = result.LastEvaluatedKey
            result = await documentClient.scan(params).promise()
            items = items.concat(result.Items);
        }
        console.log("Logging Items")
        console.log(items)
        //use the items array to find all the expired users emails and names by looking up theier userIDs in users
        for (let i = 0; i < items.length; i++) {

            const params = {
                TableName: process.env.ENV === 'master' ? 'User-hqewozhe55bppnhwrlydkxhnka-master' : 'User-ux4plcyf5veite3avotvsue2vq-staging',
                KeyConditionExpression: "id = :id",
                ExpressionAttributeValues: {":id": items[i].referralPartnerAgentID},
            };
            const user = await documentClient.query(params).promise()
            
            const clientParams = {
                TableName: process.env.ENV === 'master' ? 'Client-hqewozhe55bppnhwrlydkxhnka-master' : 'Client-ux4plcyf5veite3avotvsue2vq-staging',
                KeyConditionExpression: "id = :id",
                ExpressionAttributeValues: {":id": items[i].referralClientID},
            };
            const client = await documentClient.query(clientParams).promise()

            //send the sendgrid email
            await sgMail.send({
                "personalizations": [
                {
                    "to": [
                    {
                        "email": user.Items[0].email,
                        "name": user.Items[0].userFirstName + ' ' + user.Items[0].userLastName
                    }
                    ],
                    "dynamic_template_data": {
                    "partnerAgentFirstName": user.Items[0].userFirstName,
                    "clientFirstName": client.Items[0].clientFirstName,
                    "clientLastName": client.Items[0].clientLastName,
                    "referralClientStatus": getClientStatusStepsObject(items[i].referralClientStatus),
                    "referralURL": `https://app.roosted.io/referrals/details/partner/${items[i].id}/referraldata`,
                    },
                }
                ],
                "from": {
                "email": "support@roosted.io",
                "name": "Roosted"
                },
                "reply_to": {
                "email": 'support@roosted.io',
                "name": "Roosted"
                },
                "template_id": 'd-18c71850fabb45c88be277ea60003bd2'
            });

            const referralParams = {
                TableName: process.env.ENV === 'master' ? 'Referral-hqewozhe55bppnhwrlydkxhnka-master' : 'Referral-ux4plcyf5veite3avotvsue2vq-staging',
                Key: {
                  'id': items[i].id
                },
                UpdateExpression: 'set referralUpdateReminder = :i',
                ExpressionAttributeValues: {':i': true}
            }
          
            await documentClient.update(referralParams).promise()

        }

        response = {
            statusCode: 200,
            body: JSON.stringify('Status Update Query Succeeded')
        }
        return response;

    } catch(error) {
        console.log(error)
        let response = {
            statusCode: 400,
            body: JSON.stringify('Status Upate Query Failed')
        }
        return response
    }
}

