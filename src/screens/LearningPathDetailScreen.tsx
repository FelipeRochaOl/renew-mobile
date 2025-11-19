import { useUser } from '@/context/UserContext';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import { Alert, FlatList, Text, View } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getLearningPath } from '../services/api/client';
import { LearningPath } from '../services/api/types';
import Button from '../ui/Button';

type NavProp = StackNavigationProp<RootStackParamList, 'LearningPathDetail'>;

type Props = { navigation: NavProp; route: RouteProp<RootStackParamList, 'LearningPathDetail'> };

export default function LearningPathDetailScreen({ navigation, route }: Props) {
  const { authToken } = useUser();
  const { id } = route.params;
  const [item, setItem] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        if (!authToken) throw new Error('Usuário não autenticado');
        const data = await getLearningPath(authToken, id);
        setItem(data);
      } catch (e: any) {
        console.error(e);
        alert('Erro ao carregar trilha: ' + e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function startPath() {
    Alert.alert('Trilha', 'Começando a trilha! (placeholder)');
  }

  if (loading) return <View className="flex-1 p-4"><Text>Carregando...</Text></View>;
  if (!item) return <View className="flex-1 p-4"><Text>Não encontrado.</Text></View>;

  return (
    <View className="flex-1 p-4">
      <Text className="text-xl font-bold">{item.title}</Text>
      <Text className="text-gray-500">Destino: {item.targetProfession} • Nível: {item.level}</Text>
      <Text className="text-gray-800">{item.description}</Text>

      <Text className="text-xl font-bold mt-3">Módulos</Text>
      <FlatList
        data={item.modules}
        keyExtractor={(m) => m.id}
        renderItem={({ item: m }) => (
          <View className="py-2 border-b border-gray-100">
            <Text className="font-semibold">{m.title}</Text>
            <Text className="text-gray-500">{m.durationHours}h • {m.skills.join(', ')}</Text>
          </View>
        )}
      />

      <Button title="Começar trilha" onPress={startPath} />
    </View>
  );
}
