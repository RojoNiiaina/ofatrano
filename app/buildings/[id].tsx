import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';
import { Styles, moderateScale } from '../../constants/Styles';
import { useData } from '../../contexts/DataContext';
import { Room } from '../../types/models';

export default function BuildingDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { buildings, rooms, tenants } = useData();

  const building = buildings.find((b) => b.id === id);
  const buildingRooms = rooms.filter((r) => r.buildingId === id);

  const getTenantName = (tenantId: string | null) => {
    if (!tenantId) return null;
    const t = tenants.find((t) => t.id === tenantId);
    return t ? `${t.lastName} ${t.firstName}` : null;
  };

  const renderItem = ({ item }: { item: Room }) => {
    const isOccupied = item.status === 'occupied';

    return (
      <TouchableOpacity activeOpacity={0.7} onPress={() => router.push(`/rooms/${item.id}` as any)}>
        <Card style={styles.cardInfo}>
          <View style={Styles.rowBetween}>
            <View>
              <Text style={Styles.label}>
                Chambre {item.number}
                {item.floor ? ` (${item.floor})` : ''} — {item.cost.toLocaleString('fr-FR')} Ar / mois
              </Text>
              {isOccupied && <Text style={Styles.body}>{getTenantName(item.tenantId)}</Text>}
            </View>
            <View style={Styles.rowCentered}>
              <View
                style={[styles.statusIndicator, { backgroundColor: isOccupied ? Colors.danger : Colors.success }]}
              />
              <Text style={[Styles.body, { color: isOccupied ? Colors.danger : Colors.success, marginLeft: moderateScale(6) }]}>
                {isOccupied ? 'Occupée' : 'Disponible'}
              </Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <View style={Styles.container}>
      <View style={styles.header}>
        <Text style={Styles.title}>{building?.name ?? building?.address ?? `Bâtiment ${id}`}</Text>
        {building?.name && <Text style={Styles.subtitle}>{building.address}</Text>}
        <Text style={[Styles.body, { marginTop: moderateScale(4) }]}>{buildingRooms.length} chambre(s)</Text>
        {building && (
          <View style={{ marginTop: moderateScale(12) }}>
            <Button
              title="Modifier le bâtiment"
              variant="outline"
              onPress={() => router.push(`/buildings/edit?id=${building.id}` as any)}
            />
          </View>
        )}
      </View>

      <FlatList
        data={buildingRooms}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={Styles.contentPadding}
        ListEmptyComponent={
          <Text style={[Styles.body, { color: Colors.textSecondary, textAlign: 'center', marginTop: 24 }]}>
            Aucune chambre enregistrée
          </Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: moderateScale(20),
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  cardInfo: {
    padding: moderateScale(16),
    marginBottom: moderateScale(8),
  },
  statusIndicator: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
  },
});
