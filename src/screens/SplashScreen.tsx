import { StackNavigationProp } from '@react-navigation/stack';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useUser } from '../context/UserContext';
import { RootStackParamList } from '../navigation/AppNavigator';

interface Props {
  navigation: StackNavigationProp<RootStackParamList, 'Splash'>;
}

export default function SplashScreen({ navigation }: Props) {
  const { authToken, user } = useUser();
  const effectiveUserId = user?._id || user?.id;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!authToken) {
        navigation.replace('Login');
      } else if (!effectiveUserId) {
        navigation.replace('Welcome');
      } else {
        navigation.replace('Welcome');
      }
    }, 800);
    return () => clearTimeout(timeout);
  }, [authToken, effectiveUserId, navigation]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator />
    </View>
  );
}
