import { createAddUserFunc } from './addUserPostConfirmation/construct'
import * as cdk from 'aws-cdk-lib'
import { createSaasAuth } from './auth/cognito'
import { createAmplifyGraphqlApi } from './api/appsync'
import { UserPoolOperation } from 'aws-cdk-lib/aws-cognito'

export class MicroSaaSStack extends cdk.Stack {
	constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		const context = {
			appName: 'micro-saas-test',
		}

		const cognito = createSaasAuth(this, {
			appName: context.appName,
		})

		const amplifyGraphQLAPI = createAmplifyGraphqlApi(this, {
			appName: context.appName,
			userpool: cognito.userPool,
			authenticatedRole: cognito.identityPool.authenticatedRole,
			unauthenticatedRole: cognito.identityPool.unauthenticatedRole,
		})

		const addUserFunc = createAddUserFunc(this, {
			appName: context.appName,
			userDBARN: amplifyGraphQLAPI.resources.cfnTables['UserTable'].attrArn,
			environmentVars: {
				userDBTableName:
					amplifyGraphQLAPI.resources.cfnTables['UserTable'].tableName!,
			},
		})

		cognito.userPool.addTrigger(
			UserPoolOperation.POST_CONFIRMATION,
			addUserFunc
		)
	}
}
