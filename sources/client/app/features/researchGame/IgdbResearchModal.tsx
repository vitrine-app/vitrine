import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import { margin, padding, rgba } from 'css-verbose';
import { shell } from 'electron';
import * as React from 'react';
import { FormattedMessage, InjectedIntl, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Button, Form, Grid, Input, Modal, Transition } from 'semantic-ui-react';

import { NumberPicker } from '../../ui/NumberPicker';
import { Action } from '../redux/actions/actionsTypes';
import { closeIgdbResearchModal, openIgdbResearchModal } from '../redux/actions/modals';
import { AppState } from '../redux/AppState';
import { serverListener } from '../serverListener';
import { VitrineComponent } from '../VitrineComponent';

import { faCircleNotch, faSearch } from '@fortawesome/fontawesome-free-solid';

interface Props {
  visible: boolean;
  openIgdbResearchModal: () => void;
  closeIgdbResearchModal: () => void;
  intl: InjectedIntl;
}

interface State {
  loading: boolean;
  research: string;
  resultsNb: number;
  researches: any[];
  selectedResearchId: number | string;
  transitionVisible: boolean;
}

class IgdbResearchModal extends VitrineComponent<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      research: '',
      researches: [],
      resultsNb: 5,
      selectedResearchId: '',
      transitionVisible: true
    };
  }

  public componentDidMount() {
    serverListener.listen('send-igdb-searches', (research: string, researches: any[]) => {
      this.setState(
        {
          loading: false,
          research,
          researches,
          selectedResearchId: ''
        },
        () => {
          this.props.openIgdbResearchModal();
        }
      );
    });
  }

  private static igdbLinkClick() {
    const igdbUrl: string = 'https://www.igdb.com';
    shell.openExternal(igdbUrl);
  }

  private researchClick = (id: number) => () => {
    this.setState({
      selectedResearchId: id
    });
  };

  private gameDoubleClick = (id: number) => () => {
    this.setState(
      {
        selectedResearchId: id
      },
      this.igdbFillButton
    );
  };

  private researchChange = (event: any) => {
    this.setState({
      research: event.target.value
    });
  };

  private resultsNbChange = (value: number) => {
    this.setState({
      resultsNb: value
    });
  };

  private igdbSearchButton = () => {
    this.setState(
      {
        loading: true
      },
      () => {
        serverListener.send('search-igdb-games', this.state.research, this.state.resultsNb);
      }
    );
  };

  private igdbFillButton = () => {
    this.setState(
      {
        loading: true
      },
      () => {
        serverListener.send('fill-igdb-game', this.state.selectedResearchId);
      }
    );
  };

  private closeModal = () => {
    if (!this.state.loading) {
      this.props.closeIgdbResearchModal();
      this.setState({
        loading: true
      });
    }
  };

  private animateModal = (startingAnimation: boolean) => () => {
    if (startingAnimation === this.props.visible) {
      this.setState({
        transitionVisible: this.props.visible
      });
    }
  };

  public render(): JSX.Element {
    const modalContent: JSX.Element = !this.state.loading ? (
      <Modal.Content className={css(styles.modalBody)}>
        <Form>
          <Grid>
            <Grid.Column width={10}>
              <Form.Field>
                <label className={css(styles.formLabel)}>
                  <FormattedMessage id={'game.name'} />
                </label>
                <Input
                  name={'name'}
                  size={'large'}
                  placeholder={this.props.intl.formatMessage({
                    id: 'game.name'
                  })}
                  value={this.state.research}
                  onChange={this.researchChange}
                />
              </Form.Field>
            </Grid.Column>
            <Grid.Column width={3}>
              <Form.Field>
                <label className={css(styles.resultsNbLabel)}>
                  <FormattedMessage id={'resultsNb'} />
                </label>
                <NumberPicker
                  min={1}
                  max={20}
                  name={'resultsNb'}
                  value={this.state.resultsNb}
                  placeholder={this.props.intl.formatMessage({
                    id: 'resultsNb'
                  })}
                  onChange={this.resultsNbChange}
                />
              </Form.Field>
            </Grid.Column>
            <Grid.Column width={2}>
              <Button primary={true} onClick={this.igdbSearchButton} className={css(styles.searchBtn)}>
                <FontAwesomeIcon icon={faSearch} />
              </Button>
            </Grid.Column>
          </Grid>
        </Form>
        <div className={css(styles.igdbResearchList)}>
          {this.state.researches.map((research: any, index: number) => (
            <div
              key={index}
              className={css(styles.igdbResearch) + ' ' + (this.state.selectedResearchId === research.id ? css(styles.selectedIgdbResearch) : '')}
              onClick={this.researchClick(research.id)}
              onDoubleClick={this.gameDoubleClick(research.id)}
            >
              <Grid>
                <Grid.Column style={{ width: (20).percents() }} className={css(styles.igdbResearchImgColumn)}>
                  <img alt={research.name} src={research.cover} className={css(styles.igdbResearchImg)} />
                </Grid.Column>
                <Grid.Column width={12}>{research.name}</Grid.Column>
              </Grid>
            </div>
          ))}
        </div>
        <span className={css(styles.igdbDisclaimer)}>
          <FormattedMessage id={'igdbDisclaimer'} />
          <a className={css(styles.igdbLink)} onClick={IgdbResearchModal.igdbLinkClick}>
            IGDB
          </a>
          .
        </span>
      </Modal.Content>
    ) : (
      <Modal.Content>
        <div className={css(styles.loadingContainer)}>
          <FontAwesomeIcon icon={faCircleNotch} spin={true} className={css(styles.loadingIcon)} />
        </div>
      </Modal.Content>
    );

    return (
      <Transition
        animation={'fade down'}
        duration={this.modalsTransitionDuration}
        onStart={this.animateModal(true)}
        onComplete={this.animateModal(false)}
        visible={this.props.visible}
      >
        <Modal open={this.state.transitionVisible} onClose={this.closeModal} size={'tiny'} className={css(styles.modal)}>
          <Modal.Header>
            <FormattedMessage id={'actions.fillWithIgdb'} />
          </Modal.Header>
          {modalContent}
          <Modal.Actions style={{ opacity: !this.state.loading ? 1 : 0 }}>
            <Button primary={true} disabled={!this.state.selectedResearchId} onClick={this.igdbFillButton}>
              <FormattedMessage id={'actions.submitNewGame'} />
            </Button>
          </Modal.Actions>
        </Modal>
      </Transition>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  formLabel: {
    fontSize: (1).em(),
    fontWeight: 'normal'
  },
  igdbDisclaimer: {
    fontSize: 11,
    opacity: 0.5,
    paddingLeft: 10
  },
  igdbLink: {
    cursor: 'pointer'
  },
  igdbResearch: {
    ':hover': {
      backgroundColor: rgba(247, 210, 174, 0.1)
    },
    backgroundColor: '#39342E',
    borderRadius: 4,
    margin: margin(7, 0),
    padding: padding(10, 0),
    transition: `${50}ms ease`
  },
  igdbResearchImg: {
    borderRadius: 4,
    height: 120,
    width: 90
  },
  igdbResearchImgColumn: {
    paddingLeft: (5).percents()
  },
  igdbResearchList: {
    paddingTop: (10).px()
  },
  loadingContainer: {
    height: (100).percents(),
    paddingBottom: (13).percents(),
    paddingLeft: (41).percents(),
    paddingTop: (13).percents()
  },
  loadingIcon: {
    fontSize: 120,
    opacity: 0.2
  },
  modal: {
    cursor: 'default',
    margin: margin((9).rem(), 'auto'),
    userSelect: 'none'
  },
  modalBody: {
    height: 500,
    overflowX: 'hidden',
    overflowY: 'auto'
  },
  resultsNbLabel: {
    width: 99
  },
  searchBtn: {
    fontSize: (1.3).em(),
    marginLeft: 25,
    marginTop: 22,
    padding: padding(13, 14)
  },
  selectedIgdbResearch: {
    boxShadow: `inset ${0} ${0} ${0} ${(2).px()} #81705E`,
    fontWeight: 600
  }
});

const mapStateToProps = (state: AppState) => ({
  visible: state.igdbResearchModalVisible
});

const mapDispatchToProps = (dispatch: Dispatch<Action>) => ({
  openIgdbResearchModal() {
    dispatch(openIgdbResearchModal());
  },
  closeIgdbResearchModal() {
    dispatch(closeIgdbResearchModal());
  }
});

const IgdbResearchModalContainer = injectIntl(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(IgdbResearchModal)
);

export { IgdbResearchModalContainer as IgdbResearchModal };
