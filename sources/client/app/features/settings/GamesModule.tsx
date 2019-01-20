import { css, StyleSheet } from 'aphrodite';
import { margin } from 'css-verbose';
import * as React from 'react';

import { VitrineComponent } from '../VitrineComponent';

import * as lessVars from 'less-vars-loader?camelCase&resolveVariables!../../../resources/less/theme/globals/site.variables';

interface Props {
  clicked: boolean;
  iconFile: any;
  iconAlt: string;
  clickHandler: (checked: boolean) => void;
}

export class GamesModule extends VitrineComponent<Props, any> {
  public constructor(props: Props) {
    super(props);

    this.state = {
      clicked: this.props.clicked
    };

    this.imageClick = this.imageClick.bind(this);
  }

  private imageClick() {
    this.setState(
      {
        clicked: !this.state.clicked
      },
      () => {
        this.props.clickHandler(this.state.clicked);
      }
    );
  }

  public render(): JSX.Element {
    return (
      <div className={css(styles.iconWrapper)}>
        <img
          alt={this.props.iconAlt}
          src={this.props.iconFile}
          className={css(styles.gamesModuleIcon) + ' ' + (this.state.clicked ? css(styles.clickedGamesModuleIcon) : '')}
          onClick={this.imageClick}
        />
        {this.checkErrors()}
      </div>
    );
  }
}

const styles: React.CSSProperties & any = StyleSheet.create({
  clickedGamesModuleIcon: {
    filter: `opacity(${0.5}) drop-shadow(${0} ${0} ${0} ${lessVars.primaryColor})`,
    opacity: 1
  },
  gamesModuleIcon: {
    ':hover': {
      cursor: 'pointer',
      opacity: 0.14
    },
    margin: (15).px(),
    opacity: 0.05,
    transition: `${320}ms ease`,
    width: (150).px()
  },
  iconWrapper: {
    margin: margin(0, 'auto'),
    width: (85).percents()
  }
});
