import { Tabs } from 'expo-router';
import { Home, PlusCircle, UtensilsCrossed, Calendar, User } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../../constants/tokens';

export default function TabsLayout() {
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 80,
            paddingBottom: 20,
            paddingTop: 10,
          },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarItemStyle: { minHeight: 44 },
          tabBarLabelStyle: {
            fontSize: 10,
            fontFamily: fonts.bodyMed,
            letterSpacing: 0.5,
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="home/index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="record/index"
          options={{
            title: 'Record',
            tabBarIcon: ({ color, size }) => <PlusCircle size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="events/index"
          options={{
            title: 'Events',
            tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="meal"
          options={{
            title: 'Meal',
            tabBarIcon: ({ color, size }) => <UtensilsCrossed size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="account"
          options={{
            title: 'Account',
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
      </Tabs>
    </SafeAreaView>
  );
}
