import { injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import { AppState } from '../features/redux/AppState';
import { EmulatorSettingsRow as EmulatorSettingsRowComponent } from '../features/settings/EmulatorSettingsRow';

const mapStateToProps = (state: AppState) => ({
  platforms: state.modulesConfig.emulated.platforms,
});

const mapDispatchToProps = () => ({});

export const EmulatorSettingsRow = injectIntl(connect(mapStateToProps, mapDispatchToProps)(EmulatorSettingsRowComponent));
