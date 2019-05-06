import { css, StyleSheet } from 'aphrodite';
import { padding } from 'css-verbose';
import * as React from 'react';
import { Form } from 'semantic-ui-react';

interface Props {
  locale: any;
  locales: any[];
  onChange: (event: any, data: any) => void;
}

export const LocaleSettings: React.StatelessComponent<Props> = ({ locale, locales, onChange }: Props) => (
  <Form.Select
    name={'lang'}
    fluid={true}
    value={locale}
    onChange={onChange}
    className={css(styles.localeSelect)}
    options={locales.map((locale: any, index: number) => ({
      key: index,
      text: locale.messages.language,
      value: locale.locale
    }))}
  />
);

const styles = StyleSheet.create({
  localeSelect: {
    padding: padding(20, 0, 100),
    width: (100).percents()
  }
});
