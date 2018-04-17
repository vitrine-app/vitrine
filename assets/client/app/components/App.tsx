import { remote } from 'electron';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as path from 'path';
import * as React from 'react';

import { getEnvFolder } from '../../../models/env';
import { Vitrine } from '../containers/Vitrine';
import { localizer } from '../Localizer';
import { serverListener } from '../ServerListener';
import { ErrorsWrapper } from './ErrorsWrapper';

interface Props {
	settings: any;
	updateSettings: (settings: any) => void;
	updateModulesConfig: (modulesConfig: any) => void;
}

interface State {
	settingsReceived: boolean;
}

export class App extends React.Component<Props, State> {
	public constructor(props: Props) {
		super(props);

		this.state = {
			settingsReceived: false
		};

		this.initLanguages();
	}

	private initLanguages() {
		const langFilesFolder: string = getEnvFolder('config/lang');
		const configLang: string = (this.props.settings && this.props.settings.lang) ? (this.props.settings.lang) : ('');
		const systemLang: string = remote.app.getLocale();

		const langFilesPaths: string[] = glob.sync(`${langFilesFolder}/*`);
		langFilesPaths.forEachEnd((langFilePath: string, done: () => void) => {
			const langName: string = path.basename(langFilePath).slice(0, -5);
			const langFile: any = fs.readJsonSync(langFilePath);
			localizer.addLanguage(langName, langFile);
			if (!configLang && systemLang === langName)
				localizer.setLanguage(langName);
			done();
		}, () => {
			if (configLang)
				localizer.setLanguage(configLang);
		});
	}

	public componentDidMount() {
		serverListener.listen('init-settings', (settings: any, modulesConfig: any) => {
			this.props.updateSettings(settings);
			this.props.updateModulesConfig(modulesConfig);
			this.setState({
				settingsReceived: true
			}, () => {
				serverListener.send('ready');
			});
		});
		serverListener.send('settings-asked');
	}

	public render(): JSX.Element {
		return (this.state.settingsReceived) ? (
			<ErrorsWrapper>
				<Vitrine/>
			</ErrorsWrapper>
		) : (null);
	}
}
