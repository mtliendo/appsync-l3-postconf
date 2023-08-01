import { createAddUserFunc } from './addUserPostConfirmation/construct'
import * as cdk from 'aws-cdk-lib'
import { createSaasAuth } from './auth/cognito'
import { createAmplifyGraphqlApi } from './api/appsync'
import { CfnUserPool } from 'aws-cdk-lib/aws-cognito'

export class MicroSaaSStack extends cdk.Stack {
	constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
		super(scope, id, props)

		const context = {
			appName: 'micro-saas-test2',
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

		new cdk.CfnOutput(this, 'addUserFuncArn', {
			value: addUserFunc.functionArn,
		})

		const l1Pool = cognito.userPool.node.defaultChild as CfnUserPool
		l1Pool.lambdaConfig = {
			postConfirmation: `arn:aws:lambda:${this.region}:${this.account}:function:${context.appName}-addUserFunc`,
		}
	}
}
