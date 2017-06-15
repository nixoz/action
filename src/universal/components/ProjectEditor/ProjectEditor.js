import {css} from 'aphrodite-local-styles/no-important';
import {Editor, EditorState, getDefaultKeyBinding} from 'draft-js';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import withMarkdown from 'universal/components/ProjectEditor/withMarkdown';
import appTheme from 'universal/styles/theme/appTheme';
import ui from 'universal/styles/ui';
import withStyles from 'universal/styles/withStyles';
import {textTags} from 'universal/utils/constants';
import withKeyboardShortcuts from './withKeyboardShortcuts';
import withLinks from './withLinks';
import withSuggestions from './withSuggestions';
import entitizeText from 'universal/utils/draftjs/entitizeText';

class ProjectEditor extends Component {

  static propTypes = {
    onBlur: PropTypes.func,
    editorState: PropTypes.object,
    setEditorState: PropTypes.func,
    handleUpArrow: PropTypes.func,
    handleDownArrow: PropTypes.func,
    handleTab: PropTypes.func,
    handleReturn: PropTypes.func,
    renderModal: PropTypes.func,
    removeModal: PropTypes.func
  };

  componentDidMount() {
    const {editorState} = this.props;
    const text = editorState.getCurrentContent().getPlainText();
    if (text === '') {
      this.editorRef.focus();
    }
  }

  state = {};

  blockStyleFn = (contentBlock) => {
    const {styles} = this.props;
    const type = contentBlock.getType();
    if (type === 'blockquote') {
      return css(styles.editorBlockquote);
    } else if (type === 'code-block') {
      return css(styles.codeBlock);
    }
  };

  removeModal = () => {
    const {removeModal, renderModal} = this.props;
    if (renderModal && removeModal) {
      removeModal();
    }
  };

  handleChange = (editorState) => {
    const {setEditorState, handleChange} = this.props;
    if (this.entityPasteStart) {
      const {anchorOffset, anchorKey} = this.entityPasteStart;
      const selectionState = editorState.getSelection().merge({
        anchorOffset,
        anchorKey
      });
      const contentState = entitizeText(editorState.getCurrentContent(), selectionState);
      this.entityPasteStart = undefined;
      if (contentState) {
        setEditorState(EditorState.push(editorState, contentState, 'apply-entity'));
        return;
      }
    }
    if (!editorState.getSelection().getHasFocus()) {
      this.removeModal();
    } else if (handleChange) {
      handleChange(editorState);
    }
    console.log('onChange', editorState)
    setEditorState(editorState);
  };

  handleUpArrow = (e) => {
    const {handleUpArrow} = this.props;
    if (handleUpArrow) {
      handleUpArrow(e);
    }
  };

  handleDownArrow = (e) => {
    const {handleDownArrow} = this.props;
    if (handleDownArrow) {
      handleDownArrow(e);
    }
  };

  handleTab = (e) => {
    const {handleTab} = this.props;
    if (handleTab) {
      handleTab(e);
    }
  };

  handleReturn = (e) => {
    const {handleReturn} = this.props;
    if (handleReturn) {
      return handleReturn(e);
    }
    return 'not-handled';
  };

  handleEscape = (e) => {
    e.preventDefault();
    this.removeModal();
  };

  handleKeyCommand = (command) => {
    const {handleKeyCommand} = this.props;
    if (handleKeyCommand) {
      return handleKeyCommand(command);
    }
  };

  keyBindingFn = (e) => {
    const {keyBindingFn} = this.props;
    if (keyBindingFn) {
      return keyBindingFn(e) || getDefaultKeyBinding(e);
    }
  };

  handleBeforeInput = (char) => {
    const {handleBeforeInput} = this.props;
    if (handleBeforeInput) {
      return handleBeforeInput(char);
    }
  }

  handlePastedText = (text, html) => {
    if (text) {
      for (let i = 0; i < textTags.length; i++) {
        const tag = textTags[i];
        if (text.indexOf(tag) !== -1) {
          const selection = this.props.editorState.getSelection();
          this.entityPasteStart = {
            anchorOffset: selection.getAnchorOffset(),
            anchorKey: selection.getAnchorKey()
          };
        }
      }
      return 'not-handled';
    }
  };

  render() {
    const {editorState, renderModal, isDragging, styles, setEditorRef} = this.props;
    //console.log('es', Editor.getClipboard())
    return (
      <div className={css(styles.root)}>
        <Editor
          blockStyleFn={this.blockStyleFn}
          editorState={editorState}
          handleBeforeInput={this.handleBeforeInput}
          handleKeyCommand={this.handleKeyCommand}
          handlePastedText={this.handlePastedText}
          handleReturn={this.handleReturn}
          keyBindingFn={this.keyBindingFn}
          onChange={this.handleChange}
          onDownArrow={this.handleDownArrow}
          onEscape={this.handleEscape}
          onTab={this.handleTab}
          onUpArrow={this.handleUpArrow}
          readOnly={isDragging}
          ref={(c) => {
            setEditorRef(c);
          }}
        />
        {renderModal && renderModal()}
      </div>
    );
  }
}

const styleThunk = () => ({
  root: {
    padding: `0 ${ui.cardPaddingBase}`
  },

  editorBlockquote: {
    fontStyle: 'italic',
    borderLeft: `.25rem ${appTheme.palette.mid40l} solid`,
    paddingLeft: '.5rem'
  },
  codeBlock: {
    //overflowX: 'scroll'
    //background: 'blue',
    //whiteSpace: 'pre!important'
  }
});

export default
withSuggestions(
  withLinks(
    withMarkdown(
      withKeyboardShortcuts(
        withStyles(styleThunk)(
          ProjectEditor
        )
      )
    )
  )
);