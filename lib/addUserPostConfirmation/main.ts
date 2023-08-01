import * as AWS from 'aws-sdk'
import { PostConfirmationConfirmSignUpTriggerEvent } from 'aws-lambda'

const docClient = new AWS.DynamoDB.DocumentClient()

exports.handler = async (event: PostConfirmationConfirmSignUpTriggerEvent) => {
	const date = new Date()
	const isoDate = date.toISOString()

	const user = event.request.userAttributes

	//construct the param
	const params = {
		TableName: process.env.UserTableName as string,
		Item: {
			__typename: 'User',
			id: user.sub,
			createdAt: isoDate, // ex) 2023-02-16T16:07:14.189Z
			updatedAt: isoDate,
			username: event.userName,
			email: user.email,
		},
	}

	//try to add to the DB, otherwise throw an error
	try {
		await docClient.put(params).promise()
		return event
	} catch (err) {
		console.log(err)
		return event
	}
}
