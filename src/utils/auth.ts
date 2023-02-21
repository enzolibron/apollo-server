/**
 * The utils function for managing the authentication process
 * @module utils/auth
 */

import { GraphQLError } from 'graphql';
import jwt from 'jsonwebtoken';
import jwtDecode from 'jwt-decode';

/**
 * Manage the utils function for the auth
 **/
const authUtil = {
  /**
   * Return the secret key to be use with JWT
   **/
  getSecret() {
    const secretJwt: string | undefined = process.env.SECRET_KEY;
    if (secretJwt) {
      return Buffer.from(secretJwt, 'base64');
    }
    return undefined;
  },
  /**
   * Return the token from the bearer token
   **/
  getTokenFromBearer(bearerToken: string): string | null {
    return bearerToken !== null && bearerToken.split(' ')[0] === 'Bearer'
      ? bearerToken.split(' ')[1]
      : null;
  },

  /**
   * Decode a token using the secret key
   **/
  decodeToken(token: string) {
    const secret = this.getSecret();
    if (secret) {
      return jwt.decode(token);
    }
  },
  /**
   * Decode an unisgned token
   **/
  decodeUnsignedToken(token: string) {
    return jwtDecode(token);
  },
  /**
   * Read the token and check is validity and if it expires
   **/
  readTokenFromContext(context: any) {
    const token = this.getTokenFromBearer(context.token);

    if (!token) {
      if (context === null) {
        throw new GraphQLError('Please provide a context');
      }

      const bearerToken = context.auth;
      if (bearerToken === null) {
        throw new GraphQLError('You dont have a bearer token.');
      }

      if (bearerToken.split(' ')[0] !== 'Bearer') {
        throw new GraphQLError('Your token is not a bearer token.');
      }

      throw new GraphQLError('Not Authorized.');
    }

    const payload: any = this.decodeToken(token);
    if (Date.now() > payload.exp * 1000) {
      throw new GraphQLError('The token expired.');
    }

    return payload;
  },
};

export { authUtil };
