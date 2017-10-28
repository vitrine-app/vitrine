import * as React from 'react';
import { remote, ipcRenderer } from 'electron';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as glob from 'glob';

import { Vitrine } from './Vitrine';
import { localizer } from '../Localizer';
import { getEnvFolder } from '../../models/env';
import { ErrorsWrapper } from './ErrorsWrapper';

export class App extends React.Component {
	private config: any;

	public constructor() {
		super();

		this.initLanguages();
		$(document).on('show.bs.modal', '.modal', function() {
			let zIndex: number = 1040 + (10 * $('.modal:visible').length);
			$(this).css('z-index', zIndex);
			setTimeout(() => {
				$('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
			}, 0);
		});
	}

	private initLanguages() {
		let langFilesFolder: string = getEnvFolder('config/lang');
		let configFilePath: string = path.resolve(getEnvFolder('config'), 'vitrine_config.json');
		this.config = fs.readJSONSync(configFilePath, {throws: false});
		let configLang: string = (this.config && this.config.lang) ? (this.config.lang) : ('');
		let systemLang: string = remote.app.getLocale();

		let langFilesPaths: string[] = glob.sync(`${langFilesFolder}/*`);
		let counter: number = 0;
		langFilesPaths.forEach((langFilePath: string) => {
			let langName: string = path.basename(langFilePath).slice(0, -5);
			let langFile: any = fs.readJSONSync(langFilePath);
			localizer.addLanguage(langName, langFile);
			if (!configLang && systemLang === langName)
				localizer.setLanguage(langName);
			counter++;
			if (counter === langFilesPaths.length && configLang)
				localizer.setLanguage(configLang)
		});
	}

	public componentDidMount() {
		ipcRenderer.send('client.ready');
	}

	public render(): JSX.Element {
		return (
			<ErrorsWrapper>
				<Vitrine
					settings={ this.config }
				/>
			</ErrorsWrapper>
		);
	}
}
