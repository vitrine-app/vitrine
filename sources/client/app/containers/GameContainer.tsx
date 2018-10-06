import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import { AppState } from '../AppState';
import { GameContainer as GameContainerComponent } from '../components/GameContainer';

const mapStateToProps = (state: AppState) => ({
  selectedGame: state.selectedGame
});

const mapDispatchToProps = () => ({});

export const GameContainer = injectIntl(connect(mapStateToProps, mapDispatchToProps)(GameContainerComponent));
