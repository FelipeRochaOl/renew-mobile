import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Text, View } from 'react-native';
import { useUser } from '../context/UserContext';
import ChatbotScreen from '../screens/ChatbotScreen';
import LearningPathsScreen from '../screens/LearningPathsScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import Button from '../ui/Button';

export type WelcomeDrawerParamList = {
  Home: undefined;
  LearningPaths: undefined;
  Chatbot: undefined;
};

const Drawer = createDrawerNavigator<WelcomeDrawerParamList>();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useUser();
  return (
    <DrawerContentScrollView {...props}>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 4 }}>
          {user?.name || 'Usuário'}
        </Text>
        {user?.email ? (
          <Text style={{ fontSize: 14, color: '#555', marginBottom: 12 }}>{user.email}</Text>
        ) : null}
        <Button
          title="Sair"
          onPress={() => {
            logout();
            props.navigation.reset({ index: 0, routes: [{ name: 'Login' as never }] });
          }}
        />
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{ headerShown: true }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen name="Home" component={WelcomeScreen} options={{ title: 'Início' }} />
      <Drawer.Screen name="LearningPaths" component={LearningPathsScreen} options={{ title: 'Trilhas' }} />
      <Drawer.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'Mentor de IA' }} />
    </Drawer.Navigator>
  );
}
