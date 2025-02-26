import twilio from 'twilio';
import { Call } from '../types/call';

// Initialiser le client Twilio avec les variables d'environnement
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * Initie un appel téléphonique via Twilio
 * @param to Numéro de téléphone à appeler
 * @param from Numéro de téléphone de l'appelant (par défaut, celui configuré dans l'environnement)
 * @param callbackUrl URL de callback pour les événements d'appel
 * @returns Informations de l'appel créé
 */
export async function initiateCall(
  to: string,
  from: string = process.env.TWILIO_PHONE_NUMBER || '',
  callbackUrl: string
): Promise<Call> {
  try {
    // Créer un nouvel appel via l'API Twilio
    const call = await twilioClient.calls.create({
      to,
      from,
      url: callbackUrl, // URL TwiML qui gère la logique de l'appel
      statusCallback: `${callbackUrl}/status`, // URL pour recevoir les mises à jour de statut d'appel
      statusCallbackEvent: ['initiated', 'ringing', 'answered', 'completed'],
      statusCallbackMethod: 'POST',
    });

    // Retourner les détails de l'appel dans notre format standardisé
    return {
      id: call.sid,
      to,
      from,
      status: call.status,
      direction: call.direction,
      startTime: call.startTime ? new Date(call.startTime) : null,
      endTime: null,
      duration: 0, // Appel juste initié, donc durée de 0
      recordingUrl: null,
      notes: null,
      agentId: null,
    };
  } catch (error) {
    console.error('Erreur lors de l\'initiation de l\'appel:', error);
    throw error;
  }
}

/**
 * Récupère les détails d'un appel existant
 * @param callId L'identifiant de l'appel (SID Twilio)
 * @returns Détails de l'appel
 */
export async function getCallDetails(callId: string): Promise<Call> {
  try {
    const call = await twilioClient.calls(callId).fetch();
    
    return {
      id: call.sid,
      to: call.to,
      from: call.from,
      status: call.status,
      direction: call.direction,
      startTime: call.startTime ? new Date(call.startTime) : null,
      endTime: call.endTime ? new Date(call.endTime) : null,
      duration: parseInt(call.duration || '0', 10), // Conversion de string à number
      recordingUrl: null, // À récupérer séparément si nécessaire
      notes: null,
      agentId: null,
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des détails de l\'appel:', error);
    throw error;
  }
}

/**
 * Termine un appel en cours
 * @param callId L'identifiant de l'appel à terminer
 * @returns Résultat de l'opération
 */
export async function endCall(callId: string): Promise<Call> {
  try {
    // Mettre à jour le statut de l'appel pour le terminer
    const call = await twilioClient.calls(callId).update({
      status: 'completed'
    });
    
    return {
      id: call.sid,
      to: call.to,
      from: call.from,
      status: call.status,
      direction: call.direction,
      startTime: call.startTime ? new Date(call.startTime) : null,
      endTime: call.endTime ? new Date(call.endTime) : null,
      duration: parseInt(call.duration || '0', 10), // Conversion de string à number
      recordingUrl: null,
      notes: null,
      agentId: null,
    };
  } catch (error) {
    console.error('Erreur lors de la terminaison de l\'appel:', error);
    throw error;
  }
}

/**
 * Génère un TwiML pour une réponse vocale simple
 * @param message Message à lire
 * @returns Chaîne TwiML
 */
export function generateTwiML(message: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="fr-FR">${message}</Say>
</Response>`;
}

/**
 * Enregistre un appel en cours
 * @param callId Identifiant de l'appel à enregistrer
 * @returns Détails de l'enregistrement créé
 */
export async function startRecording(callId: string) {
  try {
    const recording = await twilioClient.calls(callId).recordings.create();
    return recording;
  } catch (error) {
    console.error('Erreur lors du démarrage de l\'enregistrement:', error);
    throw error;
  }
}

export default {
  initiateCall,
  getCallDetails,
  endCall,
  generateTwiML,
  startRecording,
}; 