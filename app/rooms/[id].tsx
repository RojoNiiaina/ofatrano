import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';
import { Styles, moderateScale } from '../../constants/Styles';
import { useData } from '../../contexts/DataContext';
import { getRentStatusForPeriod, rentStatusLabel, toPeriod } from '../../utils/payments';

export default function RoomDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { rooms, tenants, buildings, payments, removeTenantFromRoom, recordPayment } = useData();

  const room = rooms.find((r) => r.id === id);
  const tenant = room?.tenantId ? tenants.find((t) => t.id === room.tenantId) : null;
  const building = room ? buildings.find((b) => b.id === room.buildingId) : null;
  const isOccupied = room?.status === 'occupied';
  const currentPeriod = toPeriod();

  const lastPayment = tenant
    ? payments
        .filter((p) => p.tenantId === tenant.id && p.roomId === id)
        .sort((a, b) => b.date.localeCompare(a.date))[0]
    : null;

  const rentStatus = tenant
    ? getRentStatusForPeriod(tenant, payments, currentPeriod)
    : null;

  const handleRemove = () => {
    Alert.alert(
      'Retirer le locataire',
      'Le locataire et son historique de paiements seront supprimés.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            if (typeof id === 'string') {
              await removeTenantFromRoom(id);
              Alert.alert('Succès', 'Locataire retiré de la chambre');
            }
          },
        },
      ]
    );
  };

  const handleAssign = () => {
    if (typeof id === 'string') {
      router.push(`/tenants/form?roomId=${id}` as any);
    }
  };

  const handlePayment = async () => {
    if (typeof id !== 'string' || !tenant || !room) return;

    try {
      await recordPayment({
        roomId: id,
        tenantId: tenant.id,
        amount: room.cost,
        date: new Date().toISOString().split('T')[0],
      });
      Alert.alert('Succès', 'Paiement enregistré pour ce mois');
    } catch (error) {
      if (error instanceof Error && error.message === 'PAYMENT_ALREADY_RECORDED') {
        Alert.alert('Information', 'Le loyer de ce mois est déjà payé');
      } else {
        Alert.alert('Erreur', 'Impossible d\'enregistrer le paiement');
      }
    }
  };

  if (!room) {
    return (
      <View style={[Styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={Styles.title}>Chambre introuvable</Text>
      </View>
    );
  }

  return (
    <ScrollView style={Styles.container} contentContainerStyle={Styles.contentPadding}>
      <View style={Styles.rowBetween}>
        <View>
          <Text style={Styles.title}>
            Chambre {room.number}
            {room.floor ? ` (${room.floor})` : ''}
          </Text>
          <Text style={Styles.subtitle}>{building?.name ?? building?.address ?? ''}</Text>
        </View>
        <Badge
          label={isOccupied ? 'Occupée' : 'Disponible'}
          status={isOccupied ? 'danger' : 'success'}
        />
      </View>

      <Text style={[Styles.title, { marginTop: moderateScale(16), fontSize: moderateScale(18) }]}>Informations Locataire</Text>
      <Card style={{ marginTop: moderateScale(8) }}>
        {tenant ? (
          <View>
            <TouchableOpacity onPress={() => router.push(`/tenants/${tenant.id}` as any)}>
              <View style={Styles.rowCentered}>
                {tenant.photo ? (
                  <Image source={{ uri: tenant.photo }} style={styles.tenantAvatar} />
                ) : (
                  <View style={styles.tenantAvatar}>
                    <MaterialIcons name="person" size={20} color={Colors.textSecondary} />
                  </View>
                )}
                <Text style={[Styles.label, { marginLeft: moderateScale(8), marginBottom: 0 }]}>
                  {tenant.lastName} {tenant.firstName}
                </Text>
                <MaterialIcons name="chevron-right" size={moderateScale(20)} color={Colors.textMuted} style={{ marginLeft: 'auto' }} />
              </View>
            </TouchableOpacity>
            <View style={[Styles.rowCentered, { marginTop: moderateScale(12) }]}>
              <MaterialIcons name="phone" size={moderateScale(20)} color={Colors.textSecondary} />
              <Text style={[Styles.body, { marginLeft: moderateScale(8) }]}>{tenant.phone}</Text>
            </View>
            {tenant.email && (
              <View style={[Styles.rowCentered, { marginTop: moderateScale(12) }]}>
                <MaterialIcons name="email" size={moderateScale(20)} color={Colors.textSecondary} />
                <Text style={[Styles.body, { marginLeft: moderateScale(8) }]}>{tenant.email}</Text>
              </View>
            )}
            <View style={[Styles.rowCentered, { marginTop: moderateScale(12) }]}>
              <MaterialIcons name="event" size={moderateScale(20)} color={Colors.textSecondary} />
              <Text style={[Styles.body, { marginLeft: moderateScale(8) }]}>Paiement le {tenant.paymentDay} du mois</Text>
            </View>
          </View>
        ) : (
          <Text style={Styles.body}>Aucun locataire assigné.</Text>
        )}
      </Card>

      <Text style={[Styles.title, { marginTop: moderateScale(16), fontSize: moderateScale(18) }]}>Finances</Text>
      <Card style={{ marginTop: moderateScale(8) }}>
        <View style={Styles.rowBetween}>
          <Text style={Styles.body}>Loyer mensuel</Text>
          <Text style={Styles.label}>{room.cost.toLocaleString('fr-FR')} Ar</Text>
        </View>
        {rentStatus && (
          <View style={[Styles.rowBetween, { marginTop: moderateScale(16) }]}>
            <Text style={Styles.body}>Loyer du mois</Text>
            <Badge
              label={rentStatusLabel[rentStatus]}
              status={rentStatus === 'paid' ? 'success' : rentStatus === 'pending' ? 'warning' : 'danger'}
            />
          </View>
        )}
        {lastPayment && (
          <View style={[Styles.rowBetween, { marginTop: moderateScale(16) }]}>
            <Text style={Styles.body}>Dernier paiement</Text>
            <Text style={Styles.label}>{lastPayment.date}</Text>
          </View>
        )}
      </Card>

      <View style={styles.actions}>
        {isOccupied ? (
          <>
            <Button
              title="Enregistrer Paiement"
              variant="primary"
              onPress={handlePayment}
              icon={<MaterialIcons name="payment" size={20} color="#FFF" />}
            />
            <Button title="Retirer Locataire" variant="danger" onPress={handleRemove} />
          </>
        ) : (
          <Button title="Assigner Locataire" variant="primary" onPress={handleAssign} />
        )}
        <Button
          title="Modifier Chambre"
          variant="secondary"
          onPress={() => router.push(`/rooms/edit?id=${room.id}` as any)}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginTop: moderateScale(32),
  },
  tenantAvatar: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
