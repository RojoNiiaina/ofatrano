import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmModal } from '../../components/ui/ConfirmModal';
import { Colors } from '../../constants/Colors';
import { Styles, moderateScale } from '../../constants/Styles';
import { useData } from '../../contexts/DataContext';
import { getPaymentPeriod, getRentStatusForPeriod, periodLabel, rentStatusLabel, toPeriod } from '../../utils/payments';

export default function RoomDetailsScreen() {
  const { id } = useLocalSearchParams();
  const { rooms, tenants, buildings, payments, removeTenantFromRoom, recordPayment } = useData();
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(toPeriod());

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

  const handleRemove = async () => {
    if (typeof id === 'string') {
      await removeTenantFromRoom(id);
      Alert.alert('Succès', 'Locataire retiré de la chambre');
    }
  };

  const handleRemoveConfirm = async () => {
    setShowRemoveModal(false);
    await handleRemove();
  };

  const handleAssign = () => {
    if (typeof id === 'string') {
      router.push(`/tenants/form?roomId=${id}` as any);
    }
  };

  const handlePayment = async () => {
    if (typeof id !== 'string' || !tenant || !room) return;

    if (room.cost === 0) {
      Alert.alert('Erreur', 'Le loyer de cette chambre est de 0 Ar. Veuillez modifier le coût de la chambre avant d\'enregistrer un paiement.');
      return;
    }

    try {
      await recordPayment({
        roomId: id,
        tenantId: tenant.id,
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
              onPress={() => setShowPaymentModal(true)}
              icon={<MaterialIcons name="payment" size={20} color="#FFF" />}
            />
            <Button title="Retirer Locataire" variant="danger" onPress={() => setShowRemoveModal(true)} />
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

      <ConfirmModal
        visible={showRemoveModal}
        title="Retirer le locataire"
        message="Le locataire et son historique de paiements seront supprimés de cette chambre. Voulez-vous continuer ?"
        confirmText="Retirer"
        cancelText="Annuler"
        onConfirm={handleRemoveConfirm}
        onCancel={() => setShowRemoveModal(false)}
        variant="danger"
      />

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
              Montant: {room.cost.toLocaleString('fr-FR')} Ar
            </Text>

            <Text style={styles.periodLabel}>Sélectionner la période:</Text>
            <ScrollView style={styles.periodList}>
              {getAvailablePeriods().map((item) => {
                const isPaid = tenant ? payments.some(
                  (p) => p.tenantId === tenant.id && getPaymentPeriod(p) === item.period && p.status === 'paid'
                ) : false;
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: moderateScale(20),
    borderTopRightRadius: moderateScale(20),
    padding: moderateScale(20),
    paddingBottom: moderateScale(30),
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: moderateScale(20),
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: moderateScale(8),
  },
  modalSubtitle: {
    fontSize: moderateScale(16),
    color: Colors.textSecondary,
    marginBottom: moderateScale(20),
  },
  periodLabel: {
    fontSize: moderateScale(14),
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: moderateScale(12),
  },
  periodList: {
    maxHeight: moderateScale(250),
    marginBottom: moderateScale(20),
  },
  periodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
    backgroundColor: Colors.background,
    marginBottom: moderateScale(8),
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
    fontSize: moderateScale(16),
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
    fontSize: moderateScale(12),
    color: Colors.success,
    marginTop: moderateScale(4),
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: moderateScale(12),
  },
  modalButton: {
    flex: 1,
    padding: moderateScale(16),
    borderRadius: moderateScale(12),
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
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: '#FFF',
    fontSize: moderateScale(16),
    fontWeight: '600',
  },
});
