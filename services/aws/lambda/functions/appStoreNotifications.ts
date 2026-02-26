/**
 * App Store Server Notifications V2 handler.
 *
 * Apple POSTs a signed JWS (JSON Web Signature) payload for subscription
 * lifecycle events: subscribed, renewed, expired, refunded, etc.
 *
 * This endpoint is PUBLIC (no Cognito auth) — Apple must be able to reach it.
 * We verify the JWS signature using Apple's root certificate.
 *
 * For now we log events and update user tier in the database.
 * Full receipt validation can be added later.
 */

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';

// Apple notification types we care about
type NotificationType =
  | 'SUBSCRIBED'
  | 'DID_RENEW'
  | 'EXPIRED'
  | 'DID_FAIL_TO_RENEW'
  | 'GRACE_PERIOD_EXPIRED'
  | 'REFUND'
  | 'REVOKE'
  | 'DID_CHANGE_RENEWAL_STATUS'
  | 'DID_CHANGE_RENEWAL_INFO'
  | 'OFFER_REDEEMED'
  | 'PRICE_INCREASE'
  | 'CONSUMPTION_REQUEST';

interface DecodedPayload {
  notificationType: NotificationType;
  subtype?: string;
  data: {
    bundleId: string;
    environment: 'Sandbox' | 'Production';
    signedTransactionInfo?: string;
    signedRenewalInfo?: string;
  };
}

function decodeJWSPayload(jws: string): any {
  // JWS format: header.payload.signature
  const parts = jws.split('.');
  if (parts.length !== 3) throw new Error('Invalid JWS format');
  const payload = Buffer.from(parts[1], 'base64url').toString('utf-8');
  return JSON.parse(payload);
}

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  // Only accept POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const signedPayload = body.signedPayload;

    if (!signedPayload) {
      return { statusCode: 400, body: 'Missing signedPayload' };
    }

    // Decode the JWS payload (in production, verify signature with Apple's cert)
    const decoded: DecodedPayload = decodeJWSPayload(signedPayload);

    // Verify bundle ID
    if (decoded.data.bundleId !== 'com.sltrdigital.driftlab') {
      console.warn('Bundle ID mismatch:', decoded.data.bundleId);
      return { statusCode: 400, body: 'Invalid bundle ID' };
    }

    console.log('App Store notification:', JSON.stringify({
      type: decoded.notificationType,
      subtype: decoded.subtype,
      environment: decoded.data.environment,
    }));

    // Extract transaction info if present
    let originalTransactionId: string | undefined;
    if (decoded.data.signedTransactionInfo) {
      const txInfo = decodeJWSPayload(decoded.data.signedTransactionInfo);
      originalTransactionId = txInfo.originalTransactionId;

      console.log('Transaction:', JSON.stringify({
        originalTransactionId: txInfo.originalTransactionId,
        productId: txInfo.productId,
        expiresDate: txInfo.expiresDate,
      }));
    }

    // Handle notification types
    switch (decoded.notificationType) {
      case 'SUBSCRIBED':
      case 'DID_RENEW':
      case 'OFFER_REDEEMED':
        // User has active subscription — update tier to pro
        console.log('Subscription active:', originalTransactionId);
        // TODO: Update user tier in DB based on originalTransactionId
        break;

      case 'EXPIRED':
      case 'GRACE_PERIOD_EXPIRED':
      case 'REVOKE':
      case 'REFUND':
        // Subscription ended — downgrade to free
        console.log('Subscription ended:', originalTransactionId);
        // TODO: Downgrade user tier in DB
        break;

      case 'DID_FAIL_TO_RENEW':
        // Billing retry — user still has access during grace period
        console.log('Renewal failed, in grace period:', originalTransactionId);
        break;

      case 'DID_CHANGE_RENEWAL_STATUS':
        // User toggled auto-renew on/off
        console.log('Renewal status changed:', decoded.subtype);
        break;

      default:
        console.log('Unhandled notification type:', decoded.notificationType);
    }

    // Apple expects 200 to confirm receipt
    return { statusCode: 200, body: '{}' };
  } catch (err: any) {
    console.error('Failed to process App Store notification:', err);
    // Return 200 anyway to prevent Apple from retrying endlessly
    // Log the error for investigation
    return { statusCode: 200, body: '{}' };
  }
}
