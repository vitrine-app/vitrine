import * as React from 'react';
import { Button } from 'semantic-ui-react';
import { StyleSheet, css } from 'aphrodite';
import { rgba } from 'css-verbose';
import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';

import { VitrineComponent } from './VitrineComponent';
import { localizer } from '../Localizer';
import { openImageDialog } from '../helpers';

import { faPlus } from '@fortawesome/fontawesome-free-solid';

interface Props {
	images?: string[]
	onChange: Function
}

interface State {
	images: string[],
	selectedImage: string,
	customImage: boolean
}

export class ImagesCollection extends VitrineComponent<Props, State> {
	public constructor(props: Props) {
		super(props);

		this.state = {
			images: this.props.images || [],
			selectedImage: '',
			customImage: false
		};
	}

	private addImageBtnClick() {
		let newImage: string = openImageDialog();
		if (!newImage)
			return;

		let newImages: string[] = this.state.images;
		if (this.state.customImage === true)
			newImages[0] = newImage;
		else
			newImages.unshift(newImage);
		this.setState({
			images: newImages,
			selectedImage: newImage,
			customImage: true
		}, () => {
			if (this.props.onChange)
				this.props.onChange(this.state.selectedImage);
		});
	}

	private imageClickHandler(image: string) {
		this.setState({
			selectedImage: image
		}, () => {
			if (this.props.onChange)
				this.props.onChange(this.state.selectedImage);
		});
	}

	public componentWillReceiveProps(props: Props) {
		let images: string[] = [];
		let selectedImage: string = '';
		if (props.images) {
			images = props.images;
			selectedImage = this.state.selectedImage || props.images[0];
		}
		this.setState({
			images,
			selectedImage
		});
	}

	public render(): JSX.Element {
		return (
			<div>
				<Button
					primary={true}
					onClick={this.addImageBtnClick.bind(this)}
				>
					<FontAwesomeIcon icon={faPlus}/> {localizer.f('addCustomBgImage')}
				</Button>
				<div className={css(styles.imagesContainer)}>
					{this.state.images.map((image: string, index: number) =>
						<img
							key={index}
							src={image}
							className={css(styles.image) + ((this.state.selectedImage === image) ? (' ' + css(styles.selectedImage)) : (''))}
							onClick={this.imageClickHandler.bind(this, image)}
						/>
					)}
				</div>
				{this.checkErrors()}
			</div>
		);
	}
}

const styles: React.CSSProperties = StyleSheet.create({
	imagesContainer: {
		overflowX: 'auto',
		overflowY: 'hidden',
		whiteSpace: 'nowrap'
	},
	image: {
		width: 400,
		height: 270,
		margin: 5,
		borderRadius: 4,
		filter: `brightness(${65}%)`
	},
	selectedImage: {
		filter: `brightness(${115}%)`
	}
});
