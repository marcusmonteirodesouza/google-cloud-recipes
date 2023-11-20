import {Request, Response, NextFunction} from 'express';
import {OAuth2Client} from 'google-auth-library';
import {RegionBackendServicesClient} from '@google-cloud/compute';
import {UnauthorizedError} from '../../errors';
import {User} from '../../users';

interface AuthOptions {
  google: {
    backendService: {
      name: string;
    };
    project: {
      id: string;
      number: number;
    };
    oAuth2Client: OAuth2Client;
    region: string;
    regionBackendServicesClient: RegionBackendServicesClient;
  };
}

class Auth {
  constructor(private readonly options: AuthOptions) {}

  requireAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // For Health Checks
      if (req.path === '/healthz') {
        return next();
      }

      // const token = this.getToken(req);

      // if (!token) {
      //   throw new UnauthorizedError(
      //     '"token" is required in "x-goog-iap-jwt-assertion" header'
      //   );
      // }

      // const user = await this.getUser(token);

      // req.user = user;

      // TODO(Marcus): uncomment this!

      req.user = {
        id: 'marcus.souza@gmail.com'
      }

      return next();
    } catch (err) {
      return next(err);
    }
  };

  private getToken = (req: Request) => {
    // See https://cloud.google.com/iap/docs/signed-headers-howto#retrieving_the_user_identity
    return req.header('x-goog-iap-jwt-assertion');
  };

  private async getUser(iapJwt: string): Promise<User> {
    // See https://cloud.google.com/iap/docs/signed-headers-howto#retrieving_the_user_identity
    const [getRegionBackendServiceResponse] =
      await this.options.google.regionBackendServicesClient.get({
        backendService: this.options.google.backendService.name,
        project: this.options.google.project.id,
        region: this.options.google.region,
      });

    const iapPublicKeysResponse =
      await this.options.google.oAuth2Client.getIapPublicKeys();

    const expectedAudience = `/projects/${this.options.google.project.number}/${this.options.google.region}/backendServices/${getRegionBackendServiceResponse.id}`;

    const ticket =
      await this.options.google.oAuth2Client.verifySignedJwtWithCertsAsync(
        iapJwt,
        iapPublicKeysResponse.pubkeys,
        expectedAudience,
        ['https://cloud.google.com/iap']
      );

    const tokenPayload = ticket.getPayload();

    if (!tokenPayload) {
      throw new UnauthorizedError('Could not get token payload');
    }

    return {
      id: tokenPayload.sub,
      email: tokenPayload.email,
      name: tokenPayload.name,
      picture: tokenPayload.picture,
    };
  }
}

export {Auth};
