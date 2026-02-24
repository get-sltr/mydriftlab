import * as cdk from 'aws-cdk-lib';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as path from 'path';
import { Construct } from 'constructs';

export class AuthStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Post-confirmation Lambda trigger (creates profile on sign-up)
    const postConfirmationFn = new lambda.Function(
      this,
      'PostConfirmation',
      {
        functionName: 'driftlab-post-confirmation',
        runtime: lambda.Runtime.NODEJS_20_X,
        handler: 'postConfirmation.handler',
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../../../lambda/functions'),
        ),
        memorySize: 128,
        timeout: cdk.Duration.seconds(10),
      },
    );

    // Cognito User Pool with email sign-up
    this.userPool = new cognito.UserPool(this, 'DriftLabUserPool', {
      userPoolName: 'driftlab-users',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      autoVerify: {
        email: true,
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true,
        },
        fullname: {
          required: false,
          mutable: true,
        },
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireUppercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      mfa: cognito.Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: false,
        otp: true,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      lambdaTriggers: {
        postConfirmation: postConfirmationFn,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // App client
    this.userPoolClient = this.userPool.addClient('DriftLabAppClient', {
      userPoolClientName: 'driftlab-app',
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
      preventUserExistenceErrors: true,
      accessTokenValidity: cdk.Duration.hours(1),
      idTokenValidity: cdk.Duration.hours(1),
      refreshTokenValidity: cdk.Duration.days(30),
    });

    // Outputs
    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
      exportName: 'DriftLab-UserPoolId',
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: this.userPoolClient.userPoolClientId,
      exportName: 'DriftLab-UserPoolClientId',
    });
  }
}
