import { mutationField, stringArg } from '@nexus/schema';
import { Context } from 'context';
import { NexusGenRootTypes } from 'generated/nexus';
import { sign } from 'jsonwebtoken';

import {
  ErrorPhoneNumberForUserExists, ErrorPhoneNumberNotValid, ErrorPhoneNumberSentFailed, ErrorPasswordIncorrect, ErrorString,
} from 'utils/error';

import {
  APP_SECRET,
  encryptCredential,
  getEmailVerificationHTML,
  getPasswordResetHTML,
  getUserId,
  validateCredential,
  validateEmail,
  verifyAppleId,
  verifyFacebookId,
  verifyGoogleId,
} from '../../../utils/auth';
import { AuthType, Gender } from '../../models/Scalar';
import {
  USER_SIGNED_IN,
  USER_UPDATED,
} from './subscription';

interface SocialUserInput {
  socialId: string;
  authType: AuthType;
  name: string;
  phoneNumber: string;
  birthday?: Date;
  gender?: Gender;
}

export const signUp = mutationField('signUp', {
  type: 'User',
  args: {
    user: 'UserCreateInput',
  },
  resolve: async (_, { user }, ctx) => {
    const {
      phoneNumber,
      password,
      name,
      photoURL,
      photoURL2,
      birthday,
      gender,
      weight,
      height,
      isGlasses,
      isTattoo,
      isDyeing,
    } = user!;
    const hashedPassword = await encryptCredential(password);
    const created = await ctx.prisma.user.create({
      data: {
        phoneNumber,
        password: hashedPassword,
        name,
        photoURL,
        photoURL2,
        birthday,
        gender,
        weight,
        height,
        isGlasses,
        isTattoo,
        isDyeing,
      },
    });
    return created;
  },
});

export const signInPhoneNumber = mutationField('signInPhoneNumber', {
  type: 'AuthPayload',
  args: {
    phoneNumber: stringArg({ nullable: false }),
    password: stringArg({ nullable: false }),
  },
  resolve: async (_, { phoneNumber, password }, ctx) => {
    const { pubsub } = ctx;
    const user = await ctx.prisma.user.findOne({
      where: {
        phoneNumber,
      },
    });

    if (!user) {
      throw new Error(`No user found for phoneNumber: ${phoneNumber}`);
    }

    const passwordValid = await validateCredential(password, user.password || '');
    if (!passwordValid) {
      throw new Error('Invalid password');
    }

    pubsub.publish(USER_SIGNED_IN, user);

    ctx.prisma.user.update({
      where: {
        phoneNumber,
      },
      data: { lastSignedIn: new Date().toISOString() },
    });

    return {
      token: sign({ userId: user.id }, APP_SECRET),
      user,
    };
  },
});

// export const updateProfile = mutationField('updateProfile', {
//   type: 'User',
//   args: { user: 'UserUpdateInput' },
//   description: 'Update user profile. Becareful that nullable fields will be updated either.',

//   resolve: async (_, { user }, ctx) => {
//     const { pubsub } = ctx;

//     const userId = getUserId(ctx);

//     const updated = await ctx.prisma.user.update({
//       where: { id: userId },
//       data: user,
//     });

//     pubsub.publish(USER_UPDATED, updated);
//     return updated;
//   },
// });

// export const findPassword = mutationField('findPassword', {
//   type: 'Boolean',
//   args: {
//     email: stringArg({ nullable: false }),
//   },
//   resolve: async (_, { email }, ctx) => {
//     if (!email || !validateEmail(email)) {
//       throw ErrorEmailNotValid('Email is not valid');
//     }

//     const verificationToken = sign({ email, type: 'findPassword' }, ctx.appSecretEtc, { expiresIn: '10m' });

//     const password = generator.generate({
//       length: 10,
//       numbers: true,
//     });

//     const msg = {
//       to: email,
//       from: 'noreply@hackatalk.dev',
//       subject: ctx.request.req.t('PASSWORD_RESET_EMAIL_SUBJECT'),
//       html: getPasswordResetHTML(verificationToken, password, ctx.request.req),
//     };
//     try {
//       await SendGridMail.send(msg);
//       return true;
//     } catch (err) {
//       throw ErrorEmailSentFailed(err.message);
//     }
//   },
// });

// export const changeEmailPassword = mutationField('changeEmailPassword', {
//   type: 'Boolean',
//   args: {
//     password: stringArg({ nullable: false }),
//     newPassword: stringArg({ nullable: false }),
//   },
//   resolve: async (_, { password, newPassword }, ctx) => {
//     const userId = getUserId(ctx);
//     try {
//       const user = await ctx.prisma.user.findOne({
//         where: {
//           id: userId,
//         },
//       });

//       const validate = await validateCredential(password, user.password);

//       if (!validate) throw ErrorPasswordIncorrect('Password is incorrect');

//       newPassword = await encryptCredential(newPassword);

//       await ctx.prisma.user.update({
//         where: { id: userId },
//         data: { password: newPassword },
//       });

//       return true;
//     } catch (err) {
//       throw new Error(err.message);
//     }
//   },
// });
