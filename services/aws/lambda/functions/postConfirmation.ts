/**
 * Cognito Post-Confirmation Lambda Trigger
 * Creates a profile row in the database when a user confirms their email
 */

import { PostConfirmationConfirmSignUpTriggerEvent } from 'aws-lambda';

export async function handler(
  event: PostConfirmationConfirmSignUpTriggerEvent,
): Promise<PostConfirmationConfirmSignUpTriggerEvent> {
  // Only run on ConfirmSignUp trigger
  if (event.triggerSource !== 'PostConfirmation_ConfirmSignUp') {
    return event;
  }

  const { sub } = event.request.userAttributes;
  const email = event.request.userAttributes.email;
  const name = event.request.userAttributes.name ?? '';

  try {
    // TODO: Connect to RDS and insert profile
    // For now, log the event
    console.log('Creating profile for user:', {
      cognitoSub: sub,
      email,
      name,
    });

    // When DB is deployed, this will execute:
    // const client = await getDbClient();
    // await client.query(
    //   `INSERT INTO profiles (cognito_sub, email, name)
    //    VALUES ($1, $2, $3)
    //    ON CONFLICT (cognito_sub) DO NOTHING`,
    //   [sub, email, name]
    // );
  } catch (error) {
    console.error('Failed to create profile:', error);
    // Don't throw - we don't want to block the confirmation flow
  }

  return event;
}
