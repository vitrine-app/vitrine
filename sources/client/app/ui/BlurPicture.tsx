import * as FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { css, StyleSheet } from 'aphrodite/no-important';
import { rgba } from 'css-verbose';
import * as React from 'react';
import { Transition } from 'semantic-ui-react';

import { VitrineComponent } from '../features/VitrineComponent';
import { urlify } from '../helpers';

interface Props {
  width?: string;
  fontSize: number;
  background: string;
  faIcon: FontAwesomeIcon.IconDefinition;
  clickHandler: () => void;
}

interface State {
  iconVisible: boolean;
  pulseVisible: boolean;
  divStyle: React.CSSProperties;
  imageStyle: React.CSSProperties;
}

export class BlurPicture extends VitrineComponent<Props, State> {
  private readonly pulseDuration: number;

  public constructor(props: Props) {
    super(props);

    this.pulseDuration = 165;
    const divStyle: any = {
      animationDuration: `${this.pulseDuration}ms`,
      fontSize: this.props.fontSize.px()
    };
    if (this.props.width) {
      divStyle.width = this.props.width;
    }
    this.state = {
      divStyle,
      iconVisible: false,
      imageStyle: {
        backgroundImage: urlify(this.props.background)
      },
      pulseVisible: true
    };

    this.mouseEnterHandler = this.mouseEnterHandler.bind(this);
    this.mouseLeaveHandler = this.mouseLeaveHandler.bind(this);
    this.clickHandler = this.clickHandler.bind(this);
  }

  private mouseEnterHandler() {
    const imageStyle: any = this.state.imageStyle;
    imageStyle.filter = `blur(${(4).px()})`;

    this.setState({
      iconVisible: true,
      imageStyle: {
        backgroundImage: urlify(this.props.background),
        filter: `blur(${(4).px()})`
      }
    });
  }

  private mouseLeaveHandler() {
    const imageStyle: any = this.state.imageStyle;
    imageStyle.filter = '';

    this.setState({
      iconVisible: false,
      imageStyle: {
        backgroundImage: urlify(this.props.background),
        filter: ''
      }
    });
  }

  private clickHandler() {
    this.setState({
      pulseVisible: !this.state.pulseVisible
    });

    this.props.clickHandler();
  }

  public static getDerivedStateFromProps(nextProps: Props): Partial<State> {
    return {
      imageStyle: {
        backgroundImage: urlify(nextProps.background),
        filter: ''
      }
    };
  }

  public render(): JSX.Element {
    return (
      <Transition visible={this.state.pulseVisible} animation={'pulse'} duration={this.pulseDuration}>
        <div
          className={css(styles.container)}
          onMouseEnter={this.mouseEnterHandler}
          onMouseLeave={this.mouseLeaveHandler}
          onClick={this.clickHandler}
          style={this.state.divStyle}
        >
          <div className={css(styles.picture)} style={{ ...this.state.imageStyle }} />
          <Transition visible={this.state.iconVisible} animation={'scale'} duration={75}>
            <FontAwesomeIcon icon={this.props.faIcon} className={css(styles.icon)} />
          </Transition>
          {this.checkErrors()}
        </div>
      </Transition>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  container: {
    borderRadius: 4,
    color: '#F1F1F1',
    height: (100).percents(),
    overflow: 'hidden',
    position: 'relative',
    width: (100).percents()
  },
  icon: {
    color: rgba(255, 255, 255, 0.6),
    cursor: 'pointer',
    left: (40).percents(),
    position: 'absolute',
    top: (40).percents()
  },
  picture: {
    backgroundRepeat: 'no-repeat',
    backgroundSize: `${(100).percents()} ${(100).percents()}`,
    boxShadow: `${0} ${0} ${0} ${(2).px()} ${rgba(255, 255, 255, 0.12)} inset`,
    cursor: 'pointer',
    height: (100).percents(),
    transition: `${75}ms filter linear`,
    width: (100).percents()
  }
});
