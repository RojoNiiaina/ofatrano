import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/Colors';
import { Styles, moderateScale } from '../../constants/Styles';
import { useData } from '../../contexts/DataContext';

export default function EditBuildingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { buildings, updateBuilding, deleteBuilding } = useData();
  const building = buildings.find((b) => b.id === id);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [name, setName] = useState(building?.name ?? '');
  const [address, setAddress] = useState(building?.address ?? '');
  const [photo, setPhoto] = useState(building?.photo ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!building) {
    return null;
  }

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Nous avons besoin de la permission pour accéder à vos photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

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
      photo: photo.trim() || undefined,
    });
    Alert.alert('Succès', 'Bâtiment mis à jour');
    router.back();
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteModal(false);
    await deleteBuilding(building.id);
    router.back();
    router.back();
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
        <TouchableOpacity style={styles.photoPicker} onPress={pickImage}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.photoPreview} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <MaterialIcons name="add-photo-alternate" size={48} color={Colors.border} />
              <Text style={styles.photoText}>Ajouter une photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.actions}>
          <Button title="Enregistrer" variant="primary" onPress={handleSave} />
          <Button title="Supprimer le bâtiment" variant="danger" onPress={handleDelete} />
          <Button title="Annuler" variant="outline" onPress={() => router.back()} />
        </View>
      </ScrollView>

      <ConfirmModal
        visible={showDeleteModal}
        title="Supprimer le bâtiment"
        message="Toutes les chambres, locataires et paiements associés seront supprimés. Cette action est irréversible. Voulez-vous continuer ?"
        confirmText="Supprimer"
        cancelText="Annuler"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        variant="danger"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  photoPicker: {
    height: moderateScale(150),
    backgroundColor: Colors.secondaryLight,
    borderRadius: moderateScale(8),
    marginBottom: moderateScale(16),
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoText: {
    marginTop: moderateScale(8),
    color: Colors.border,
    fontSize: moderateScale(14),
  },
  actions: {
    marginTop: moderateScale(24),
    gap: moderateScale(12),
  },
});
