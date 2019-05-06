import * as React from 'react';
import { Input } from 'semantic-ui-react';

interface Props {
  name: string;
  placeholder: string;
  value: string;
}

export const TextInput: React.StatelessComponent<Props> = ({ name, placeholder, value, ...props }: Props) => (
  <Input name={name} size={'large'} placeholder={placeholder} value={value} {...props} />
);
