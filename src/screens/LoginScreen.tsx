import { loginUser } from '@/services/api/client';
import { StackNavigationProp } from '@react-navigation/stack';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../navigation/AppNavigator';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Login'>;
}

export default function LoginScreen({ navigation }: Props) {
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Erro', 'Informe e-mail e senha');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await loginUser(email, password);
      await login(token, user); // persiste token + usuário
      navigation.replace('Welcome');
    } catch (e: any) {
      Alert.alert('Falha', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 p-6 justify-center bg-white">
      <Text className="text-2xl font-bold mb-4">Entrar</Text>
      <TextInput
        placeholder="E-mail"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        className="border border-gray-300 rounded px-3 py-2 mb-3"
      />
      <TextInput
        placeholder="Senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="border border-gray-300 rounded px-3 py-2 mb-6"
      />
      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        className="bg-blue-500 rounded py-3 mb-3"
      >
        <Text className="text-center text-white font-semibold">{loading ? '...' : 'Login'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')} className="py-2">
        <Text className="text-center text-blue-600">Criar conta</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('PasswordRecovery')} className="py-2">
        <Text className="text-center text-blue-600">Esqueci minha senha</Text>
      </TouchableOpacity>
    </View>
  );
}
