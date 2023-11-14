//roostedv3LambdaRole6ee4f2e8-staging
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
        
        //find all the expired userIDs and store them in "items"
        let params = {
            TableName: process.env.ENV === 'master' ? 'RoostedLicense-hqewozhe55bppnhwrlydkxhnka-master' : 'RoostedLicense-ux4plcyf5veite3avotvsue2vq-staging',
            ProjectionExpression: "licenseUserID",
            FilterExpression: "#licenseExpiration < :today and licenseVerificationStatus = :verified",
            ExpressionAttributeNames: {
                "#licenseExpiration": "licenseExpiration",
            },
            ExpressionAttributeValues: {
                ":today": new Date().toISOString(),
                ":verified": 'verified'
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
                ExpressionAttributeValues: {":id": items[i].licenseUserID},
            };
            const user = await documentClient.query(params).promise()

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
                    "roostedAgentFirstName": user.Items[0].userFirstName,
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
                "template_id": 'd-f803f96d3be540cbb406fa554c0cefbc'
            });
        }
        response = {
            statusCode: 200,
            body: JSON.stringify('License Expired Query Succeed')
        }
        return response;

    } catch(error) {
        console.log(error)
        let response = {
            statusCode: 400,
            body: JSON.stringify('License Expired Query Failed')
        }
        return response
    }
}

