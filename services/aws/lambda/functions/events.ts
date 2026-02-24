/**
 * Events Lambda handler
 * CRUD operations for environment events
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

export async function handler(
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> {
  const userId = event.requestContext.authorizer?.claims?.sub;
  if (!userId) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const method = event.httpMethod;

  try {
    switch (method) {
      case 'GET':
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'List events' }),
        };

      case 'POST':
        return {
          statusCode: 201,
          body: JSON.stringify({ message: 'Create event' }),
        };

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('Events handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
