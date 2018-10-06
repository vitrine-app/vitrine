import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import { margin, padding, rgba } from 'css-verbose';
import { shell } from 'electron';
import * as React from 'react';
import { FormattedMessage, InjectedIntl } from 'react-intl';
import { Button, Form, Grid, Input, Modal, Transition } from 'semantic-ui-react';

import { serverListener } from '../ServerListener';
import { NumberPicker } from './NumberPicker';
import { VitrineComponent } from './VitrineComponent';

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

export class IgdbResearchModal extends VitrineComponent<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      loading: true,
      research: '',
      resultsNb: 5,
      researches: [],
      selectedResearchId: '',
      transitionVisible: true
    };

    this.researchClick = this.researchClick.bind(this);
    this.gameDoubleClick = this.gameDoubleClick.bind(this);
    this.researchChange = this.researchChange.bind(this);
    this.resultsNbChange = this.resultsNbChange.bind(this);
    this.igdbSearchButton = this.igdbSearchButton.bind(this);
    this.igdbFillButton = this.igdbFillButton.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.igdbLinkClick = this.igdbLinkClick.bind(this);
    this.animateModal = this.animateModal.bind(this);
  }

  private researchClick(id: number) {
    this.setState({
      selectedResearchId: id
    });
  }

  private gameDoubleClick(id: number) {
    this.setState({
      selectedResearchId: id
    }, () => {
      this.igdbFillButton();
    });
  }

  private researchChange(event: any) {
    this.setState({
      research: event.target.value
    });
  }

  private resultsNbChange(value: number) {
    this.setState({
      resultsNb: value
    });
  }

  private igdbSearchButton() {
    this.setState({
      loading: true
    }, () => {
      serverListener.send('search-igdb-games', this.state.research, this.state.resultsNb);
    });
  }

  private igdbFillButton() {
    this.setState({
      loading: true
    }, () => {
      serverListener.send('fill-igdb-game', this.state.selectedResearchId);
    });
  }

  private closeModal() {
    if (!this.state.loading) {
      this.props.closeIgdbResearchModal();
      this.setState({
        loading: true
      });
    }
  }

  private igdbLinkClick() {
    const igdbUrl: string = 'https://www.igdb.com';
    shell.openExternal(igdbUrl);
  }

  private animateModal(startingAnimation: boolean) {
    if (startingAnimation === this.props.visible)
      this.setState({
        transitionVisible: this.props.visible
      });
  }
  public componentDidMount() {
    serverListener.listen('send-igdb-searches', (research: string, researches: any[]) => {
      this.setState({
        loading: false,
        selectedResearchId: '',
        research,
        researches
      }, () => {
        this.props.openIgdbResearchModal();
      });
    });
  }

  public render(): JSX.Element {
    const modalContent: JSX.Element = (!this.state.loading) ? (
      <Modal.Content className={css(styles.modalBody)}>
        <Form>
          <Grid>
            <Grid.Column width={10}>
              <Form.Field>
                <label className={css(styles.formLabel)}><FormattedMessage id={'gameName'}/></label>
                <Input
                  name={'name'}
                  size={'large'}
                  placeholder={this.props.intl.formatMessage({ id: 'gameName' })}
                  value={this.state.research}
                  onChange={this.researchChange}
                />
              </Form.Field>
            </Grid.Column>
            <Grid.Column width={3}>
              <Form.Field>
                <label className={(css(styles.resultsNbLabel))}><FormattedMessage id={'resultsNumber'}/></label>
                <NumberPicker
                  min={1}
                  max={20}
                  name={'rating'}
                  value={this.state.resultsNb}
                  placeholder={this.props.intl.formatMessage({ id: 'resultsNumber' })}
                  onChange={this.resultsNbChange}
                />
              </Form.Field>
            </Grid.Column>
            <Grid.Column width={2}>
              <Button
                primary={true}
                onClick={this.igdbSearchButton}
                className={css(styles.searchBtn)}
              >
                <FontAwesomeIcon icon={faSearch}/>
              </Button>
            </Grid.Column>
          </Grid>
        </Form>
        <div className={css(styles.igdbResearchList)}>
          {this.state.researches.map((research: any, index: number) =>
            <div
              key={index}
              className={
                css(styles.igdbResearch) + ' ' +
                                ((this.state.selectedResearchId === research.id) ? (css(styles.selectedIgdbResearch)) : (''))
              }
              onClick={this.researchClick.bind(this, research.id)}
              onDoubleClick={this.gameDoubleClick.bind(this, research.id)}
            >
              <Grid>
                <Grid.Column
                  style={{ width: 20..percents() }}
                  className={css(styles.igdbResearchImgColumn)}
                >
                  <img src={research.cover} className={css(styles.igdbResearchImg)}/>
                </Grid.Column>
                <Grid.Column width={12}>
                  {research.name}
                </Grid.Column>
              </Grid>
            </div>
          )}
        </div>
        <span className={css(styles.igdbDisclaimer)}>
          <FormattedMessage id={'igdbDisclaimer'}/>
          <a
            className={css(styles.igdbLink)}
            onClick={this.igdbLinkClick}
          >
            IGDB
          </a>.
        </span>
      </Modal.Content>
    ) : (
      <Modal.Content>
        <div className={css(styles.loadingContainer)}>
          <FontAwesomeIcon
            icon={faCircleNotch}
            spin={true}
            className={css(styles.loadingIcon)}
          />
        </div>
      </Modal.Content>
    );

    return (
      <Transition
        animation={'fade down'}
        duration={this.modalsTransitionDuration}
        onStart={this.animateModal.bind(this, true)}
        onComplete={this.animateModal.bind(this, false)}
        visible={this.props.visible}
      >
        <Modal
          open={this.state.transitionVisible}
          onClose={this.closeModal}
          size={'tiny'}
          className={css(styles.modal)}
        >
          <Modal.Header><FormattedMessage id={'fillWithIgdb'}/></Modal.Header>
          {modalContent}
          <Modal.Actions style={{ opacity: (!this.state.loading) ? (1) : (0) }}>
            <Button
              primary={true}
              disabled={!this.state.selectedResearchId}
              onClick={this.igdbFillButton}
            >
              <FormattedMessage id={'submitNewGame'}/>
            </Button>
          </Modal.Actions>
        </Modal>
      </Transition>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  modal: {
    margin: margin(9..rem(), 'auto'),
    cursor: 'default',
    userSelect: 'none'
  },
  modalBody: {
    height: 500,
    overflowX: 'hidden',
    overflowY: 'auto'
  },
  igdbResearchList: {
    paddingTop: 10..px()
  },
  igdbResearch: {
    margin: margin(7, 0),
    padding: padding(10, 0),
    borderRadius: 4,
    backgroundColor: '#39342E',
    transition: `${50}ms ease`,
    ':hover': {
      backgroundColor: rgba(247, 210, 174, 0.1)
    }
  },
  selectedIgdbResearch: {
    boxShadow: `inset ${0} ${0} ${0} ${2..px()} #81705E`,
    fontWeight: 600
  },
  igdbResearchImgColumn: {
    paddingLeft: 5..percents()
  },
  igdbResearchImg: {
    width: 90,
    height: 120,
    borderRadius: 4
  },
  igdbDisclaimer: {
    fontSize: 11,
    paddingLeft: 10,
    opacity: 0.5
  },
  igdbLink: {
    cursor: 'pointer'
  },
  loadingContainer: {
    height: 100..percents(),
    paddingTop: 13..percents(),
    paddingBottom: 13..percents(),
    paddingLeft: 41..percents()
  },
  loadingIcon: {
    fontSize: 120,
    opacity: 0.2
  },
  formLabel: {
    fontWeight: 'normal',
    fontSize: 1..em()
  },
  resultsNbLabel: {
    width: 99
  },
  searchBtn: {
    marginTop: 22,
    marginLeft: 25,
    padding: padding(13, 14),
    fontSize: 1.3.em()
  }
});
