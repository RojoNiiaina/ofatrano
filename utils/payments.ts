import { Payment, Tenant } from '../types/models';

/** Période au format YYYY-MM */
export function toPeriod(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function periodLabel(period: string): string {
  const [year, month] = period.split('-');
  const months = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

export function formatPeriodShort(period: string): string {
  const [year, month] = period.split('-');
  const months = ['Janv', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];
  return `${months[parseInt(month, 10) - 1]} ${year}`;
}

/** Dérive la période d'un paiement (compatibilité données anciennes) */
export function getPaymentPeriod(payment: Payment): string {
  if (payment.period) return payment.period;
  return payment.date.slice(0, 7);
}

export function hasPaidForPeriod(
  payments: Payment[],
  tenantId: string,
  period: string
): boolean {
  return payments.some(
    (p) => p.tenantId === tenantId && getPaymentPeriod(p) === period && p.status === 'paid'
  );
}

/**
 * Statut du loyer pour un mois donné :
 * - paid : paiement enregistré pour la période
 * - pending : avant ou le jour d'échéance
 * - late : après le jour d'échéance sans paiement
 */
export function getRentStatusForPeriod(
  tenant: Tenant,
  payments: Payment[],
  period: string,
  referenceDate: Date = new Date()
): 'paid' | 'pending' | 'late' {
  if (hasPaidForPeriod(payments, tenant.id, period)) {
    return 'paid';
  }

  const [year, month] = period.split('-').map(Number);
  const dueDate = new Date(year, month - 1, tenant.paymentDay);
  const ref = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  return ref > dueDate ? 'late' : 'pending';
}

export function getCurrentRentStatus(
  tenant: Tenant,
  payments: Payment[],
  referenceDate: Date = new Date()
): 'paid' | 'pending' | 'late' {
  return getRentStatusForPeriod(tenant, payments, toPeriod(referenceDate), referenceDate);
}

export const rentStatusLabel: Record<'paid' | 'pending' | 'late', string> = {
  paid: 'Payé',
  pending: 'En attente',
  late: 'En retard',
};
