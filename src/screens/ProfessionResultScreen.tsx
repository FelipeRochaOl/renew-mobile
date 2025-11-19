import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { assessProfessionRisk, getRecommendationsForUser } from '../services/api/client';
import { ProfessionRisk } from '../services/api/types';
import Button from '../ui/Button';
import Card from '../ui/Card';

type NavProp = StackNavigationProp<RootStackParamList, 'ProfessionResult'>;

type Props = { navigation: NavProp; route: RouteProp<RootStackParamList, 'ProfessionResult'> };

export default function ProfessionResultScreen({ navigation, route }: Props) {
  const { user, authToken } = useUser();
  const { profession } = route.params;
  const [result, setResult] = useState<ProfessionRisk | null>(null);
  const [loading, setLoading] = useState(true);
  const effectiveUserId = user?._id || user?.id;
  const riskColor = useMemo(() => ({
    LOW: '#16a34a',
    MEDIUM: '#f59e0b',
    HIGH: '#dc2626',
  } as const), []);

  useEffect(() => {
    (async () => {
      try {
        if (!authToken) throw new Error('Usuário não autenticado');
        if (!effectiveUserId) throw new Error('ID do usuário ausente');
        const risk = await assessProfessionRisk(authToken, { userId: effectiveUserId, profession });
        setResult(risk);
      } catch (e: any) {
        console.error(e);
        alert('Erro ao avaliar profissão: ' + e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [profession, effectiveUserId, authToken]);

  async function goToPaths() {
    if (!effectiveUserId) return navigation.navigate('LearningPaths');
    try {
      if (!authToken) throw new Error('Usuário não autenticado');
      const data = await getRecommendationsForUser(authToken, effectiveUserId);
      navigation.navigate('LearningPaths', { suggestedPaths: data.suggestedPaths });
    } catch (e: any) {
      console.error(e);
      navigation.navigate('LearningPaths');
    }
  }

  return (
    <View className="flex-1 p-4">
      <Text className="text-2xl font-bold mb-3">{profession}</Text>
      {loading && <Text>Avaliando...</Text>}
      {result && (
        <Card className="gap-2">
          <Text className="text-lg font-bold" style={{ color: riskColor[result.riskLevel] }}>{result.riskLevel}</Text>
          <Text className="text-gray-800">{result.description}</Text>
          <Text className="mt-2 font-semibold">Tendências</Text>
          <FlatList
            data={result.trends}
            keyExtractor={(item, idx) => item + idx}
            renderItem={({ item }) => <Text className="text-gray-600 my-0.5">• {item}</Text>}
          />
        </Card>
      )}

      <View className="h-3" />
      <Button title="Ver trilhas para mim" onPress={goToPaths} />
      <View className="h-2" />
      <Button title="Conversar com o mentor de IA" onPress={() => navigation.navigate('Chatbot')} />
    </View>
  );
}
