import { css, StyleSheet } from 'aphrodite';
import * as React from 'react';
import { Form } from 'semantic-ui-react';
import { NumberPicker } from '../NumberPicker';

interface Props {
  label: string;
}

export const NumberField: React.StatelessComponent<Props & any> = ({ label, ...props }: Props) => (
  <Form.Field>
    <label className={css(styles.formLabel)}>{label}</label>
    <NumberPicker inputProps={{ style: { fontSize: 14 } }} {...props} size={'small'} />
  </Form.Field>
);

const styles: React.CSSProperties & any = StyleSheet.create({
  formLabel: {
    fontSize: (1).em(),
    fontWeight: 'normal'
  }
});
