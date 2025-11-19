import { Pressable, Text } from 'react-native';

type ButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
};

export default function Button({ title, onPress, disabled, variant = 'primary' }: ButtonProps) {
  const base = 'px-6 py-3 rounded-lg items-center';
  const variants: Record<typeof variant, string> = {
    primary: 'bg-brand',
    secondary: 'bg-gray-200',
    ghost: 'bg-transparent',
  } as const;

  const textBase = 'font-semibold';
  const textVariants: Record<typeof variant, string> = {
    primary: 'text-white',
    secondary: 'text-gray-800',
    ghost: 'text-brand',
  } as const;

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className={`${base} ${variants[variant]} ${disabled ? 'opacity-60' : ''}`}
    >
      <Text className={`${textBase} ${textVariants[variant]}`}>{title}</Text>
    </Pressable>
  );
}
