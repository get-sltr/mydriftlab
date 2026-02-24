import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as path from 'path';
import { Construct } from 'constructs';

interface ApiStackProps extends cdk.StackProps {
  userPool: cognito.UserPool;
  userPoolClient: cognito.UserPoolClient;
  database: rds.DatabaseInstance;
  dbSecret: secretsmanager.ISecret;
  vpc: ec2.Vpc;
  lambdaSecurityGroup: ec2.SecurityGroup;
  contentBucket: s3.Bucket;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const { userPool, database, dbSecret, vpc, lambdaSecurityGroup, contentBucket } = props;

    // Shared Lambda environment variables
    const lambdaEnv = {
      DB_SECRET_ARN: dbSecret.secretArn,
      DB_HOST: database.dbInstanceEndpointAddress,
      DB_PORT: database.dbInstanceEndpointPort,
      DB_NAME: 'driftlab',
      CONTENT_BUCKET: contentBucket.bucketName,
    };

    // API Gateway with Cognito authorizer
    const api = new apigateway.RestApi(this, 'DriftLabApi', {
      restApiName: 'DriftLab API',
      description: 'DriftLab REST API',
      deployOptions: {
        stageName: 'v1',
        throttlingBurstLimit: 100,
        throttlingRateLimit: 50,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'Authorization'],
      },
    });

    // Cognito authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      'DriftLabAuthorizer',
      {
        cognitoUserPools: [userPool],
        authorizerName: 'DriftLabCognitoAuth',
      },
    );

    const authMethodOptions: apigateway.MethodOptions = {
      authorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
    };

    // Helper to create Lambda functions
    const createFunction = (name: string, handler: string) => {
      const fn = new lambda.Function(this, name, {
        functionName: `driftlab-${name.toLowerCase()}`,
        runtime: lambda.Runtime.NODEJS_20_X,
        handler,
        code: lambda.Code.fromAsset(
          path.join(__dirname, '../../../lambda/functions'),
        ),
        memorySize: 256,
        timeout: cdk.Duration.seconds(30),
        vpc,
        vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
        securityGroups: [lambdaSecurityGroup],
        environment: lambdaEnv,
      });

      dbSecret.grantRead(fn);
      return fn;
    };

    // --- Sessions API ---
    const sessionsHandler = createFunction('Sessions', 'sessions.handler');
    const sessions = api.root.addResource('sessions');
    sessions.addMethod(
      'GET',
      new apigateway.LambdaIntegration(sessionsHandler),
      authMethodOptions,
    );
    sessions.addMethod(
      'POST',
      new apigateway.LambdaIntegration(sessionsHandler),
      authMethodOptions,
    );

    const sessionById = sessions.addResource('{sessionId}');
    sessionById.addMethod(
      'GET',
      new apigateway.LambdaIntegration(sessionsHandler),
      authMethodOptions,
    );
    sessionById.addMethod(
      'PUT',
      new apigateway.LambdaIntegration(sessionsHandler),
      authMethodOptions,
    );

    // --- Events API ---
    const eventsHandler = createFunction('Events', 'events.handler');
    const events = api.root.addResource('events');
    events.addMethod(
      'GET',
      new apigateway.LambdaIntegration(eventsHandler),
      authMethodOptions,
    );
    events.addMethod(
      'POST',
      new apigateway.LambdaIntegration(eventsHandler),
      authMethodOptions,
    );

    // --- Content API ---
    const contentHandler = createFunction('Content', 'content.handler');
    const content = api.root.addResource('content');
    content.addMethod(
      'GET',
      new apigateway.LambdaIntegration(contentHandler),
      authMethodOptions,
    );
    contentBucket.grantRead(contentHandler);

    // --- Profile API ---
    const profileHandler = createFunction('Profile', 'profile.handler');
    const profile = api.root.addResource('profile');
    profile.addMethod(
      'GET',
      new apigateway.LambdaIntegration(profileHandler),
      authMethodOptions,
    );
    profile.addMethod(
      'PUT',
      new apigateway.LambdaIntegration(profileHandler),
      authMethodOptions,
    );

    // --- Experiments API ---
    const experimentsHandler = createFunction(
      'Experiments',
      'experiments.handler',
    );
    const experiments = api.root.addResource('experiments');
    experiments.addMethod(
      'GET',
      new apigateway.LambdaIntegration(experimentsHandler),
      authMethodOptions,
    );
    experiments.addMethod(
      'POST',
      new apigateway.LambdaIntegration(experimentsHandler),
      authMethodOptions,
    );

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      exportName: 'DriftLab-ApiUrl',
    });
  }
}
