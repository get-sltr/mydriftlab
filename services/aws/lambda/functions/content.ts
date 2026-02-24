/**
 * Content Lambda handler
 * Read operations for content items
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const userId = event.requestContext.authorizer?.claims?.sub;
  if (!userId) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  try {
    const type = event.queryStringParameters?.type;
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'List content', type }),
    };
  } catch (error) {
    console.error('Content handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
