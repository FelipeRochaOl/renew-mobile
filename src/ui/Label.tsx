import React, { PropsWithChildren } from 'react';
import { Text, TextProps } from 'react-native';

export default function Label({ children, className, ...props }: PropsWithChildren<TextProps & { className?: string }>) {
  return (
    <Text {...props} className={`text-sm font-medium text-gray-700 mb-2 ${className ?? ''}`}>
      {children}
    </Text>
  );
}
