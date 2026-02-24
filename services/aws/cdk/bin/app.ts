#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AuthStack } from '../lib/stacks/auth-stack';
import { DatabaseStack } from '../lib/stacks/database-stack';
import { ApiStack } from '../lib/stacks/api-stack';
import { StorageStack } from '../lib/stacks/storage-stack';

const app = new cdk.App();

const env = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
};

const authStack = new AuthStack(app, 'DriftLab-Auth', { env });

const databaseStack = new DatabaseStack(app, 'DriftLab-Database', { env });

const storageStack = new StorageStack(app, 'DriftLab-Storage', { env });

new ApiStack(app, 'DriftLab-Api', {
  env,
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
  database: databaseStack.database,
  dbSecret: databaseStack.dbSecret,
  vpc: databaseStack.vpc,
  lambdaSecurityGroup: databaseStack.lambdaSecurityGroup,
  contentBucket: storageStack.contentBucket,
});
