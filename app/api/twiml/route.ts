import { NextRequest, NextResponse } from 'next/server';
import { createAgent, ConversationContext } from '@/lib/ai-agent';
import { generateTwiML } from '@/lib/twilio';
import { db } from '@/lib/db';
import { calls, callConversations } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createId } from '@paralleldrive/cuid2';

// Configuration de l'agent par défaut - même configuration que dans le fichier route.ts des appels
const defaultAgentConfig = {
  role: 'Assistant service client',
  objective: 'Aider les clients à résoudre leurs problèmes et répondre à leurs questions',
  persona: 'Professionnel, empathique et efficace',
  guidelines: [
    'Écouter attentivement les préoccupations du client',
    'Fournir des informations précises et utiles',
    'Rester poli et professionnel en toutes circonstances',
    'Rediriger vers un agent humain pour les questions complexes'
  ],
  companyInfo: {
    name: 'NexCallAI',
    description: 'Plateforme de gestion de centre d\'appels alimentée par l\'IA',
    services: [
      'Service client automatisé',
      'Gestion d\'appels entrants et sortants',
      'Analyse de conversations',
      'Intégration avec des systèmes CRM'
    ],
    contactMethods: [
      'Téléphone: +33 1 23 45 67 89',
      'Email: support@nexcallai.com',
      'Site web: www.nexcallai.com'
    ]
  }
};

// Créer l'agent IA
const aiAgent = createAgent(defaultAgentConfig);

// Stockage temporaire des contextes de conversation (en production, utiliser Redis ou une autre solution de cache)
const conversationContexts: Record<string, ConversationContext> = {};

/**
 * Endpoint pour gérer les webhooks Twilio et générer des réponses TwiML
 */
