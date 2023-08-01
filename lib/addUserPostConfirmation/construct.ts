import * as aws_iam from 'aws-cdk-lib/aws-iam'
import { Runtime } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'
import path = require('path')

type CreateAddUserFuncProps = {
	userDBARN: string
	appName: string
	environmentVars: {
		userDBTableName: string
	}
}
export const createAddUserFunc = (
	scope: Construct,
	props: CreateAddUserFuncProps
) => {
	const addUserFunc = new NodejsFunction(
		scope,
		`${props.appName}-addUserFunc`,
		{
			functionName: `${props.appName}-addUserFunc`,
			runtime: Runtime.NODEJS_16_X,
			handler: 'handler',
			entry: path.join(__dirname, `./main.ts`),
			environment: {
				UserTableName: props.environmentVars.userDBTableName,
			},
		}
	)

	addUserFunc.addToRolePolicy(
		new aws_iam.PolicyStatement({
			actions: ['dynamodb:PutItem'],
			resources: [props.userDBARN],
		})
	)
	return addUserFunc
}
