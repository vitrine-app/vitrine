import { css, StyleSheet } from 'aphrodite';
import * as React from 'react';
import { Form, Input } from 'semantic-ui-react';

interface Props {
  inputLabel?: any;
  label: string;
}

export const TextField: React.StatelessComponent<Props & any> = ({ inputLabel, label, ...props }: Props) => (
  <Form.Field>
    <label className={css(styles.formLabel)}>{label}</label>
    <Input {...props} className={css(styles.input)} label={inputLabel || null} size={'small'} />
  </Form.Field>
);

// TODO: use Inconsolata for terminal-related inputs after having Aphrodite ejected
const styles: React.CSSProperties & any = StyleSheet.create({
  formLabel: {
    fontSize: (1).em(),
    fontWeight: 'normal'
  },
  input: {
    fontSize: 14
  }
});
