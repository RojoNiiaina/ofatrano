import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Colors } from '../../constants/Colors';
import { Styles, moderateScale } from '../../constants/Styles';
import { useData } from '../../contexts/DataContext';

export default function AddBuildingScreen() {
  const { addBuilding } = useData();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [roomsCount, setRoomsCount] = useState('');
  const [defaultCost, setDefaultCost] = useState('');
  const [photo, setPhoto] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    const count = parseInt(roomsCount, 10);
    if (isNaN(count) || count < 1) next.roomsCount = 'Minimum 1 chambre';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const count = parseInt(roomsCount, 10);
    const cost = parseInt(defaultCost, 10) || 0;

    await addBuilding(
      {
        name: name.trim() || undefined,
        address: address.trim(),
        roomCount: count,
        photo: photo.trim() || undefined,
      },
      cost
    );
    Alert.alert('Succès', `${count} chambre(s) créée(s)`);
    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={Styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={Styles.contentPadding}>
        <View style={styles.form}>
          <Input
            label="Nom du bâtiment (facultatif)"
            placeholder="ex. Résidence Soleil"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Adresse *"
            placeholder="Lot IVG 12, Analakely, Antananarivo"
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
          <Input
            label="Nombre de chambres *"
            placeholder="ex. 12"
            value={roomsCount}
            onChangeText={setRoomsCount}
            keyboardType="number-pad"
            error={errors.roomsCount}
          />
          <Input
            label="Loyer par défaut (Ar, facultatif)"
            placeholder="ex. 150000"
            value={defaultCost}
            onChangeText={setDefaultCost}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.actions}>
          <Button title="Enregistrer" variant="primary" onPress={handleSave} />
          <Button title="Annuler" variant="outline" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: moderateScale(16),
  },
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
    marginTop: moderateScale(40),
  },
});
