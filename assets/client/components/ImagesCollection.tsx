import * as React from 'react';
import { StyleSheet, css } from 'aphrodite';
import { rgba } from 'css-verbose';

import { VitrineComponent } from './VitrineComponent';
import { localizer } from '../Localizer';
import { openImageDialog } from '../helpers';

import * as bootstrapVariables from '!!sass-variable-loader!../sass/bootstrap.variables.scss';

export class ImagesCollection extends VitrineComponent {
	public constructor(props: any) {
		super(props);

		this.state = {
			images: (this.props.images) ? (this.props.images) : ([]),
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

	public componentWillReceiveProps(props: any) {
		let images: string[] = [];
		let selectedImage: string = '';
		if (props.images) {
			images = props.images;
			selectedImage = (this.state.selectedImage) ? (this.state.selectedImage) : (props.images[0]);
		}
		this.setState({
			images: images,
			selectedImage: selectedImage
		});
	}

	public render(): JSX.Element {
		return (
			<div>
				<button
					className="btn btn-primary"
					type="button"
					onClick={this.addImageBtnClick.bind(this)}
				>
					<i className="fa fa-plus"/> {localizer.f('addCustomBgImage')}
				</button>
				<div className={css(styles.imagesContainer)}>
					{this.state.images.map((image: string, index: number) =>
						<img
							key={index}
							src={image}
							className={
								css(styles.image) + ((this.state.selectedImage === image) ? (' ' + css(styles.selectedImage)) : (''))
							}
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
		borderRadius: bootstrapVariables.borderRadiusBase,
		boxShadow: `${0} ${0} ${6}px ${rgba(0, 0, 0, 0.46)}`,
		filter: `brightness(${65}%)`
	},
	selectedImage: {
		filter: `brightness(${115}%)`
	}
});
