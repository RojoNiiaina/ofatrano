import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Styles, moderateScale } from '../../constants/Styles';
import { useData } from '../../contexts/DataContext';

export default function EditRoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { rooms, updateRoom, deleteRoom } = useData();
  const room = rooms.find((r) => r.id === id);

  const [number, setNumber] = useState(String(room?.number ?? 1));
  const [floor, setFloor] = useState(room?.floor ?? '');
  const [cost, setCost] = useState(String(room?.cost ?? 0));
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!room) {
    return null;
  }

  const validate = () => {
    const next: Record<string, string> = {};
    const num = parseInt(number, 10);
    const costVal = parseInt(cost, 10);
    if (isNaN(num) || num < 1) next.number = 'Numéro invalide';
    if (isNaN(costVal) || costVal < 0) next.cost = 'Loyer invalide';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    await updateRoom({
      ...room,
      number: parseInt(number, 10),
      floor: floor.trim() || undefined,
      cost: parseInt(cost, 10),
    });
    Alert.alert('Succès', 'Chambre mise à jour');
    router.back();
  };

  const handleDelete = () => {
    if (room.status === 'occupied') {
      Alert.alert('Impossible', 'Retirez le locataire avant de supprimer la chambre');
      return;
    }
    Alert.alert('Supprimer la chambre', 'Cette action est irréversible.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: async () => {
          await deleteRoom(room.id);
          router.back();
          router.back();
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView
      style={Styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={Styles.contentPadding}>
        <Input
          label="Numéro de chambre *"
          value={number}
          onChangeText={setNumber}
          keyboardType="number-pad"
          error={errors.number}
        />
        <Input
          label="Étage (facultatif)"
          placeholder="RDC, 1er, 2ème..."
          value={floor}
          onChangeText={setFloor}
        />
        <Input
          label="Loyer mensuel (Ar) *"
          value={cost}
          onChangeText={setCost}
          keyboardType="number-pad"
          error={errors.cost}
        />

        <View style={styles.actions}>
          <Button title="Enregistrer" variant="primary" onPress={handleSave} />
          <Button title="Supprimer la chambre" variant="danger" onPress={handleDelete} />
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
