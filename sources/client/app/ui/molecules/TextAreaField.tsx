import { css, StyleSheet } from 'aphrodite';
import * as React from 'react';
import { Form, TextArea } from 'semantic-ui-react';

interface Props {
  label: string;
}

export const TextAreaField: React.StatelessComponent<Props & any> = ({ label, ...props }: Props) => (
  <Form.Field>
    <label className={css(styles.formLabel)}>{label}</label>
    <TextArea {...props} className={css(styles.input)} />
  </Form.Field>
);

const styles: React.CSSProperties & any = StyleSheet.create({
  formLabel: {
    fontSize: (1).em(),
    fontWeight: 'normal'
  },
  input: {
    fontSize: 14,
    height: 125,
    lineHeight: 1.4,
    resize: 'none'
  }
});
