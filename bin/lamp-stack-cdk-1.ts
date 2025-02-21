#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LampStack } from '../lib/lamp-stack-cdk-1-stack';
import {getAwsAccount, getAwsRegion} from '../var.env';

const region: string = getAwsRegion();
const account_id: string = getAwsAccount();

const app = new cdk.App();
new LampStack(app, 'LampStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  env: { account: account_id, region: region },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});