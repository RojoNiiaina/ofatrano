import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Colors } from '../../constants/Colors';
import { Styles, moderateScale } from '../../constants/Styles';
import { useData } from '../../contexts/DataContext';
import {
    getCurrentRentStatus,
    getPaymentPeriod,
    periodLabel,
    rentStatusLabel,
    toPeriod,
} from '../../utils/payments';

export default function TenantProfileScreen() {
  const { id } = useLocalSearchParams();
  const { tenants, rooms, buildings, payments, recordPayment } = useData();

  const tenant = tenants.find((t) => t.id === id);

  if (!tenant) {
    return (
      <View style={[Styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={Styles.title}>Locataire introuvable</Text>
        <TouchableOpacity style={{ marginTop: 20 }} onPress={() => router.back()}>
          <Text style={{ color: Colors.primary }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const room = rooms.find((r) => r.id === tenant.roomId);
  const building = buildings.find((b) => b.id === room?.buildingId);
  const buildingName = building?.name ?? building?.address ?? 'Non assigné';
  const currentRentStatus = getCurrentRentStatus(tenant, payments);

  const tenantPayments = payments
    .filter((p) => p.tenantId === tenant.id)
    .sort((a, b) => getPaymentPeriod(b).localeCompare(getPaymentPeriod(a)));

  const paymentStatusColor = (status?: string) =>
    status === 'paid'
      ? Colors.success
      : status === 'pending'
        ? Colors.warning
        : status === 'late'
          ? Colors.danger
          : Colors.textMuted;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const handlePayment = async () => {
    if (typeof id !== 'string' || !room) return;

    try {
      await recordPayment({
        roomId: room.id,
        tenantId: id,
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

  return (
    <ScrollView style={Styles.container} contentContainerStyle={Styles.contentPadding}>
      <View style={styles.header}>
        {tenant.photo ? (
          <Image source={{ uri: tenant.photo }} style={styles.headerAvatar} />
        ) : (
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{tenant.firstName.charAt(0)}</Text>
          </View>
        )}
        <Text style={[Styles.title, { marginTop: moderateScale(16) }]}>
          {tenant.lastName} {tenant.firstName}
        </Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Le {tenant.paymentDay} du mois</Text>
        </View>
        <View style={{ marginTop: moderateScale(8) }}>
          <Badge
            label={`${periodLabel(toPeriod())} : ${rentStatusLabel[currentRentStatus]}`}
            status={currentRentStatus === 'paid' ? 'success' : currentRentStatus === 'pending' ? 'warning' : 'danger'}
          />
        </View>
      </View>

      <Card style={styles.section}>
        <Text style={Styles.label}>Coordonnées</Text>
        <View style={styles.row}>
          <MaterialIcons name="phone" size={moderateScale(20)} color={Colors.textSecondary} style={styles.icon} />
          <Text style={Styles.body}>{tenant.phone}</Text>
        </View>
        {tenant.email && (
          <View style={styles.row}>
            <MaterialIcons name="email" size={moderateScale(20)} color={Colors.textSecondary} style={styles.icon} />
            <Text style={Styles.body}>{tenant.email}</Text>
          </View>
        )}
        {tenant.cin && (
          <View style={styles.row}>
            <MaterialIcons name="badge" size={moderateScale(20)} color={Colors.textSecondary} style={styles.icon} />
            <Text style={Styles.body}>CIN: {tenant.cin}</Text>
          </View>
        )}
      </Card>

      <Card style={styles.section}>
        <Text style={Styles.label}>Logement Actuel</Text>
        <View style={styles.row}>
          <MaterialIcons name="meeting-room" size={moderateScale(20)} color={Colors.primary} style={styles.icon} />
          <View>
            <Text style={[Styles.body, { fontWeight: '600' }]}>
              Chambre {room?.number ?? '?'}
              {room?.floor ? ` (${room.floor})` : ''}
            </Text>
            <Text style={[Styles.body, { color: Colors.textSecondary, marginTop: moderateScale(4) }]}>{buildingName}</Text>
          </View>
        </View>
        <View style={[styles.row, { marginTop: moderateScale(8) }]}>
          <MaterialIcons name="payments" size={moderateScale(20)} color={Colors.textSecondary} style={styles.icon} />
          <Text style={Styles.body}>
            Loyer: {room?.cost ? `${room.cost.toLocaleString('fr-FR')} Ar` : 'N/A'}/mois
          </Text>
        </View>
      </Card>

      <Text style={[Styles.label, { marginTop: moderateScale(16), marginBottom: moderateScale(8) }]}>Historique des paiements</Text>
      {tenantPayments.length > 0 ? (
        tenantPayments.map((payment) => (
          <Card key={payment.id} style={{ padding: moderateScale(12), marginBottom: moderateScale(8) }}>
            <View style={Styles.rowBetween}>
              <View>
                <Text style={Styles.body}>{periodLabel(getPaymentPeriod(payment))}</Text>
                <Text style={[Styles.body, { color: Colors.textSecondary, marginTop: moderateScale(2) }]}>
                  {formatDate(payment.date)} — {payment.amount.toLocaleString('fr-FR')} Ar
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: paymentStatusColor(payment.status) + '20' }]}>
                <Text style={{ color: paymentStatusColor(payment.status), fontWeight: '600', fontSize: 12 }}>
                  {rentStatusLabel[payment.status]}
                </Text>
              </View>
            </View>
          </Card>
        ))
      ) : (
        <View style={styles.emptyState}>
          <MaterialIcons name="receipt-long" size={moderateScale(40)} color={Colors.border} />
          <Text style={[Styles.body, { color: Colors.textSecondary, marginTop: moderateScale(8) }]}>Aucun paiement enregistré</Text>
        </View>
      )}

      <View style={{ marginTop: moderateScale(24), marginBottom: moderateScale(40), gap: moderateScale(12) }}>
        <TouchableOpacity style={styles.primaryButton} onPress={handlePayment}>
          <MaterialIcons name="add-card" size={moderateScale(20)} color="#FFF" style={{ marginRight: moderateScale(8) }} />
          <Text style={styles.primaryButtonText}>Enregistrer un paiement</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => router.push(`/tenants/form?id=${tenant.id}` as any)}
        >
          <Text style={styles.secondaryButtonText}>Modifier le profil</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginBottom: moderateScale(24),
  },
  headerAvatar: {
    width: moderateScale(100),
    height: moderateScale(100),
    borderRadius: moderateScale(50),
    backgroundColor: Colors.secondaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    color: Colors.secondary,
    fontSize: moderateScale(40),
    fontWeight: 'bold',
  },
  badge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(16),
    marginTop: moderateScale(8),
  },
  badgeText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: moderateScale(12),
  },
  section: {
    padding: moderateScale(16),
    marginBottom: moderateScale(16),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: moderateScale(12),
  },
  icon: {
    marginRight: moderateScale(12),
    width: moderateScale(24),
    textAlign: 'center',
  },
  statusBadge: {
    paddingHorizontal: moderateScale(12),
    paddingVertical: moderateScale(6),
    borderRadius: moderateScale(16),
  },
  emptyState: {
    padding: moderateScale(24),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    color: Colors.textPrimary,
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
