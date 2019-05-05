import { css, StyleSheet } from 'aphrodite';
import { margin } from 'css-verbose';
import * as React from 'react';
import { FormattedMessage, InjectedIntl, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Button, Form, Grid, Modal, Transition } from 'semantic-ui-react';

import { PlayableGame } from '@models/PlayableGame';
import { NumberPicker } from '../../ui/NumberPicker';
import { Action } from '../redux/actions/actionsTypes';
import { closeTimePlayedEditionModal } from '../redux/actions/modals';
import { AppState } from '../redux/AppState';
import { serverListener } from '../serverListener';
import { VitrineComponent } from '../VitrineComponent';

interface Props {
  gameToEdit: PlayableGame;
  visible: boolean;
  closeTimePlayedEditionModal: () => void;
  intl: InjectedIntl;
}

interface State {
  hours: number;
  minutes: number;
  seconds: number;
  transitionVisible: boolean;
}

class TimePlayedEditionModal extends VitrineComponent<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      hours: 0,
      minutes: 0,
      seconds: 0,
      transitionVisible: true
    };
  }

  public static getDerivedStateFromProps(nextProps: Props): Partial<State> {
    if (!nextProps.gameToEdit || !nextProps.visible) {
      return null;
    }
    const timePlayed: number = nextProps.gameToEdit.timePlayed;
    const hours: number = Math.floor(timePlayed / 3600);
    const minutes: number = Math.floor((timePlayed - hours * 3600) / 60);
    const seconds: number = timePlayed - hours * 3600 - minutes * 60;
    return {
      hours,
      minutes,
      seconds
    };
  }

  private closeModal = () => {
    this.props.closeTimePlayedEditionModal();
    setTimeout(() => {
      this.setState({
        hours: 0,
        minutes: 0,
        seconds: 0,
        transitionVisible: false
      });
    }, this.modalsTransitionDuration);
  };

  private setHours = (hours: number) => {
    this.setState({
      hours
    });
  };

  private setMinutes = (minutes: number) => {
    this.setState({
      minutes
    });
  };

  private setSeconds = (seconds: number) => {
    this.setState({
      seconds
    });
  };

  private submitButton = () => {
    const timePlayed: number = this.state.hours * 3600 + this.state.minutes * 60 + this.state.seconds;
    serverListener.send('edit-game-time-played', this.props.gameToEdit.uuid, timePlayed);
    this.closeModal();
  };

  private animateModal = (startingAnimation: boolean) => () => {
    if (startingAnimation === this.props.visible) {
      this.setState({
        transitionVisible: this.props.visible
      });
    }
  };

  public render(): JSX.Element {
    return (
      <Transition
        animation={'fade down'}
        duration={this.modalsTransitionDuration}
        onStart={this.animateModal(true)}
        onComplete={this.animateModal(false)}
        visible={this.props.visible}
      >
        <Modal open={this.state.transitionVisible} onClose={this.closeModal} className={css(styles.modal)}>
          <Modal.Header>{this.props.gameToEdit ? this.props.gameToEdit.name : ''}</Modal.Header>
          <Modal.Content>
            <Form>
              <Grid>
                <Grid.Column width={5}>
                  <Form.Field>
                    <label>
                      <FormattedMessage id={'time.hoursPlur'} />
                    </label>
                    <NumberPicker
                      min={0}
                      max={Infinity}
                      value={this.state.hours}
                      name={'hours'}
                      placeholder={this.props.intl.formatMessage({ id: 'time.hoursPlur' })}
                      onChange={this.setHours}
                    />
                  </Form.Field>
                </Grid.Column>
                <Grid.Column width={5}>
                  <Form.Field>
                    <label>
                      <FormattedMessage id={'time.minutesPlur'} />
                    </label>
                    <NumberPicker
                      min={0}
                      max={60}
                      value={this.state.minutes}
                      name={'minutes'}
                      placeholder={this.props.intl.formatMessage({ id: 'time.minutesPlur' })}
                      onChange={this.setMinutes}
                    />
                  </Form.Field>
                </Grid.Column>
                <Grid.Column width={5}>
                  <Form.Field>
                    <label>
                      <FormattedMessage id={'time.secondsPlur'} />
                    </label>
                    <NumberPicker
                      min={0}
                      max={60}
                      value={this.state.seconds}
                      name={'seconds'}
                      placeholder={this.props.intl.formatMessage({ id: 'time.secondsPlur' })}
                      onChange={this.setSeconds}
                    />
                  </Form.Field>
                </Grid.Column>
              </Grid>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button primary={true} onClick={this.submitButton}>
              <FormattedMessage id={'actions.confirm'} />
            </Button>
          </Modal.Actions>
          {this.checkErrors()}
        </Modal>
      </Transition>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  modal: {
    margin: margin((20).rem(), 'auto'),
    width: 300
  }
});

const mapStateToProps = (state: AppState) => ({
  gameToEdit: state.gameToEdit,
  visible: state.timePlayedEditionModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  closeTimePlayedEditionModal() {
    dispatch(closeTimePlayedEditionModal());
  }
});

const TimePlayedEditionModalContainer = injectIntl(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(TimePlayedEditionModal)
);

export { TimePlayedEditionModalContainer as TimePlayedEditionModal };
