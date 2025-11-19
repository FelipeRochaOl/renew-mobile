import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getLearningPaths } from '../services/api/client';
import { LearningPath } from '../services/api/types';

type NavProp = StackNavigationProp<RootStackParamList, 'LearningPaths'>;
type RouteP = RouteProp<RootStackParamList, 'LearningPaths'>;

export default function LearningPathsScreen({ navigation, route }: { navigation: NavProp; route: RouteP }) {
  const { authToken } = useUser();
  const [paths, setPaths] = useState<LearningPath[]>(route.params?.suggestedPaths || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (paths.length > 0) return;
    (async () => {
      setLoading(true);
      try {
        if (!authToken) throw new Error('Usuário não autenticado');
        const list = await getLearningPaths(authToken);
        setPaths(list);
      } catch (e: any) {
        console.error(e);
        alert('Erro ao carregar trilhas: ' + e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <View className="flex-1 p-3">
      {loading && <Text>Carregando...</Text>}
      <FlatList
        data={paths}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable className="bg-white p-3 rounded-lg mb-2 border border-gray-100" onPress={() => navigation.navigate('LearningPathDetail', { id: item.id })}>
            <Text className="font-bold">{item.title}</Text>
            <Text className="text-gray-700 mt-1">{item.description}</Text>
            <Text className="text-gray-500 mt-1 text-xs">Destino: {item.targetProfession} • Nível: {item.level}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}
