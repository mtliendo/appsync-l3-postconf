#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { MicroSaaSStack } from '../lib/appsync-l3-postconf-stack'

const app = new cdk.App()
new MicroSaaSStack(app, 'MicroSaaSStackTest', {
	env: { account: '842537737558', region: 'us-east-1' },
})
