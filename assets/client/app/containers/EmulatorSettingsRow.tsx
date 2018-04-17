import { connect, Dispatch } from 'react-redux';

import { AppState } from '../AppState';
import { EmulatorSettingsRow as VisualEmulatorSettingsRow } from '../components/EmulatorSettingsRow';

const mapStateToProps = (state: AppState) => ({
	platforms: state.modulesConfig.emulated.platforms,
});

const mapDispatchToProps = () => ({});

export const EmulatorSettingsRow = connect(mapStateToProps, mapDispatchToProps)(VisualEmulatorSettingsRow);