export async function POST(req: NextRequest) {
  try {
    // Twilio envoie les données au format application/x-www-form-urlencoded
    const formData = await req.formData();
    
    // Extraire les informations importantes
    const callSid = formData.get('CallSid') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const speechResult = formData.get('SpeechResult') as string;
    const callStatus = formData.get('CallStatus') as string;
    
    // Si c'est un nouveau appel ou un statut d'appel
    if (callStatus && !speechResult) {
      // Mettre à jour le statut de l'appel dans la base de données
      await updateCallStatus(callSid, callStatus);
      
      // Si c'est un nouvel appel, initialiser avec un message d'accueil
      if (callStatus === 'in-progress' && !conversationContexts[callSid]) {
        const call = {
          id: callSid,
          from,
          to,
          status: callStatus,
          direction: 'inbound'
        };
        
        // Initialiser le contexte de conversation avec l'agent IA
        const { context, response } = await aiAgent.handleIncomingCall(call as any);
        conversationContexts[callSid] = context;
        
        // Sauvegarder le premier message dans la base de données
        await saveConversationEntry(callSid, 'assistant', response.message);
        
        // Retourner le TwiML initial avec les instructions pour collecter la parole
        return new NextResponse(
          `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="fr-FR">${response.message}</Say>
  <Gather input="speech" action="/api/twiml" method="POST" speechTimeout="auto" language="fr-FR">
    <Say voice="Polly.Joanna" language="fr-FR">Je vous écoute.</Say>
  </Gather>
</Response>`,
          {
            headers: {
              'Content-Type': 'text/xml'
            }
          }
        );
      }
      
      // Si c'est un statut de fin d'appel, générer un résumé
      if (['completed', 'failed', 'busy', 'no-answer'].includes(callStatus)) {
        // Si nous avons un contexte de conversation pour cet appel
        if (conversationContexts[callSid]) {
          const context = conversationContexts[callSid];
          const summary = await aiAgent.generateConversationSummary(context);
          
          // Sauvegarder le résumé dans la base de données
          await updateCallTranscript(callSid, summary);
          
          // Nettoyer le contexte
          delete conversationContexts[callSid];
        }
        
        // Retourner une réponse vide car l'appel est terminé
        return new NextResponse('', { status: 200 });
      }
    }
    
    // Si c'est une entrée de parole de l'utilisateur
    if (speechResult && callSid) {
      // Récupérer ou créer le contexte de conversation
      let context = conversationContexts[callSid];
      if (!context) {
        // Si le contexte n'existe pas (peut arriver si le serveur redémarre), en créer un nouveau
        context = {
          callId: callSid,
          customerPhone: from,
          currentConversation: []
        };
        conversationContexts[callSid] = context;
      }
      
      // Sauvegarder l'entrée utilisateur
      await saveConversationEntry(callSid, 'user', speechResult);
      
      // Traiter la réponse avec l'agent IA
      const response = await aiAgent.processInput(context, speechResult);
      
      // Sauvegarder la réponse de l'assistant
      await saveConversationEntry(callSid, 'assistant', response.message);
      
      // Vérifier si une action spéciale est requise
      if (response.actionRequired && response.actionRequired.type !== 'none') {
        // Ici, on pourrait traiter différentes actions comme transférer l'appel, etc.
        // Pour cet exemple, on gère uniquement le cas de transfert
        if (response.actionRequired.type === 'transfer') {
          return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="fr-FR">${response.message}</Say>
  <Say voice="Polly.Joanna" language="fr-FR">Je vous transfère vers un agent humain.</Say>
  <Dial>+33123456789</Dial>
</Response>`,
            {
              headers: {
                'Content-Type': 'text/xml'
              }
            }
          );
        }
      }
      
      // Réponse standard avec Gather pour continuer la conversation
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="fr-FR">${response.message}</Say>
  <Gather input="speech" action="/api/twiml" method="POST" speechTimeout="auto" language="fr-FR">
    <Say voice="Polly.Joanna" language="fr-FR">Je vous écoute.</Say>
  </Gather>
</Response>`,
        {
          headers: {
            'Content-Type': 'text/xml'
          }
        }
      );
    }
    
    // Réponse par défaut si aucune condition n'est remplie
    return new NextResponse(
      generateTwiML('Désolé, je n\'ai pas compris votre demande. Comment puis-je vous aider?'),
      {
        headers: {
          'Content-Type': 'text/xml'
        }
      }
    );
  } catch (error) {
    console.error('Erreur lors du traitement du webhook Twilio:', error);
    
    // En cas d'erreur, fournir une réponse TwiML qui informe l'utilisateur
    return new NextResponse(
      generateTwiML('Désolé, nous rencontrons des difficultés techniques. Veuillez réessayer plus tard.'),
      {
        headers: {
          'Content-Type': 'text/xml'
        }
      }
    );
  }
}

/**
 * Met à jour le statut d'un appel dans la base de données
 */
async function updateCallStatus(callSid: string, status: string) {
  try {
    // Vérifier si l'appel existe déjà
    const existingCall = await db.query.calls.findFirst({
      where: eq(calls.twilioSid, callSid)
    });
    
    if (existingCall) {
      // Mettre à jour l'appel existant
      await db
        .update(calls)
        .set({
          status,
          updatedAt: new Date()
        })
        .where(eq(calls.twilioSid, callSid));
    } else {
      // Créer un nouvel enregistrement d'appel
      await db.insert(calls).values({
        id: createId(),
        twilioSid: callSid,
        status,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut d\'appel:', error);
  }
}

/**
 * Enregistre une entrée de conversation dans la base de données
 */
async function saveConversationEntry(callSid: string, role: 'user' | 'assistant', content: string) {
  try {
    await db.insert(callConversations).values({
      id: createId(),
      callSid,
      role,
      content,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'entrée de conversation:', error);
  }
}

/**
 * Met à jour la transcription d'un appel
 */
async function updateCallTranscript(callSid: string, transcript: string) {
  try {
    await db
      .update(calls)
      .set({
        transcript,
        updatedAt: new Date()
      })
      .where(eq(calls.twilioSid, callSid));
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la transcription:', error);
  }
} 