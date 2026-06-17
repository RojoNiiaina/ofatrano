import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';
import { Styles, moderateScale } from '../../constants/Styles';
import { useData } from '../../contexts/DataContext';
import { getPaymentPeriod, toPeriod } from '../../utils/payments';

export default function DashboardScreen() {
  const { buildings, rooms, tenants, payments, isLoaded } = useData();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 360;

  if (!isLoaded) return null;

  const currentPeriod = toPeriod();
  const totalBuildings = buildings.length;
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;

  const currentMonthRevenue = payments
    .filter((p) => getPaymentPeriod(p) === currentPeriod && p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const lateTenants = tenants.filter((t) => {
    const hasPaid = payments.some(
      (p) => p.tenantId === t.id && getPaymentPeriod(p) === currentPeriod && p.status === 'paid'
    );
    if (hasPaid) return false;
    const dueDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      t.paymentDay
    );
    return new Date() > dueDate;
  }).length;

  const recentPayments = [...payments]
    .filter((p) => p.status === 'paid')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);

  return (
    <ScrollView style={Styles.container} contentContainerStyle={Styles.contentPadding}>
      <Text style={Styles.title}>Vue d'ensemble</Text>

      <View style={styles.grid}>
        <Card style={[styles.gridItem, isSmallScreen && styles.gridItemSmall]}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="domain" size={moderateScale(24)} color={Colors.primary} />
          </View>
          <Text style={styles.value}>{totalBuildings}</Text>
          <Text style={Styles.subtitle}>Bâtiments</Text>
        </Card>

        <Card style={[styles.gridItem, isSmallScreen && styles.gridItemSmall]}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="meeting-room" size={moderateScale(24)} color={Colors.secondary} />
          </View>
          <Text style={styles.value}>{totalRooms}</Text>
          <Text style={Styles.subtitle}>Chambres</Text>
        </Card>

        <Card style={[styles.gridItem, isSmallScreen && styles.gridItemSmall]}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="vpn-key" size={moderateScale(24)} color={Colors.warning} />
          </View>
          <Text style={styles.value}>{occupiedRooms}</Text>
          <Text style={Styles.subtitle}>Occupées</Text>
        </Card>

        <Card style={[styles.gridItem, isSmallScreen && styles.gridItemSmall]}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="attach-money" size={moderateScale(24)} color={Colors.success} />
          </View>
          <Text style={styles.value}>{currentMonthRevenue.toLocaleString('fr-FR')} Ar</Text>
          <Text style={Styles.subtitle}>Revenus du mois</Text>
        </Card>
      </View>

      {lateTenants > 0 && (
        <Card style={{ marginTop: 16, padding: 16, backgroundColor: Colors.danger + '10' }}>
          <View style={Styles.rowCentered}>
            <MaterialIcons name="warning" size={24} color={Colors.danger} />
            <Text style={[Styles.body, { marginLeft: 12, color: Colors.danger, fontWeight: '600' }]}>
              {lateTenants} locataire(s) en retard ce mois
            </Text>
          </View>
        </Card>
      )}

      <Text style={[Styles.title, { marginTop: 24 }]}>Activité récente</Text>
      {recentPayments.map((p) => (
        <Card key={p.id} style={{ marginBottom: 8 }}>
          <View style={Styles.rowBetween}>
            <View style={Styles.rowCentered}>
              <View style={[styles.iconContainer, { backgroundColor: Colors.successBackground, marginBottom: 0 }]}>
                <MaterialIcons name="payment" size={20} color={Colors.success} />
              </View>
              <View style={{ marginLeft: 12 }}>
                <Text style={Styles.label}>Loyer enregistré</Text>
                <Text style={Styles.body}>{getPaymentPeriod(p)}</Text>
              </View>
            </View>
            <Text style={[Styles.label, { color: Colors.success }]}>+{p.amount.toLocaleString('fr-FR')} Ar</Text>
          </View>
        </Card>
      ))}
      {recentPayments.length === 0 && (
        <Text style={[Styles.body, { color: Colors.textSecondary, marginTop: 12, textAlign: 'center' }]}>
          Aucune activité récente
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    padding: moderateScale(16),
    marginBottom: moderateScale(8),
  },
  gridItemSmall: {
    width: '100%',
  },
  iconContainer: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(8),
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(12),
  },
  value: {
    fontSize: moderateScale(24),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: moderateScale(4),
  },
});
