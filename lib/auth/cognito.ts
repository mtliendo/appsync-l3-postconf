import { Construct } from 'constructs'
import * as awsCognito from 'aws-cdk-lib/aws-cognito'
import {
	IdentityPool,
	UserPoolAuthenticationProvider,
} from '@aws-cdk/aws-cognito-identitypool-alpha'
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs'

type CreateSaasAuth = {
	appName: string
	addUserPostConfirmation?: NodejsFunction
}

export function createSaasAuth(scope: Construct, props: CreateSaasAuth) {
	const userPool = new awsCognito.UserPool(scope, `${props.appName}-userpool`, {
		userPoolName: `${props.appName}-userpool`,
		selfSignUpEnabled: true,
		lambdaTriggers: {
			postConfirmation: props.addUserPostConfirmation,
		},
		accountRecovery: awsCognito.AccountRecovery.PHONE_AND_EMAIL,
		userVerification: {
			emailStyle: awsCognito.VerificationEmailStyle.CODE,
		},
		autoVerify: {
			email: true,
		},
		standardAttributes: {
			email: {
				required: true,
				mutable: true,
			},
		},
	})

	const userPoolClient = new awsCognito.UserPoolClient(
		scope,
		`${props.appName}-userpoolClient`,
		{ userPool }
	)

	const identityPool = new IdentityPool(
		scope,
		`${props.appName}-identityPool`,
		{
			identityPoolName: `${props.appName}IdentityPool`,
			allowUnauthenticatedIdentities: true,
			authenticationProviders: {
				userPools: [
					new UserPoolAuthenticationProvider({
						userPool: userPool,
						userPoolClient: userPoolClient,
					}),
				],
			},
		}
	)

	return { userPool, userPoolClient, identityPool }
}
