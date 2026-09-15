import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPeriodSelector, setShowPeriodSelector] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(toPeriod());

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

    if (room.cost === 0) {
      Alert.alert('Erreur', 'Le loyer de cette chambre est de 0 Ar. Veuillez modifier le coût de la chambre avant d\'enregistrer un paiement.');
      return;
    }

    try {
      await recordPayment({
        roomId: room.id,
        tenantId: id,
        amount: room.cost,
        date: new Date().toISOString().split('T')[0],
        period: selectedPeriod,
      });
      Alert.alert('Succès', `Paiement enregistré pour ${periodLabel(selectedPeriod)}`);
      setShowPaymentModal(false);
    } catch (error) {
      if (error instanceof Error && error.message === 'PAYMENT_ALREADY_RECORDED') {
        Alert.alert('Information', `Le loyer de ${periodLabel(selectedPeriod)} est déjà payé`);
      } else {
        Alert.alert('Erreur', 'Impossible d\'enregistrer le paiement');
      }
    }
  };

  const handlePaymentConfirm = async () => {
    await handlePayment();
  };

  const getAvailablePeriods = () => {
    const periods = [];
    const current = new Date();
    const currentPeriod = toPeriod(current);

    // Mois courant
    periods.push({ label: 'Ce mois', period: currentPeriod });

    // Mois prochain
    const nextMonth = new Date(current.getFullYear(), current.getMonth() + 1, 1);
    periods.push({ label: 'Mois prochain', period: toPeriod(nextMonth) });

    // 3 mois suivants
    for (let i = 2; i <= 5; i++) {
      const futureMonth = new Date(current.getFullYear(), current.getMonth() + i, 1);
      periods.push({ label: periodLabel(toPeriod(futureMonth)), period: toPeriod(futureMonth) });
    }

    return periods;
  };

  return (
    <ScrollView style={Styles.container} contentContainerStyle={Styles.contentPadding}>
      {/* Header Section */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {tenant.photo ? (
            <Image source={{ uri: tenant.photo }} style={styles.headerAvatar} />
          ) : (
            <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder]}>
              <Text style={styles.headerAvatarText}>{tenant.firstName.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{tenant.lastName} {tenant.firstName}</Text>
            <Text style={styles.headerMeta}>Le {tenant.paymentDay} du mois</Text>
          </View>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Statut loyer:</Text>
          <Text style={[styles.statusValue, { color: paymentStatusColor(currentRentStatus) }]}>
            {rentStatusLabel[currentRentStatus]}
          </Text>
          <Text style={styles.statusPeriod}>{periodLabel(toPeriod())}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton} onPress={() => setShowPaymentModal(true)}>
          <MaterialIcons name="payments" size={20} color={Colors.primary} />
          <Text style={styles.quickActionLabel}>Paiement</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => router.push(`/tenants/form?id=${tenant.id}` as any)}
        >
          <MaterialIcons name="edit" size={20} color={Colors.secondary} />
          <Text style={styles.quickActionLabel}>Modifier</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => {
            if (tenant.phone) {
              Alert.alert('Appeler', `Appeler ${tenant.phone}`);
            }
          }}
        >
          <MaterialIcons name="phone" size={20} color={Colors.success} />
          <Text style={styles.quickActionLabel}>Appeler</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Info Card */}
      <Card style={styles.infoCard}>
        <Text style={styles.infoCardTitle}>Coordonnées</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tél:</Text>
          <Text style={styles.infoText}>{tenant.phone}</Text>
        </View>
        {tenant.email && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Email:</Text>
            <Text style={styles.infoText}>{tenant.email}</Text>
          </View>
        )}
        {tenant.cin && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>CIN:</Text>
            <Text style={styles.infoText}>{tenant.cin}</Text>
          </View>
        )}
      </Card>

      {/* Housing Info Card */}
      <TouchableOpacity onPress={() => room && router.push(`/rooms/${room.id}` as any)}>
        <Card style={styles.infoCard}>
          <View style={Styles.rowBetween}>
            <Text style={styles.infoCardTitle}>Logement</Text>
            <MaterialIcons name="chevron-right" size={20} color={Colors.textMuted} />
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Chambre:</Text>
            <Text style={styles.infoText}>
              {room?.number ?? '?'}
              {room?.floor && ` (${room.floor})`}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Bâtiment:</Text>
            <Text style={styles.infoText}>{buildingName}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Loyer:</Text>
            <Text style={styles.infoText}>
              {room?.cost ? `${room.cost.toLocaleString('fr-FR')} Ar` : 'N/A'}/mois
            </Text>
          </View>
        </Card>
      </TouchableOpacity>

      {/* Payment History */}
      <Text style={Styles.label}>Historique des paiements</Text>
      {tenantPayments.length > 0 ? (
        tenantPayments.map((payment) => (
          <Card key={payment.id} style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentPeriod}>{periodLabel(getPaymentPeriod(payment))}</Text>
              <Text style={styles.paymentAmount}>{payment.amount.toLocaleString('fr-FR')} Ar</Text>
            </View>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentDate}>{formatDate(payment.date)}</Text>
              <Text style={[styles.paymentStatus, { color: paymentStatusColor(payment.status) }]}>
                {rentStatusLabel[payment.status]}
              </Text>
            </View>
          </Card>
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Aucun paiement enregistré</Text>
        </View>
      )}

      <Modal
        visible={showPaymentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enregistrer un paiement</Text>
            <Text style={styles.modalSubtitle}>
              Montant: {room?.cost?.toLocaleString('fr-FR')} Ar
            </Text>

            <Text style={styles.periodLabel}>Sélectionner la période:</Text>
            <ScrollView style={styles.periodList}>
              {getAvailablePeriods().map((item) => {
                const isPaid = payments.some(
                  (p) => p.tenantId === tenant.id && getPaymentPeriod(p) === item.period && p.status === 'paid'
                );
                const isSelected = selectedPeriod === item.period;

                return (
                  <TouchableOpacity
                    key={item.period}
                    style={[
                      styles.periodItem,
                      isSelected && styles.periodItemSelected,
                      isPaid && styles.periodItemPaid,
                    ]}
                    onPress={() => setSelectedPeriod(item.period)}
                    disabled={isPaid}
                  >
                    <View style={styles.periodItemLeft}>
                      <Text style={[
                        styles.periodItemText,
                        isSelected && styles.periodItemTextSelected,
                        isPaid && styles.periodItemTextPaid,
                      ]}>
                        {item.label}
                      </Text>
                      {isPaid && (
                        <Text style={styles.periodItemPaidText}>Déjà payé</Text>
                      )}
                    </View>
                    {isSelected && !isPaid && (
                      <MaterialIcons name="check-circle" size={24} color={Colors.primary} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handlePaymentConfirm}
              >
                <Text style={styles.modalButtonTextConfirm}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Header
  header: {
    marginBottom: moderateScale(16),
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(12),
  },
  headerAvatar: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(28),
    marginRight: moderateScale(12),
  },
  headerAvatarPlaceholder: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    color: Colors.primary,
    fontSize: moderateScale(24),
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: moderateScale(4),
  },
  headerMeta: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: moderateScale(8),
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statusLabel: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
  },
  statusValue: {
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  statusPeriod: {
    fontSize: moderateScale(12),
    color: Colors.textSecondary,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateScale(16),
    gap: moderateScale(8),
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(8),
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: Colors.border,
    gap: moderateScale(6),
  },
  quickActionLabel: {
    fontSize: moderateScale(13),
    fontWeight: '500',
    color: Colors.textPrimary,
  },

  // Info Cards
  infoCard: {
    padding: moderateScale(14),
    marginBottom: moderateScale(12),
  },
  infoCardTitle: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: moderateScale(10),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: moderateScale(8),
  },
  infoLabel: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
    width: moderateScale(70),
  },
  infoText: {
    fontSize: moderateScale(14),
    color: Colors.textPrimary,
    flex: 1,
  },

  // Payment Cards
  paymentCard: {
    padding: moderateScale(12),
    marginBottom: moderateScale(8),
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: moderateScale(4),
  },
  paymentPeriod: {
    fontSize: moderateScale(14),
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  paymentAmount: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  paymentDate: {
    fontSize: moderateScale(12),
    color: Colors.textSecondary,
  },
  paymentStatus: {
    fontSize: moderateScale(12),
    fontWeight: '500',
  },

  // Empty State
  emptyState: {
    padding: moderateScale(20),
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: moderateScale(8),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyStateText: {
    fontSize: moderateScale(13),
    color: Colors.textSecondary,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: moderateScale(16),
    borderTopRightRadius: moderateScale(16),
    padding: moderateScale(16),
    paddingBottom: moderateScale(24),
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: moderateScale(18),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: moderateScale(6),
  },
  modalSubtitle: {
    fontSize: moderateScale(14),
    color: Colors.textSecondary,
    marginBottom: moderateScale(16),
  },
  periodLabel: {
    fontSize: moderateScale(13),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: moderateScale(10),
  },
  periodList: {
    maxHeight: moderateScale(250),
    marginBottom: moderateScale(16),
  },
  periodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(12),
    borderRadius: moderateScale(8),
    backgroundColor: Colors.background,
    marginBottom: moderateScale(6),
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '30',
  },
  periodItemPaid: {
    backgroundColor: Colors.success + '10',
    borderColor: Colors.success,
    opacity: 0.6,
  },
  periodItemLeft: {
    flex: 1,
  },
  periodItemText: {
    fontSize: moderateScale(14),
    color: Colors.textPrimary,
    fontWeight: '500',
  },
  periodItemTextSelected: {
    color: Colors.primary,
    fontWeight: '600',
  },
  periodItemTextPaid: {
    color: Colors.textMuted,
  },
  periodItemPaidText: {
    fontSize: moderateScale(11),
    color: Colors.success,
    marginTop: moderateScale(2),
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: moderateScale(10),
  },
  modalButton: {
    flex: 1,
    padding: moderateScale(14),
    borderRadius: moderateScale(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalButtonConfirm: {
    backgroundColor: Colors.primary,
  },
  modalButtonTextCancel: {
    color: Colors.textPrimary,
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: '#FFF',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
});
