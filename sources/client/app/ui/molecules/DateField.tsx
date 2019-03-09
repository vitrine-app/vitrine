import { css, StyleSheet } from 'aphrodite';
import * as React from 'react';
import { Form } from 'semantic-ui-react';

import { DatePicker } from './DatePicker';

interface Props {
  label: string;
  placeholder: string;
}

export const DateField: React.StatelessComponent<Props & any> = ({ label, placeholder, ...props }: Props) => (
  <Form.Field>
    <label className={css(styles.formLabel)}>{label}</label>
    <DatePicker
      {...props}
      inputProps={{
        placeholder,
        readOnly: true,
        size: 'small'
      }}
    />
  </Form.Field>
);

const styles: React.CSSProperties & any = StyleSheet.create({
  formLabel: {
    fontSize: (1).em(),
    fontWeight: 'normal'
  },
  input: {
    fontSize: 14
  }
});
