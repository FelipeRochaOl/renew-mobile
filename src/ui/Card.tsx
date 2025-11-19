import React, { PropsWithChildren } from 'react';
import { View, ViewProps } from 'react-native';

export default function Card({ children, className, ...props }: PropsWithChildren<ViewProps & { className?: string }>) {
  return (
    <View {...props} className={`bg-white rounded-xl p-4 shadow-sm ${className ?? ''}`}>
      {children}
    </View>
  );
}
