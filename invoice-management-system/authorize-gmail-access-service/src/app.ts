import express, {Request, Response} from 'express';
import * as lb from '@google-cloud/logging-bunyan';
import {google} from 'googleapis';
import helmet from 'helmet';
import passport from 'passport';
import {Strategy as GoogleStrategy} from 'passport-google-oauth2';
import {StatusCodes} from 'http-status-codes';
import {config} from './config';

async function createApp() {
  const app = express();

  const {logger, mw} = await lb.express.middleware({
    level: config.logLevel,
    redirectToStdout: true,
    skipParentEntryForCloudRun: true,
  });

  app.use(mw);

  app.use(helmet());

  app.use(passport.initialize());

  passport.use(
    new GoogleStrategy(
      {
        clientID: config.google.oauth2.clientID,
        clientSecret: config.google.oauth2.clientSecret,
        callbackURL: `${config.baseUrl}/auth/google/callback`,
        proxy: true,
      },
      async (accessToken, refreshToken, profile, cb) => {
        try {
          const email = profile.email;

          if (email !== config.gmail.address) {
            throw new RangeError(
              `Email address ${email} not the expected ${config.gmail.address}`
            );
          }

          const gmail = google.gmail('v1');
          await gmail.users.watch({
            userId: profile.email,
            requestBody: {
              labelIds: ['INBOX'],
              topicName: config.gmail.pushNotifications.pubsub.topic.id,
            },
            access_token: accessToken,
          });
          return cb(null, profile);
        } catch (err) {
          return cb(err);
        }
      }
    )
  );

  app.use('/healthz', (req, res) => {
    return res.sendStatus(StatusCodes.OK);
  });

  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/gmail.modify',
      ],
      session: false,
    })
  );

  app.get(
    '/auth/google/callback',
    passport.authenticate('google', {
      scope: [
        'profile',
        'email',
        'https://www.googleapis.com/auth/gmail.modify',
      ],
      session: false,
      successRedirect: '/auth/google/success',
      failureRedirect: '/auth/google/failure',
    })
  );

  app.get('/auth/google/success', async (req: Request, res: Response) => {
    console.log(req.user);

    // let email;

    // console.log(req);

    // try {
    //   email = await oauth2.auth.authedUser.getUserId(req, res);
    //   const OAuth2Client = await oauth2.auth.authedUser.getClient(
    //     req,
    //     res,
    //     email
    //   );
    //   google.options({auth: OAuth2Client});
    // } catch (err) {
    //   req.log.error(err);
    //   throw err;
    // }

    // try {
    //   await gmail.users.watch({
    //     userId: email,
    //     requestBody: {
    //       labelIds: ['INBOX'],
    //       topicName: config.gmail.pushNotifications.pubsub.topic.id,
    //     },
    //   });
    // } catch (err) {
    //   req.log.error(err);

    //   if (err instanceof Error) {
    //     if (
    //       !err
    //         .toString()
    //         .includes('one user push notification client allowed per developer')
    //     ) {
    //       throw err;
    //     }
    //   }
    // }

    return res.send('Successfully set up Gmail push notifications.');
  });

  app.get('/auth/google/failure', (err: Error, req: Request, res: Response) => {
    req.log.error(err);

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send('An error has occurred in the authorization process.');
  });

  return {app, logger};
}

export {createApp};
