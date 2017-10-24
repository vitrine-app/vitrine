import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';

import { VitrineComponent } from '../VitrineComponent';

import * as vitrineIcon from '../../images/vitrine.ico';

export class TitleBar extends VitrineComponent {
	render() {
		return (
			<div id="electron-titlebar" className={`drag ${css(styles.titleBar)}`}>
				<img className={css(styles.appIcon)} src={vitrineIcon}/>
				<span className={css(styles.appTitle)}>Vitrine</span>
				{this.checkErrors()}
			</div>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	titleBar: {
		backgroundColor: '#2F2C28',
		height: 29
	},
	appIcon: {
		height: 23,
		paddingLeft: 5,
		paddingTop: 5
	},
	appTitle: {
		paddingLeft: 50 + 'vw',
		fontSize: 13,
		color: '#B1B1B1'
	}
});
