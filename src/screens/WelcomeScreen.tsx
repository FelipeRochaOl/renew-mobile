import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import Button from '../ui/Button';

type Props = {
  navigation: StackNavigationProp<RootStackParamList, 'Welcome'>;
};

export default function WelcomeScreen({ navigation }: Props) {
  const nav = useNavigation();
  return (
    <View className="flex-1 px-6 pt-12 justify-center items-center">
      <Text className="text-3xl font-bold mb-3 text-center">RenovarApp</Text>
      <Text className="text-base text-gray-600 mb-6 text-center">
        Te ajudo a entender o futuro da sua profissão e a construir novas oportunidades.
      </Text>
      <Button title="Começar avaliação" onPress={() => navigation.navigate('Onboarding')} />
    </View>
  );
}
