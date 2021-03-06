import NodeRSA from 'node-rsa';
import axios from 'axios';
import bcrypt from 'bcrypt';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import qs from 'querystring';
import { verify } from 'jsonwebtoken';
import { i18n } from 'i18next';
import { Context } from '../context';

declare type ReqI18n = Express.Request & i18n;

const SALT_ROUND = 10;

const { REDIRECT_URL, JWT_SECRET = 'undefined', JWT_SECRET_ETC = 'etc' } = process.env;
export const APP_SECRET = JWT_SECRET;
export const APP_SECRET_ETC = JWT_SECRET_ETC;

interface Token {
  userId: number;
}

export function getUserId(context: Context): number | undefined {
  const Authorization = context.request.req.get('Authorization');
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');
    const verifiedToken = verify(token, APP_SECRET) as Token;
    return verifiedToken && verifiedToken.userId;
  }
  return undefined;
}

export const validateEmail = (email: string): boolean => {
  // eslint-disable-next-line max-len
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
};

interface GoogleUser {
  iss: string;
  sub: string;
  azp: string;
  aud: string;
  iat: number | string;
  exp: number | string;

  /* eslint-disable */
  email?: string;
  email_verified?: boolean | string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  /* eslint-enable */
}

/**
 * Verify google token and return user
 * @param token
 * @returns GoogleUser
 */

export const verifyGoogleId = async (token: string): Promise<GoogleUser> => {
  const { data } = await axios.get(
    `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`,
  );

  return data as GoogleUser;
};

interface FacebookUser {
  id: string;
  name: string;
  email: string;
}

export const verifyFacebookId = async (accessToken: string): Promise<FacebookUser> => {
  const { data } = await axios.get(
    'https://graph.facebook.com/v7.0/me',
    {
      params: {
        access_token: accessToken,
        fields: 'id,name,email',
      },
    },
  );

  return data as FacebookUser;
};

const getApplePublicKey = async () => {
  const { data } = await axios.get(
    'https://appleid.apple.com/auth/keys',
  );

  const key = JSON.parse(data).keys[0];

  const pubKey = new NodeRSA();
  pubKey.importKey({ n: Buffer.from(key.n, 'base64'), e: Buffer.from(key.e, 'base64') }, 'components-public');
  return pubKey.exportKey('public');
};

interface AppleUser {
  iss: string;
  sub: string;
  aud: string;
  iat: number | string;
  exp: number | string;

  nonce: string;

  /* eslint-disable */
  nonce_supported: boolean;
  email: string;
  email_verified: boolean | string;
  is_private_email: boolean;
  real_user_status: number;
  /* eslint-enable */
}

/**
 * Verify apple token and return user
 * @param token
 * @returns AppleUser
 */

export const verifyAppleId = async (idToken: string): Promise<AppleUser> => {
  const clientID = 'dev.hackatalk';
  const TOKEN_ISSUER = 'https://appleid.apple.com';

  const applePublicKey = await getApplePublicKey();
  const appleUser = verify(idToken, applePublicKey, { algorithms: ['RS256'] }) as AppleUser;

  if (appleUser.iss !== TOKEN_ISSUER) {
    throw new Error(
      `id token is not issued by: ${TOKEN_ISSUER} | from: + ${appleUser.iss}`,
    );
  }
  if (clientID !== undefined && appleUser.aud !== clientID) {
    throw new Error(
      `parameter does not include: ${appleUser.aud} | expected: ${clientID}`,
    );
  }
  if (appleUser.exp < (Date.now() / 1000)) throw new Error('id token has expired');

  return appleUser;
};

export const encryptCredential = async (password: string): Promise<string> => {
  const SALT = await bcrypt.genSalt(SALT_ROUND);
  const hash = await bcrypt.hash(password, SALT);
  // Fix the 404 ERROR that occurs when the hash contains 'slash' or 'dot' value
  return hash.replace(/\//g, 'slash').replace(/\.$/g, 'dot');
};

export const validateCredential = async (
  value: string,
  hashedValue: string,
): Promise<boolean> => new Promise<boolean>((resolve, reject) => {
  // Fix the 404 ERROR that occurs when the hash contains 'slash' or 'dot' value
  let encrypted = hashedValue;
  encrypted = encrypted.replace(/slash/g, '/');
  encrypted = encrypted.replace(/dot$/g, '.');

  bcrypt.compare(value, encrypted, (err, res) => {
    if (err) {
      return reject(err);
    }
    resolve(res);
    return undefined;
  });
});

export const getEmailVerificationHTML = (
  verificationToken: string,
  req: ReqI18n,
): string => {
  const templateString = fs.readFileSync(
    path.resolve(__dirname, '../../html/email_verification.html'),
    'utf-8',
  );

  const rendered = ejs.render(templateString, {
    REDIRECT_URL: `${REDIRECT_URL}/verify_email/${verificationToken}`,
    WELCOME_SIGNUP: req.t('WELCOME_SIGNUP'),
    WELCOME: req.t('WELCOME'),
    VERIFY_EMAIL: req.t('VERIFY_EMAIL'),
    MESSAGE_SENT_ONLY: req.t('MSG_SENT_ONLY'),
    SERVICE_CENTER: req.t('SERVICE_CENTER'),
  });

  return rendered;
};

export const getPasswordResetHTML = (
  token: string,
  password: string,
  req: ReqI18n,
): string => {
  const templateString = fs.readFileSync(
    path.resolve(__dirname, '../../html/password_reset.html'),
    'utf-8',
  );

  const rendered = ejs.render(templateString, {
    REDIRECT_URL: `${REDIRECT_URL}/reset_password/${token}/${qs.escape(password)}`,
    HELLO: req.t('HELLO'),
    CLICK_TO_RESET_PW: req.t('CLICK_TO_RESET_PW'),
    PASSWORD: req.t('PASSWORD'),
    CHANGE_PASSWORD: req.t('CHANGE_PASSWORD'),
    MSG_SENT_ONLY: req.t('MSG_SENT_ONLY'),
    SERVICE_CENTER: req.t('SERVICE_CENTER'),
    randomPassword: password,
  });

  return rendered;
};

// eslint-disable-next-line
export const getToken = (req: Request & any): string | undefined => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    return undefined;
  }

  return authHeader.replace('Bearer ', '');
};
