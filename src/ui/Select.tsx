import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { View, ViewProps } from 'react-native';

type Option = { label: string; value: string } | string;

type Props = ViewProps & {
  selectedValue: string;
  onValueChange: (value: string) => void;
  options: Option[];
};

function normalize(option: Option): { label: string; value: string } {
  return typeof option === 'string' ? { label: option, value: option } : option;
}

export default function Select({ selectedValue, onValueChange, options, className, ...props }: Props & { className?: string }) {
  return (
    <View {...props} className={`border rounded-lg ${className ?? ''}`}>
      <Picker selectedValue={selectedValue} onValueChange={(val: string) => onValueChange(val)}>
        {options.map((opt) => {
          const o = normalize(opt);
          return <Picker.Item key={o.value} label={o.label} value={o.value} />;
        })}
      </Picker>
    </View>
  );
}
