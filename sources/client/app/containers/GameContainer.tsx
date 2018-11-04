import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import { GameContainer as GameContainerComponent } from '../features/homescreen/GameContainer';
import { AppState } from '../features/redux/AppState';

const mapStateToProps = (state: AppState) => ({
  selectedGame: state.selectedGame
});

const mapDispatchToProps = () => ({});

export const GameContainer = injectIntl(connect(mapStateToProps, mapDispatchToProps)(GameContainerComponent));
