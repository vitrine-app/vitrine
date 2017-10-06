import * as React from 'react';
import * as path from 'path';
import * as fs from 'fs';
import { ipcRenderer } from 'electron';

import { TitleBar } from './TitleBar/TitleBar';
import { Vitrine } from './Vitrine/Vitrine';
import { localizer } from '../Localizer';
import { getEnvFolder } from '../../models/env';
import { ErrorsWrapper } from './ErrorsWrapper/ErrorsWrapper';

export class App extends React.Component {
	public constructor() {
		super();

		// extendJQuery();

		let langFilesFolder: string = getEnvFolder('config/lang');
		let enLocale: any = JSON.parse(fs.readFileSync(path.resolve(langFilesFolder, 'en.json')).toString());
		let frLocale: any = JSON.parse(fs.readFileSync(path.resolve(langFilesFolder, 'fr.json')).toString());
		localizer.addLanguage('en', enLocale);
		localizer.addLanguage('fr', frLocale);
		localizer.setLanguage('fr');

		$(document).on('show.bs.modal', '.modal', function() {
			let zIndex = 1040 + (10 * $('.modal:visible').length);
			$(this).css('z-index', zIndex);
			setTimeout(() => {
				$('.modal-backdrop').not('.modal-stack').css('z-index', zIndex - 1).addClass('modal-stack');
			}, 0);
		});
	}

	public componentDidMount() {
		ipcRenderer.send('client.ready');
	}

	public render(): JSX.Element {
		return (
			<div className="full-height">
				<TitleBar/>
				<ErrorsWrapper>
					<Vitrine/>
				</ErrorsWrapper>
			</div>
		);
	}
}
