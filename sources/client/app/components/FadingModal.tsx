import { css, StyleSheet } from 'aphrodite';
import * as React from 'react';
import { Grid, Modal, Transition } from 'semantic-ui-react';

import { VitrineComponent } from './VitrineComponent';

interface Props {
  actions?: JSX.Element;
  onClose: () => void;
  title: string | { title: string; rightElement: any };
  visible: boolean;
  size?: 'fullscreen' | 'large' | 'mini' | 'small' | 'tiny';
  style?: React.CSSProperties;
}

interface State {
  transitionVisible: boolean;
}

export class FadingModal extends VitrineComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      transitionVisible: true
    };

    this.closeModal = this.closeModal.bind(this);
  }

  private animateModal(startingAnimation: boolean) {
    if (startingAnimation === this.props.visible)
      this.setState({
        transitionVisible: this.props.visible
      });
  }

  private closeModal() {
    this.setState({
      transitionVisible: false
    }, () => {
      setTimeout(() => {
        this.setState({
          transitionVisible: false
        }, this.props.onClose);
      }, this.modalsTransitionDuration);
    });
  }

  public render(): JSX.Element {
    return (
      <Transition
        animation={'fade down'}
        duration={this.modalsTransitionDuration}
        onStart={this.animateModal.bind(this, true)}
        onComplete={this.animateModal.bind(this, false)}
        visible={this.props.visible}
      >
        <Modal
          className={css(styles.modal)}
          open={this.state.transitionVisible}
          onClose={this.props.onClose}
          size={this.props.size || 'small'}
          style={this.props.style}
        >
          <Modal.Header>
            {typeof this.props.title === 'string' ?
              this.props.title :
              <Grid>
                <Grid.Column width={8}>{this.props.title.title}</Grid.Column>
                <Grid.Column floated={'right'} width={8}>{this.props.title.rightElement}</Grid.Column>
              </Grid>
            }
          </Modal.Header>
          <Modal.Content className={css(styles.modalContent)}>{this.props.children}</Modal.Content>
          {this.props.actions && <Modal.Actions>{this.props.actions}</Modal.Actions>}
        </Modal>
      </Transition>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    cursor: 'default',
    userSelect: 'none',
    transition: 'width 0.3s ease'
  },
  modalContent: {
    maxHeight: 83..vh(),
    overflowY: 'auto'
  }
});
