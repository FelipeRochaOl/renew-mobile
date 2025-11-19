import React from 'react';
import { TextInput, TextInputProps } from 'react-native';

type Props = TextInputProps & {
  error?: boolean;
};

export default function Input({ error, className, ...props }: Props & { className?: string }) {
  return (
    <TextInput
      placeholderTextColor={props.placeholderTextColor ?? '#9ca3af'}
      {...props}
      className={`border rounded-lg px-4 py-3 text-base ${error ? 'border-red-500' : 'border-gray-300'} ${className ?? ''}`}
    />
  );
}
