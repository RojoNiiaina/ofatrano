import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import 'react-native-reanimated';
import { DataProvider } from '../contexts/DataContext';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <DataProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="auth/login" options={{ headerShown: false }} />
          <Stack.Screen name="auth/register" options={{ headerShown: false }} />
          <Stack.Screen name="tenants/[id]" options={{ title: 'Détails du locataire' }} />
          <Stack.Screen name="buildings/[id]" options={{ title: 'Détails du bâtiment' }} />
          <Stack.Screen name="rooms/[id]" options={{ title: 'Détails de la chambre' }} />
          <Stack.Screen name="buildings/add" options={{ presentation: 'modal', title: 'Ajouter un bâtiment' }} />
          <Stack.Screen name="buildings/edit" options={{ presentation: 'modal', title: 'Modifier le bâtiment' }} />
          <Stack.Screen name="tenants/form" options={{ presentation: 'modal', title: 'Locataire' }} />
          <Stack.Screen name="rooms/edit" options={{ presentation: 'modal', title: 'Modifier la chambre' }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        {/* <StatusBar style="auto" /> */}
      </ThemeProvider>
    </DataProvider>
  );
}
