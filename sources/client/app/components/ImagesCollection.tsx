import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import * as React from 'react';
import { Button } from 'semantic-ui-react';

import { openImageDialog } from '../helpers';
import { localizer } from '../Localizer';
import { VitrineComponent } from './VitrineComponent';

import { faPlus } from '@fortawesome/fontawesome-free-solid';

interface Props {
  images?: string[];
  onChange: (backgroundScreen: string) => void;
}

interface State {
  images: string[];
  selectedImage: string;
  customImage: boolean;
}

export class ImagesCollection extends VitrineComponent<Props, State> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      images: this.props.images || [],
      selectedImage: '',
      customImage: false
    };

    this.imageClick = this.imageClick.bind(this);
    this.addImageButton = this.addImageButton.bind(this);
  }

  private addImageButton() {
    const newImage: string = openImageDialog();
    if (!newImage)
      return;

    const images: string[] = this.state.images;
    if (this.state.customImage === true)
      images[0] = newImage;
    else
      images.unshift(newImage);
    this.setState({
      images,
      selectedImage: newImage,
      customImage: true
    }, () => {
      this.props.onChange(this.state.selectedImage);
    });
  }

  private imageClick(image: string) {
    this.setState({
      selectedImage: image
    }, () => {
      this.props.onChange(this.state.selectedImage);
    });
  }

  public static getDerivedStateFromProps(nextProps: Props, prevState: State): Partial<State> {
    let images: string[] = [];
    let selectedImage: string = '';
    if (nextProps.images.length) {
      images = nextProps.images;
      selectedImage = prevState.selectedImage || nextProps.images[0];
    }
    return {
      images,
      selectedImage
    };
  }

  public render(): JSX.Element {
    return (
      <div>
        <Button
          primary={true}
          onClick={this.addImageButton}
        >
          <FontAwesomeIcon icon={faPlus}/> {localizer.f('addCustomBgImage')}
        </Button>
        <div className={css(styles.imagesContainer)}>
          {this.state.images.map((image: string, index: number) =>
            <img
              key={index}
              src={image}
              className={css(styles.image) + ((this.state.selectedImage === image) ? (' ' + css(styles.selectedImage)) : (''))}
              onClick={this.imageClick.bind(this, image)}
            />
          )}
        </div>
        {this.checkErrors()}
      </div>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
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
