import { MaterialIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { Platform } from 'react-native';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.surface,
          elevation: 0, // for Android
          shadowOpacity: 0, // for iOS
          borderBottomWidth: 1,
          borderBottomColor: Colors.border,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: Colors.textPrimary,
        },
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 30 : 10,
          paddingTop: 10,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Tableau de bord',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="dashboard" color={color} />,
        }}
      />
      <Tabs.Screen
        name="buildings"
        options={{
          title: 'Bâtiments',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="domain" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tenants"
        options={{
          title: 'Locataires',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="people" color={color} />,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          title: 'Paiements',
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="payments" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'explore',
          href: null,
          tabBarIcon: ({ color }) => <MaterialIcons size={28} name="payments" color={color} />,
        }}
      />
    </Tabs>
  );
}
