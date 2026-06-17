// ============================================================
// Domain Models — Ofatrano Property Management
// ============================================================

/** Statut d'un paiement */
export type PaymentStatus = 'paid' | 'pending' | 'late';

/** Statut d'occupation d'une chambre */
export type RoomStatus = 'occupied' | 'available';

// ------------------------------------------------------------
// Bâtiment
// ------------------------------------------------------------
export interface Building {
  id: string;
  /** Nom du bâtiment (facultatif) */
  name?: string;
  /** Adresse du bâtiment (obligatoire) */
  address: string;
  /** Photo du bâtiment (URI, facultatif) */
  photo?: string;
  /** Nombre total de chambres */
  roomCount: number;
}

// ------------------------------------------------------------
// Chambre
// ------------------------------------------------------------
export interface Room {
  id: string;
  /** Identifiant du bâtiment parent */
  buildingId: string;
  /** Numéro de chambre dans le bâtiment (affichage) */
  number: number;
  /** Étage où se trouve la chambre (ex: "RDC", "1er étage") */
  floor?: string;
  /** Coût mensuel de la chambre */
  cost: number;
  /** Statut d'occupation */
  status: RoomStatus;
  /** Identifiant du locataire actuel (null si disponible) */
  tenantId: string | null;
}

// ------------------------------------------------------------
// Locataire
// ------------------------------------------------------------
export interface Tenant {
  id: string;
  /** Nom du locataire (obligatoire) */
  lastName: string;
  /** Prénom du locataire (obligatoire) */
  firstName: string;
  /** Photo du locataire (URI, facultatif) */
  photo?: string;
  /** Carte d'identité nationale (facultatif) */
  cin?: string;
  /** Numéro de téléphone (obligatoire) */
  phone: string;
  /** Email du locataire (facultatif) */
  email?: string;
  /** Jour de paiement dans le mois (ex: 1 = le 1er du mois) */
  paymentDay: number;
  /** Identifiant de la chambre occupée */
  roomId: string;
}

// ------------------------------------------------------------
// Paiement
// ------------------------------------------------------------
export interface Payment {
  id: string;
  /** Identifiant du locataire */
  tenantId: string;
  /** Identifiant de la chambre concernée */
  roomId: string;
  /** Période de loyer (YYYY-MM) */
  period: string;
  /** Montant du paiement */
  amount: number;
  /** Date du paiement (ISO 8601) */
  date: string;
  /** Statut du paiement */
  status: PaymentStatus;
}
