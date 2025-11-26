import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function InstructorLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#2086F6",
        tabBarInactiveTintColor: "#666",
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E5E5",
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
        },
        headerStyle: {
          backgroundColor: "#2086F6",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 18,
        },
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="speedometer" size={size} color={color} />
          ),
          headerTitle: "Instruktor Dashboard",
        }}
      />

      <Tabs.Screen
        name="voznje"
        options={{
          title: "Vožnje",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-outline" size={size} color={color} />
          ),
          headerTitle: "Vožnje",
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
          headerTitle: "Chat",
        }}
      />

      <Tabs.Screen
        name="vozilo"
        options={{
          title: "Vozilo",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="car-sport" size={size} color={color} />
          ),
          headerTitle: "Vozilo",
        }}
      />
    </Tabs>
  );
}