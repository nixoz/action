import {css} from 'aphrodite-local-styles/no-important';
import PropTypes from 'prop-types';
import React from 'react';
import {createFragmentContainer} from 'react-relay';
import withSubscriptions from 'universal/decorators/withSubscriptions.js/withSubscriptions';
import ProviderRow from 'universal/modules/teamDashboard/components/ProviderRow/ProviderRow';
import withStyles from 'universal/styles/withStyles';
import {GITHUB, SLACK} from 'universal/utils/constants';
import ui from 'universal/styles/ui';
import Panel from 'universal/components/Panel/Panel';
import ProviderAddedSubscription from 'universal/subscriptions/ProviderAddedSubscription';
import ProviderRemovedSubscription from 'universal/subscriptions/ProviderRemovedSubscription';

const ProviderList = (props) => {
  const {jwt, viewer, styles, teamId} = props;
  const {providerMap: {github, slack}} = viewer;
  return (
    <div className={css(styles.providerList)}>
      <Panel hasHeader={false}>
        <ProviderRow name={GITHUB} providerDetails={github} teamId={teamId} comingSoon />
        <ProviderRow name={SLACK} providerDetails={slack} jwt={jwt} teamId={teamId} />
      </Panel>
    </div>
  );
};

ProviderList.propTypes = {
  jwt: PropTypes.string,
  viewer: PropTypes.object.isRequired,
  styles: PropTypes.object,
  teamId: PropTypes.string
};

const styleThunk = () => ({
  providerList: {
    maxWidth: ui.settingsPanelMaxWidth,
    width: '100%'
  }
});

const subscriptionThunk = ({teamId, viewer: {id}}) => {
  return [
    ProviderRemovedSubscription(teamId, id),
    ProviderAddedSubscription(teamId, id)
  ];
};

export default createFragmentContainer(
  withSubscriptions(subscriptionThunk)(withStyles(styleThunk)(ProviderList)),
  graphql`
    fragment ProviderList_viewer on User {
      id
      providerMap(teamId: $teamId) {
        github {
          ...ProviderRow_providerDetails
        }
        slack {
          ...ProviderRow_providerDetails
        }
      }

    }
  `
);
