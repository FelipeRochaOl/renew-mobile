import { StackNavigationProp } from '@react-navigation/stack';
import { useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { createUser, loginUser } from '../services/api/client';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Register'>;
}

export default function RegisterScreen({ navigation }: Props) {
  const { setUser, login } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'worker' | 'company' | 'admin'>('worker');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Campos obrigatórios', 'Preencha nome, e-mail e senha.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    setLoading(true);
    try {
      const user = await createUser({ name, email, role, password });
      setUser(user); // persiste localmente
      // Tentar login imediato
      try {
        const { token, user: loggedUser } = await loginUser(email, password);
        await login(token, loggedUser);
      } catch {
        // se falhar, usuário continua criado apenas local
      }
      Alert.alert('Sucesso', 'Usuário cadastrado!');
      navigation.replace('Welcome');
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
      <View className="flex-1 p-6">
        <Text className="text-2xl font-bold mb-4">Cadastro</Text>
        <TextInput
          placeholder="Nome"
          value={name}
          onChangeText={setName}
          className="border border-gray-300 rounded px-3 py-2 mb-3"
        />
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
          className="border border-gray-300 rounded px-3 py-2 mb-3"
          keyboardType="visible-password"
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          placeholder='Confirme Senha'
          secureTextEntry
          className="border border-gray-300 rounded px-3 py-2 mb-6"
          keyboardType="visible-password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <Text className="mb-2 font-semibold">Tipo</Text>
        <View className="flex-row mb-4">
          {(['worker', 'company', 'admin'] as const).map(opt => (
            <TouchableOpacity
              key={opt}
              onPress={() => setRole(opt)}
              className={`px-3 py-2 mr-2 rounded ${role === opt ? 'bg-blue-500' : 'bg-gray-200'}`}
            >
              <Text className={role === opt ? 'text-white' : 'text-gray-800'}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          onPress={handleRegister}
          disabled={loading}
          className="bg-green-600 rounded py-3"
        >
          <Text className="text-center text-white font-semibold">{loading ? '...' : 'Cadastrar'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
