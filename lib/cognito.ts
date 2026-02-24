/**
 * Cognito configuration
 * Values are populated after CDK deployment via environment variables
 * For local dev, set these in .env or app.json extra
 */

import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserSession,
  CognitoUserAttribute,
} from 'amazon-cognito-identity-js';

const USER_POOL_ID = process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID ?? '';
const CLIENT_ID = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID ?? '';

let userPool: CognitoUserPool | null = null;

export function getUserPool(): CognitoUserPool {
  if (!userPool) {
    if (!USER_POOL_ID || !CLIENT_ID) {
      console.warn(
        'Cognito not configured. Set EXPO_PUBLIC_COGNITO_USER_POOL_ID and EXPO_PUBLIC_COGNITO_CLIENT_ID.',
      );
    }
    userPool = new CognitoUserPool({
      UserPoolId: USER_POOL_ID,
      ClientId: CLIENT_ID,
    });
  }
  return userPool;
}

export function getCognitoUser(email: string): CognitoUser {
  return new CognitoUser({
    Username: email,
    Pool: getUserPool(),
  });
}

export function signUp(
  email: string,
  password: string,
  name: string,
): Promise<CognitoUser> {
  return new Promise((resolve, reject) => {
    const attributes = [
      new CognitoUserAttribute({ Name: 'email', Value: email }),
      new CognitoUserAttribute({ Name: 'name', Value: name }),
    ];

    getUserPool().signUp(email, password, attributes, [], (err, result) => {
      if (err) return reject(err);
      if (!result) return reject(new Error('No result from sign up'));
      resolve(result.user);
    });
  });
}

export function confirmSignUp(
  email: string,
  code: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const user = getCognitoUser(email);
    user.confirmRegistration(code, true, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
}

export function resendConfirmation(email: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const user = getCognitoUser(email);
    user.resendConfirmationCode((err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

export function signIn(
  email: string,
  password: string,
): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    const user = getCognitoUser(email);
    const authDetails = new AuthenticationDetails({
      Username: email,
      Password: password,
    });

    user.authenticateUser(authDetails, {
      onSuccess: (session) => resolve(session),
      onFailure: (err) => reject(err),
      newPasswordRequired: () =>
        reject(new Error('New password required')),
    });
  });
}

export function signOut(email: string): void {
  const user = getCognitoUser(email);
  user.signOut();
}

export function getCurrentSession(): Promise<CognitoUserSession | null> {
  return new Promise((resolve) => {
    const user = getUserPool().getCurrentUser();
    if (!user) return resolve(null);

    user.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err || !session) return resolve(null);
        if (!session.isValid()) return resolve(null);
        resolve(session);
      },
    );
  });
}

export function refreshSession(
  email: string,
): Promise<CognitoUserSession> {
  return new Promise((resolve, reject) => {
    const user = getCognitoUser(email);
    user.getSession(
      (err: Error | null, session: CognitoUserSession | null) => {
        if (err) return reject(err);
        if (!session) return reject(new Error('No session'));

        const refreshToken = session.getRefreshToken();
        user.refreshSession(refreshToken, (refreshErr, newSession) => {
          if (refreshErr) return reject(refreshErr);
          resolve(newSession);
        });
      },
    );
  });
}

/** Extract user sub (UUID) from JWT */
export function getUserSub(session: CognitoUserSession): string {
  return session.getIdToken().payload.sub;
}

/** Get JWT access token string */
export function getAccessToken(session: CognitoUserSession): string {
  return session.getAccessToken().getJwtToken();
}

/** Get JWT ID token string */
export function getIdToken(session: CognitoUserSession): string {
  return session.getIdToken().getJwtToken();
}
