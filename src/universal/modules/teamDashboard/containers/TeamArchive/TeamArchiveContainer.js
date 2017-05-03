import PropTypes from 'prop-types';
import React from 'react';
import {cashay} from 'cashay';
import {connect} from 'react-redux';
import TeamArchive from 'universal/modules/teamDashboard/components/TeamArchive/TeamArchive';

const teamArchiveQuery = `
query {
  archivedProjects(teamId: $teamId) @live {
    id
    content
    status
    tags
    teamMemberId
    updatedAt
    teamMember @cached(type: "TeamMember") {
      id
      picture
      preferredName
    }
  }
}`;

// const mutationHandlers = {
//   updateProject(optimisticVariables, queryResponse, currentResponse) {
//     if (optimisticVariables && optimisticVariables.updatedProject.isArchived === false) {
//       const projectId = optimisticVariables.updatedProject.id;
//       const projectIdx = currentResponse.archivedProjects.findIndex(p => p.id === projectId);
//       if (projectIdx !== -1) {
//         currentResponse.archivedProjects.splice(projectIdx, 1);
//         return currentResponse;
//       }
//     }
//     return undefined;
//   }
// };

const mapStateToProps = (state, props) => {
  const {match: {params: {teamId}}} = props;
  const teamArchiveContainer = cashay.query(teamArchiveQuery, {
    op: 'teamArchiveContainer',
    key: teamId,
    variables: {teamId},
    resolveCached: {
      teamMember: (source) => source.teamMemberId
    },
    sort: {
      archivedProjects: (a, b) => b.updatedAt - a.updatedAt
    }
  });
  const {archivedProjects} = teamArchiveContainer.data;
  return {
    archivedProjects,
    teamId
  };
};

const TeamArchiveContainer = (props) => {
  const {archivedProjects, teamId} = props;
  return (
    <TeamArchive
      archivedProjects={archivedProjects}
      teamId={teamId}
    />
  );
};

TeamArchiveContainer.propTypes = {
  archivedProjects: PropTypes.array.isRequired,
  match: PropTypes.object.isRequired,
  teamId: PropTypes.string.isRequired
};

export default connect(mapStateToProps)(TeamArchiveContainer);
