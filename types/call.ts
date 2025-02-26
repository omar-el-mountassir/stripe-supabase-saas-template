/**
 * Interface représentant un appel téléphonique dans le système
 */
export interface Call {
  /** Identifiant unique de l'appel (généré par Twilio ou autre service) */
  id: string;
  
  /** Numéro de téléphone appelé */
  to: string;
  
  /** Numéro de téléphone appelant */
  from: string;
  
  /** Statut actuel de l'appel */
  status: string;
  
  /** Direction de l'appel (entrant/sortant) */
  direction: string;
  
  /** Date et heure du début de l'appel */
  startTime: Date | null;
  
  /** Date et heure de fin de l'appel */
  endTime: Date | null;
  
  /** Durée de l'appel en secondes */
  duration: number;
  
  /** URL vers l'enregistrement de l'appel, si disponible */
  recordingUrl: string | null;
  
  /** Notes ou transcription de l'appel */
  notes: string | null;
  
  /** Identifiant de l'agent IA qui a traité l'appel */
  agentId: string | null;
}

/**
 * Énumération des statuts possibles d'un appel
 */
export enum CallStatus {
  QUEUED = 'queued',
  INITIATED = 'initiated',
  RINGING = 'ringing',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed',
  BUSY = 'busy',
  FAILED = 'failed',
  NO_ANSWER = 'no-answer',
  CANCELED = 'canceled'
}

/**
 * Énumération des directions possibles d'un appel
 */
export enum CallDirection {
  INBOUND = 'inbound',
  OUTBOUND = 'outbound'
} 