import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';
import { Styles, moderateScale } from '../../constants/Styles';
import { useData } from '../../contexts/DataContext';
import { Payment } from '../../types/models';
import { getPaymentPeriod, periodLabel } from '../../utils/payments';

const statusToBadge = (s: Payment['status']) =>
  s === 'paid' ? 'success' : s === 'pending' ? 'warning' : 'danger';

const statusLabel = (s: Payment['status']) =>
  s === 'paid' ? 'Payé' : s === 'pending' ? 'En attente' : 'En retard';

export default function PaymentsScreen() {
  const { payments, tenants } = useData();

  const sortedPayments = [...payments].sort((a, b) =>
    getPaymentPeriod(b).localeCompare(getPaymentPeriod(a))
  );

  const getTenantName = (tenantId: string) => {
    const t = tenants.find((t) => t.id === tenantId);
    return t ? `${t.lastName} ${t.firstName}` : 'Inconnu';
  };

  const renderItem = ({ item }: { item: Payment }) => (
    <Card style={styles.cardInfo}>
      <View style={Styles.rowBetween}>
        <View style={styles.leftContent}>
          <Text style={styles.tenantName}>{getTenantName(item.tenantId)}</Text>
          <Text style={styles.periodLabel}>{periodLabel(getPaymentPeriod(item))}</Text>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.amount}>{item.amount.toLocaleString('fr-FR')} Ar</Text>
          <Badge label={statusLabel(item.status)} status={statusToBadge(item.status)} />
        </View>
      </View>
    </Card>
  );

  return (
    <View style={Styles.container}>
      <FlatList
        data={sortedPayments}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={Styles.contentPadding}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialIcons name="receipt-long" size={64} color={Colors.border} />
            <Text style={[Styles.subtitle, { marginTop: 16 }]}>Aucun paiement enregistré</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardInfo: {
    padding: moderateScale(12),
    marginBottom: moderateScale(8),
  },
  leftContent: {
    flex: 1,
  },
  tenantName: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  periodLabel: {
    fontSize: moderateScale(12),
    color: Colors.textSecondary,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  emptyState: {
    padding: moderateScale(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
});
