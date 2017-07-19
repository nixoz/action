import {GraphQLBoolean, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
import {verify} from 'jsonwebtoken';
import addProviderGitHub from 'server/safeMutations/addProviderGitHub';
import addProviderSlack from 'server/safeMutations/addProviderSlack';
import {clientSecret as auth0ClientSecret} from 'server/utils/auth0Helpers';
import {getUserId} from 'server/utils/authorization';
import {GITHUB, SLACK} from 'universal/utils/constants';
import {IntegrationService} from 'server/graphql/types/IntegrationService';


export default {
  name: 'AddProvider',
  // currently, don't return anything since this is called by the server
  type: GraphQLBoolean,
  args: {
    code: {
      type: new GraphQLNonNull(GraphQLID)
    },
    state: {
      type: new GraphQLNonNull(GraphQLID)
    },
    service: {
      type: new GraphQLNonNull(IntegrationService)
    }
  },
  resolve: async (source, {code, state, service}, {serverSecret}) => {
    // AUTH
    if (serverSecret !== process.env.AUTH0_CLIENT_SECRET) {
      throw new Error('Don\'t be rude.');
    }

    // RESOLUTION
    const [teamId, jwt] = state.split('::');
    if (!teamId || !jwt) {
      throw new Error('Bad state');
    }
    const authToken = verify(jwt, Buffer.from(auth0ClientSecret, 'base64'));
    if (!authToken || !Array.isArray(authToken.tms) || !authToken.tms.includes(teamId)) {
      throw new Error('Bad auth token');
    }
    const userId = getUserId(authToken);
    console.log('adding prov', service)
    if (service === SLACK) {
      addProviderSlack(code, teamId, userId);
    } else if (service === GITHUB) {
      addProviderGitHub(code, teamId, userId);
    }
  }
};