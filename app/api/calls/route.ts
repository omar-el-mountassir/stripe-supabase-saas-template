import { NextRequest, NextResponse } from 'next/server';
import { createAgent } from '@/lib/ai-agent';
import { initiateCall, getCallDetails } from '@/lib/twilio';
import { db } from '@/lib/db';
import { createId } from '@paralleldrive/cuid2';
import { calls } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Configuration de l'agent IA par défaut
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

// Créer l'agent avec la configuration par défaut
const agent = createAgent(defaultAgentConfig);

/**
 * Endpoint GET pour récupérer les appels
 */
export async function GET(req: NextRequest) {
  try {
    // Récupérer les paramètres de requête
    const url = new URL(req.url);
    const callId = url.searchParams.get('id');
    
    if (callId) {
      // Récupérer un appel spécifique
      const call = await db.query.calls.findFirst({
        where: eq(calls.id, callId)
      });
      
      if (!call) {
        return NextResponse.json({ error: 'Appel non trouvé' }, { status: 404 });
      }
      
      // Optionnellement, obtenir les détails frais via Twilio
      if (call.twilioSid) {
        try {
          const twilioDetails = await getCallDetails(call.twilioSid);
          // Fusionner les détails Twilio avec nos données
          return NextResponse.json({ ...call, twilioDetails });
        } catch (error) {
          // Continuer avec nos données si Twilio échoue
          console.error('Erreur Twilio, utilisation des données locales:', error);
          return NextResponse.json(call);
        }
      }
      
      return NextResponse.json(call);
    } else {
      // Récupérer tous les appels (avec pagination)
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const offset = (page - 1) * limit;
      
      const allCalls = await db.query.calls.findMany({
        limit,
        offset,
        orderBy: (calls, { desc }) => [desc(calls.createdAt)]
      });
      
      return NextResponse.json(allCalls);
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des appels:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * Endpoint POST pour créer un nouvel appel
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, from, callbackUrl } = body;
    
    if (!to || !from || !callbackUrl) {
      return NextResponse.json(
        { error: 'Les paramètres to, from et callbackUrl sont requis' },
        { status: 400 }
      );
    }
    
    // Initialiser l'appel via Twilio
    const twilioCall = await initiateCall(to, from, callbackUrl);
    
    // Enregistrer l'appel dans notre base de données
    const newCall = await db.insert(calls).values({
      id: createId(),
      twilioSid: twilioCall.id,
      to: twilioCall.to,
      from: twilioCall.from,
      status: twilioCall.status,
      direction: twilioCall.direction,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    
    return NextResponse.json(newCall[0], { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création d\'un appel:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * Endpoint pour gérer la réception de webhooks Twilio
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { callSid, status, transcript } = body;
    
    if (!callSid) {
      return NextResponse.json({ error: 'CallSid est requis' }, { status: 400 });
    }
    
    // Rechercher l'appel dans notre base de données
    const existingCall = await db.query.calls.findFirst({
      where: eq(calls.twilioSid, callSid)
    });
    
    if (!existingCall) {
      return NextResponse.json({ error: 'Appel non trouvé' }, { status: 404 });
    }
    
    // Mettre à jour l'appel
    const updatedCall = await db
      .update(calls)
      .set({
        status: status || existingCall.status,
        transcript: transcript || existingCall.transcript,
        updatedAt: new Date(),
      })
      .where(eq(calls.twilioSid, callSid))
      .returning();
    
    return NextResponse.json(updatedCall[0]);
  } catch (error) {
    console.error('Erreur lors de la mise à jour d\'un appel:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 