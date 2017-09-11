import * as path from 'path';
import * as fs from 'fs';
import * as React from 'react';
import { render } from 'react-dom';

import * as jQuery from 'jquery';
window.jQuery = window.$ = jQuery;
import 'bootstrap-sass';
import 'electron-titlebar-absolute';
import 'bootstrap-datepicker';
import 'jquery-contextmenu';

import { getEnvData } from '../../models/env';

import { TitleBar } from './components/TitleBar/TitleBar';
import { Vitrine } from './components/Vitrine/Vitrine';

import './main.scss';

class App extends React.Component {
	public constructor() {
		super();

		let langFilesFolder: string = App.getEnvFolder('config/lang');
		let enLocale: any = JSON.parse(fs.readFileSync(path.resolve(langFilesFolder, 'en.json')).toString());
		let frLocale: any = JSON.parse(fs.readFileSync(path.resolve(langFilesFolder, 'fr.json')).toString());
	}

	public render() {
		return (
			<div className="full-height">
				<TitleBar/>
				<Vitrine/>
			</div>
		);
	}

	// TODO: Remove this helper
	private static getEnvFolder(folder: string): string {
		return path.resolve(__dirname, (getEnvData().env) ? ('../../' + folder) : ('../' + folder));
	}
}

render(<App/>, document.getElementById('app'));
