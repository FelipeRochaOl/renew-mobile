import { StackNavigationProp } from '@react-navigation/stack';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'PasswordRecovery'>;
}

export default function PasswordRecoveryScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRecover() {
    if (!email) {
      Alert.alert('Informe o e-mail');
      return;
    }
    setLoading(true);
    try {
      // Placeholder: call /auth/recover in real API
      await new Promise(r => setTimeout(r, 600));
      Alert.alert('Enviado', 'Se existir uma conta, enviamos instruções.');
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 p-6 justify-center bg-white">
      <Text className="text-2xl font-bold mb-4">Recuperar Senha</Text>
      <TextInput
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        className="border border-gray-300 rounded px-3 py-2 mb-6"
      />
      <TouchableOpacity
        onPress={handleRecover}
        disabled={loading}
        className="bg-blue-500 rounded py-3"
      >
        <Text className="text-center text-white font-semibold">{loading ? '...' : 'Enviar'}</Text>
      </TouchableOpacity>
    </View>
  );
}
