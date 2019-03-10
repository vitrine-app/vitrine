import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite';
import * as React from 'react';
import { FormattedMessage, InjectedIntl, injectIntl } from 'react-intl';
import { Button } from 'semantic-ui-react';

import { VitrineComponent } from '../features/VitrineComponent';
import { openImageDialog } from '../helpers';

import { faPlus } from '@fortawesome/fontawesome-free-solid';

interface Props {
  images?: string[];
  onChange: (backgroundScreen: string) => void;
  intl: InjectedIntl;
}

interface State {
  images: string[];
  selectedImage: string;
  customImage: boolean;
}

export const ImagesCollection = injectIntl(
  class extends VitrineComponent<Props & any, State> {
    public constructor(props: Props) {
      super(props);

      this.state = {
        customImage: false,
        images: this.props.images || [],
        selectedImage: ''
      };

      this.imageClick = this.imageClick.bind(this);
      this.addImageButton = this.addImageButton.bind(this);
    }

    private addImageButton() {
      const newImage: string = openImageDialog(this.props.intl.formatMessage);
      if (!newImage) {
        return;
      }

      const images: string[] = this.state.images;
      if (this.state.customImage === true) {
        images[0] = newImage;
      } else {
        images.unshift(newImage);
      }
      this.setState(
        {
          customImage: true,
          images,
          selectedImage: newImage
        },
        () => {
          this.props.onChange(this.state.selectedImage);
        }
      );
    }

    private imageClick(image: string) {
      this.setState(
        {
          selectedImage: image
        },
        () => {
          this.props.onChange(this.state.selectedImage);
        }
      );
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
          <Button primary={true} onClick={this.addImageButton}>
            <FontAwesomeIcon icon={faPlus} /> <FormattedMessage id={'game.customBgImage'} />
          </Button>
          <div className={css(styles.imagesContainer)}>
            {this.state.images.map((image: string, index: number) => (
              <img
                alt={`screenshot-${index}`}
                key={index}
                src={image}
                className={css(styles.image) + (this.state.selectedImage === image ? ' ' + css(styles.selectedImage) : '')}
                onClick={this.imageClick.bind(this, image)}
              />
            ))}
          </div>
          {this.checkErrors()}
        </div>
      );
    }
  }
);

const styles: React.CSSProperties & any = StyleSheet.create({
  image: {
    borderRadius: 4,
    filter: `brightness(${65}%)`,
    height: 270,
    margin: 5,
    width: 400
  },
  imagesContainer: {
    overflowX: 'auto',
    overflowY: 'hidden',
    whiteSpace: 'nowrap'
  },
  selectedImage: {
    filter: `brightness(${115}%)`
  }
});
