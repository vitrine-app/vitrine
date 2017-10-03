import * as React from 'react';

import './ImagesCollection.scss';

import { localizer } from '../../Localizer';
import { openImageDialog } from '../../../helpers';

export class ImagesCollection extends React.Component<any, any> {
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
			<div className="images-collection">
				<button
					className="btn btn-primary"
					type="button"
					onClick={ this.addImageBtnClick.bind(this) }
				>
					<i className="fa fa-plus"/> { localizer.f('addCustomBgImage') }
				</button>
				<div className="images-container">
					{ this.state.images.map((image: string, index: number) =>
						<img
							key={ index }
							src={ image }
							className={ (this.state.selectedImage === image) ? ('selected-image') : ('') }
							onClick={ this.imageClickHandler.bind(this, image) }
						/>
					) }
				</div>
			</div>
		);
	}
}

