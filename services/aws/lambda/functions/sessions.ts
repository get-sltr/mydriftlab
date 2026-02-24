/**
 * Sessions Lambda handler
 * CRUD operations for sleep sessions
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
  const sessionId = event.pathParameters?.sessionId;

  try {
    switch (method) {
      case 'GET':
        if (sessionId) {
          // GET /sessions/{sessionId}
          return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Get session', sessionId }),
          };
        }
        // GET /sessions
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'List sessions' }),
        };

      case 'POST':
        // POST /sessions
        return {
          statusCode: 201,
          body: JSON.stringify({ message: 'Create session' }),
        };

      case 'PUT':
        // PUT /sessions/{sessionId}
        return {
          statusCode: 200,
          body: JSON.stringify({ message: 'Update session', sessionId }),
        };

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ error: 'Method not allowed' }),
        };
    }
  } catch (error) {
    console.error('Sessions handler error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
}
