import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Styles, moderateScale } from '../../constants/Styles';
import { useData } from '../../contexts/DataContext';

export default function EditBuildingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { buildings, updateBuilding, deleteBuilding } = useData();
  const building = buildings.find((b) => b.id === id);

  const [name, setName] = useState(building?.name ?? '');
  const [address, setAddress] = useState(building?.address ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!building) {
    return null;
  }

  const validate = () => {
    const next: Record<string, string> = {};
    if (!address.trim()) next.address = 'L\'adresse est obligatoire';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    await updateBuilding({
      ...building,
      name: name.trim() || undefined,
      address: address.trim(),
    });
    Alert.alert('Succès', 'Bâtiment mis à jour');
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer le bâtiment',
      'Toutes les chambres, locataires et paiements associés seront supprimés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            await deleteBuilding(building.id);
            router.back();
            router.back();
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={Styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={Styles.contentPadding}>
        <Input
          label="Nom du bâtiment (facultatif)"
          value={name}
          onChangeText={setName}
        />
        <Input
          label="Adresse *"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
          style={{ height: 80, paddingVertical: 12 }}
          error={errors.address}
        />

        <View style={styles.actions}>
          <Button title="Enregistrer" variant="primary" onPress={handleSave} />
          <Button title="Supprimer le bâtiment" variant="danger" onPress={handleDelete} />
          <Button title="Annuler" variant="outline" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: moderateScale(24),
    gap: moderateScale(12),
  },
});
