import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Styles, moderateScale } from '../../constants/Styles';
import { useData } from '../../contexts/DataContext';

export default function TenantFormScreen() {
  const { roomId, id } = useLocalSearchParams<{ roomId?: string; id?: string }>();
  const { tenants, assignTenantToRoom, updateTenant } = useData();
  const isEdit = !!id;
  const existing = isEdit ? tenants.find((t) => t.id === id) : null;

  const [lastName, setLastName] = useState(existing?.lastName ?? '');
  const [firstName, setFirstName] = useState(existing?.firstName ?? '');
  const [phone, setPhone] = useState(existing?.phone ?? '');
  const [email, setEmail] = useState(existing?.email ?? '');
  const [cin, setCin] = useState(existing?.cin ?? '');
  const [paymentDay, setPaymentDay] = useState(String(existing?.paymentDay ?? 1));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const next: Record<string, string> = {};
    if (!lastName.trim()) next.lastName = 'Le nom est obligatoire';
    if (!firstName.trim()) next.firstName = 'Le prénom est obligatoire';
    if (!phone.trim()) next.phone = 'Le téléphone est obligatoire';
    const day = parseInt(paymentDay, 10);
    if (isNaN(day) || day < 1 || day > 28) next.paymentDay = 'Jour entre 1 et 28';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    const tenantData = {
      lastName: lastName.trim(),
      firstName: firstName.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      cin: cin.trim() || undefined,
      paymentDay: parseInt(paymentDay, 10),
    };

    try {
      if (isEdit && existing) {
        await updateTenant({ ...existing, ...tenantData });
        Alert.alert('Succès', 'Locataire mis à jour');
        router.back();
      } else if (roomId) {
        await assignTenantToRoom(tenantData, roomId);
        Alert.alert('Succès', 'Locataire assigné à la chambre');
        router.back();
      }
    } catch {
      Alert.alert('Erreur', 'Impossible d\'enregistrer le locataire');
    }
  };

  return (
    <KeyboardAvoidingView
      style={Styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={Styles.contentPadding}>
        <Input
          label="Nom *"
          placeholder="Rakoto"
          value={lastName}
          onChangeText={setLastName}
          error={errors.lastName}
        />
        <Input
          label="Prénom *"
          placeholder="Jean"
          value={firstName}
          onChangeText={setFirstName}
          error={errors.firstName}
        />
        <Input
          label="Téléphone *"
          placeholder="+261 34 12 345 67"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          error={errors.phone}
        />
        <Input
          label="Email (facultatif)"
          placeholder="email@exemple.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Input
          label="CIN (facultatif)"
          placeholder="101 012 345 678"
          value={cin}
          onChangeText={setCin}
        />
        <Input
          label="Jour de paiement (1-28) *"
          placeholder="5"
          value={paymentDay}
          onChangeText={setPaymentDay}
          keyboardType="number-pad"
          error={errors.paymentDay}
        />

        <View style={styles.actions}>
          <Button title="Enregistrer" variant="primary" onPress={handleSave} />
          <Button title="Annuler" variant="outline" onPress={() => router.back()} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: moderateScale(24),
  },
});
