import { css, StyleSheet } from 'aphrodite';
import * as React from 'react';
import { Form } from 'semantic-ui-react';
import { ImagesCollection } from '../ImagesCollection';

interface Props {
  label: string;
}

export const ImagesPickerField: React.StatelessComponent<Props & any> = ({ label, ...props }: Props) => (
  <Form.Field>
    <label className={css(styles.formLabel)}>{label}</label>
    <ImagesCollection {...props} />
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
