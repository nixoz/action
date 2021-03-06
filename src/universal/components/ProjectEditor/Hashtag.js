import React from 'react';
import withStyles from 'universal/styles/withStyles';
import {css} from 'aphrodite-local-styles/no-important';
import appTheme from 'universal/styles/theme/appTheme';
import PropTypes from 'prop-types';

const Hashtag = (props) => {
  // const {url} = props.contentState.getEntity(props.entityKey).getData();
  const {styles, offsetkey, children} = props;
  return (
    <span data-offset-key={offsetkey} className={css(styles.hashtag)}>
      {children}
    </span>
  );
};

Hashtag.propTypes = {
  children: PropTypes.any,
  offsetkey: PropTypes.string,
  styles: PropTypes.object
};

const styleThunk = () => ({
  hashtag: {
    color: appTheme.palette.cool,
    fontWeight: 800

  }
});

export default withStyles(styleThunk)(Hashtag);
