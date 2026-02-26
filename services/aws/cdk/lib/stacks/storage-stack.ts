import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import { Construct } from 'constructs';

export class StorageStack extends cdk.Stack {
  public readonly contentBucket: s3.Bucket;
  public readonly clipsBucket: s3.Bucket;
  public readonly distribution: cloudfront.Distribution;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 bucket for audio content (stories, soundscapes, meditations)
    this.contentBucket = new s3.Bucket(this, 'ContentBucket', {
      bucketName: `driftlab-content-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 86400,
        },
      ],
    });

    // S3 bucket for user audio clips (recordings, flagged segments)
    // Auto-expires all objects 11 days after creation
    this.clipsBucket = new s3.Bucket(this, 'ClipsBucket', {
      bucketName: `driftlab-clips-${this.account}`,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      versioned: false,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      lifecycleRules: [
        {
          id: 'auto-expire-clips',
          enabled: true,
          expiration: cdk.Duration.days(11),
        },
      ],
      cors: [
        {
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT],
          allowedOrigins: ['*'],
          allowedHeaders: ['*'],
          maxAge: 3600,
        },
      ],
    });

    // CloudFront distribution for content delivery
    this.distribution = new cloudfront.Distribution(
      this,
      'ContentDistribution',
      {
        defaultBehavior: {
          origin:
            origins.S3BucketOrigin.withOriginAccessControl(this.contentBucket),
          viewerProtocolPolicy:
            cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
          allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        },
        priceClass: cloudfront.PriceClass.PRICE_CLASS_100, // US, Canada, Europe
        comment: 'DriftLab Content CDN',
      },
    );

    // Outputs
    new cdk.CfnOutput(this, 'ContentBucketName', {
      value: this.contentBucket.bucketName,
      exportName: 'DriftLab-ContentBucketName',
    });

    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: this.distribution.distributionDomainName,
      exportName: 'DriftLab-CDNDomain',
    });

    new cdk.CfnOutput(this, 'ClipsBucketName', {
      value: this.clipsBucket.bucketName,
      exportName: 'DriftLab-ClipsBucketName',
    });
  }
}
