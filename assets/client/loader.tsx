import * as React from 'react';
import { render } from 'react-dom';

import { VitrineLoader } from './app/components/VitrineLoader';

import 'semantic-ui-less/semantic.less';

render(<VitrineLoader/>, document.getElementById('app'));
