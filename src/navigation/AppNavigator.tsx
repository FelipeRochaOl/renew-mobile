import { createStackNavigator } from '@react-navigation/stack';
import ChatbotScreen from '../screens/ChatbotScreen';
import LearningPathDetailScreen from '../screens/LearningPathDetailScreen';
import LearningPathsScreen from '../screens/LearningPathsScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import PasswordRecoveryScreen from '../screens/PasswordRecoveryScreen';
import ProfessionResultScreen from '../screens/ProfessionResultScreen';
import RegisterScreen from '../screens/RegisterScreen';
import SplashScreen from '../screens/SplashScreen';
import { LearningPath } from '../services/api/types';
import DrawerNavigator from './DrawerNavigator';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  PasswordRecovery: undefined;
  Welcome: undefined;
  Onboarding: undefined;
  ProfessionResult: { profession: string };
  LearningPaths: { suggestedPaths?: LearningPath[] } | undefined;
  LearningPathDetail: { id: string };
  Chatbot: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash">
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Cadastro' }} />
      <Stack.Screen name="PasswordRecovery" component={PasswordRecoveryScreen} options={{ title: 'Recuperar Senha' }} />
      <Stack.Screen name="Welcome" component={DrawerNavigator} options={{ headerShown: false, title: 'Bem vindo' }} />
      <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ title: 'Seu Perfil' }} />
      <Stack.Screen name="ProfessionResult" component={ProfessionResultScreen} options={{ title: 'Resultado' }} />
      <Stack.Screen name="LearningPaths" component={LearningPathsScreen} options={{ title: 'Trilhas' }} />
      <Stack.Screen name="LearningPathDetail" component={LearningPathDetailScreen} options={{ title: 'Trilha' }} />
      <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'Mentor de IA' }} />
    </Stack.Navigator>
  );
}
