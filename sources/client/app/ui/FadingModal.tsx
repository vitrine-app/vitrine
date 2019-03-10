import { css, StyleSheet } from 'aphrodite';
import { padding, rgba } from 'css-verbose';
import * as React from 'react';
import { Grid, Modal, Transition } from 'semantic-ui-react';

import { VitrineComponent } from '../features/VitrineComponent';

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
    if (startingAnimation === this.props.visible) {
      this.setState({
        transitionVisible: this.props.visible
      });
    }
  }

  private closeModal() {
    this.setState(
      {
        transitionVisible: false
      },
      () => {
        setTimeout(() => {
          this.setState(
            {
              transitionVisible: false
            },
            this.props.onClose
          );
        }, this.modalsTransitionDuration);
      }
    );
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
          <Modal.Header className={css(styles.modalPortion)}>
            {typeof this.props.title === 'string' ? (
              <span className={css(styles.modalTitle)}>{this.props.title}</span>
            ) : (
              <Grid>
                <Grid.Column width={8}>
                  <span className={css(styles.modalTitle)}>{this.props.title}</span>
                </Grid.Column>
                <Grid.Column floated={'right'} width={8}>
                  {this.props.title.rightElement}
                </Grid.Column>
              </Grid>
            )}
          </Modal.Header>
          <Modal.Content className={css(styles.modalContent)}>{this.props.children}</Modal.Content>
          {this.props.actions && <Modal.Actions className={css(styles.modalPortion)}>{this.props.actions}</Modal.Actions>}
        </Modal>
      </Transition>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    cursor: 'default',
    transition: 'width 0.3s ease',
    userSelect: 'none'
  },
  modalContent: {
    maxHeight: (83).vh(),
    overflowY: 'auto'
  },
  modalPortion: {
    border: 'none',
    padding: padding((0.8).rem(), (1.5).rem())
  },
  modalTitle: {
    color: rgba(230, 228, 227, 0.46),
    fontSize: 17
  }
});
