import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';
import { Styles, moderateScale } from '../../constants/Styles';
import { useData } from '../../contexts/DataContext';
import { Tenant } from '../../types/models';
import { formatPeriodShort, getCurrentRentStatus, rentStatusLabel, toPeriod } from '../../utils/payments';

export default function TenantsScreen() {
  const { tenants, rooms, buildings, payments } = useData();
  const currentPeriod = toPeriod();

  const renderItem = ({ item }: { item: Tenant }) => {
    const room = rooms.find((r) => r.id === item.roomId);
    const building = buildings.find((b) => b.id === room?.buildingId);
    const buildingName = building?.name ?? building?.address ?? 'Non assigné';
    const rentStatus = getCurrentRentStatus(item, payments);

    const paymentStatusColor =
      rentStatus === 'paid'
        ? Colors.success
        : rentStatus === 'pending'
          ? Colors.warning
          : Colors.danger;

    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/tenants/${item.id}` as any)}>
        <Card style={styles.cardInfo}>
          <View style={Styles.rowCentered}>
            {item.photo ? (
              <Image source={{ uri: item.photo }} style={styles.avatar} />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.firstName.charAt(0)}</Text>
              </View>
            )}
            <View style={styles.info}>
              <Text style={Styles.label}>
                {item.lastName} {item.firstName}
              </Text>

              <View style={[Styles.rowCentered, { marginTop: moderateScale(4) }]}>
                <MaterialIcons name="phone" size={moderateScale(14)} color={Colors.textSecondary} />
                <Text style={[Styles.body, { color: Colors.textSecondary, marginLeft: moderateScale(4) }]}>{item.phone}</Text>
              </View>

              <View style={[Styles.rowCentered, { marginTop: moderateScale(6) }]}>
                <MaterialIcons name="meeting-room" size={moderateScale(14)} color={Colors.textSecondary} />
                <Text style={[Styles.body, { color: Colors.textSecondary, marginLeft: moderateScale(4) }]} numberOfLines={1}>
                  Chambre {room?.number ?? '?'}
                  {room?.floor ? ` (${room.floor})` : ''} • {buildingName}
                </Text>
              </View>

              <View style={[Styles.rowCentered, { marginTop: moderateScale(6) }]}>
                <MaterialIcons name="payments" size={moderateScale(14)} color={paymentStatusColor} />
                <Text style={[Styles.body, { color: paymentStatusColor, marginLeft: moderateScale(4), fontWeight: '500' }]}>
                  {rentStatusLabel[rentStatus]} ({formatPeriodShort(currentPeriod)})
                </Text>
              </View>
            </View>
            <View style={styles.actionBtn}>
              <MaterialIcons name="chevron-right" size={moderateScale(24)} color={Colors.textMuted} />
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={Styles.container}>
      <FlatList
        data={tenants}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={Styles.contentPadding}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="people-outline" size={64} color={Colors.border} />
            <Text style={[Styles.subtitle, { marginTop: 16 }]}>Aucun locataire trouvé</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardInfo: {
    padding: moderateScale(16),
    marginBottom: moderateScale(8),
  },
  avatar: {
    width: moderateScale(48),
    height: moderateScale(48),
    borderRadius: moderateScale(24),
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: Colors.secondary,
    fontSize: moderateScale(20),
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
    marginLeft: moderateScale(16),
  },
  actionBtn: {
    padding: moderateScale(8),
  },
  emptyState: {
    padding: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
