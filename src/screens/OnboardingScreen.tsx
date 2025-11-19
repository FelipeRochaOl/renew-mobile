import { updateUser } from '@/services/api/client';
import { StackNavigationProp } from '@react-navigation/stack';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Label from '../ui/Label';
import Select from '../ui/Select';

const EDUCATION_OPTIONS = ['Fundamental', 'Médio', 'Técnico', 'Superior', 'Pós-graduação'];

type Props = { navigation: StackNavigationProp<RootStackParamList, 'Onboarding'> };

export default function OnboardingScreen({ navigation }: Props) {
  const { setUser, user, authToken } = useUser();
  const effectiveUserId = user?._id || user?.id;
  const [currentProfession, setCurrentProfession] = useState('');
  const BRAZIL_STATES: { label: string; value: string }[] = [
    { label: 'AC - Acre', value: 'AC' },
    { label: 'AL - Alagoas', value: 'AL' },
    { label: 'AP - Amapá', value: 'AP' },
    { label: 'AM - Amazonas', value: 'AM' },
    { label: 'BA - Bahia', value: 'BA' },
    { label: 'CE - Ceará', value: 'CE' },
    { label: 'DF - Distrito Federal', value: 'DF' },
    { label: 'ES - Espírito Santo', value: 'ES' },
    { label: 'GO - Goiás', value: 'GO' },
    { label: 'MA - Maranhão', value: 'MA' },
    { label: 'MT - Mato Grosso', value: 'MT' },
    { label: 'MS - Mato Grosso do Sul', value: 'MS' },
    { label: 'MG - Minas Gerais', value: 'MG' },
    { label: 'PA - Pará', value: 'PA' },
    { label: 'PB - Paraíba', value: 'PB' },
    { label: 'PR - Paraná', value: 'PR' },
    { label: 'PE - Pernambuco', value: 'PE' },
    { label: 'PI - Piauí', value: 'PI' },
    { label: 'RJ - Rio de Janeiro', value: 'RJ' },
    { label: 'RN - Rio Grande do Norte', value: 'RN' },
    { label: 'RS - Rio Grande do Sul', value: 'RS' },
    { label: 'RO - Rondônia', value: 'RO' },
    { label: 'RR - Roraima', value: 'RR' },
    { label: 'SC - Santa Catarina', value: 'SC' },
    { label: 'SP - São Paulo', value: 'SP' },
    { label: 'SE - Sergipe', value: 'SE' },
    { label: 'TO - Tocantins', value: 'TO' },
  ];
  const [region, setRegion] = useState('SP');
  const [educationLevel, setEducationLevel] = useState(EDUCATION_OPTIONS[0]);
  const [loading, setLoading] = useState(false);

  const canContinue = !!user?.name && !!user?.email && !!currentProfession;

  async function handleContinue() {
    if (!canContinue) return;
    setLoading(true);
    try {
      if (!user) throw new Error('User not loaded');
      const { name, email, role } = user;
      if (!effectiveUserId) throw new Error('User ID is missing');
      if (!authToken) throw new Error('Auth token is missing');
      const updatedUser = await updateUser(effectiveUserId, authToken, { name, email, role, currentProfession, region, educationLevel });
      setUser(updatedUser);
      navigation.replace('ProfessionResult', { profession: currentProfession });
    } catch (errors) {
      const error = errors as Error;
      console.error(error);
      alert('Erro ao atualizar o usuário: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 p-4 gap-2">
      <Label>Nome</Label>
      <Text>{user?.name || '-'}</Text>

      <Label>Email</Label>
      <Text>{user?.email || '-'}</Text>

      <Label>Profissão atual</Label>
      <Input value={currentProfession} onChangeText={setCurrentProfession} placeholder="Ex.: Segurança de shopping" />

      <Label>Estado (UF)</Label>
      <Select selectedValue={region} onValueChange={setRegion} options={BRAZIL_STATES} />

      <Label>Escolaridade</Label>
      <Select selectedValue={educationLevel} onValueChange={setEducationLevel} options={EDUCATION_OPTIONS} />

      <Button title={loading ? 'Enviando...' : 'Continuar'} onPress={handleContinue} disabled={!canContinue || loading} />
    </View>
  );
}
