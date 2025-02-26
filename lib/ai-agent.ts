import OpenAI from 'openai';
import { Call, CallStatus } from '../types/call';
import { generateTwiML } from './twilio';

// Initialiser le client OpenAI avec la clé API
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Interface pour les instructions de l'agent
 */
export interface AgentInstructions {
  role: string;
  objective: string;
  persona: string;
  guidelines: string[];
  companyInfo: {
    name: string;
    description: string;
    services: string[];
    contactMethods: string[];
  };
}

/**
 * Interface pour le contexte de conversation
 */
export interface ConversationContext {
  callId: string;
  customerName?: string;
  customerPhone: string;
  previousInteractions?: {
    date: Date;
    summary: string;
  }[];
  currentConversation: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
}

/**
 * Interface pour la réponse de l'agent
 */
export interface AgentResponse {
  message: string;
  twiML: string;
  actionRequired?: {
    type: 'transfer' | 'callback' | 'schedule' | 'none';
    details?: any;
  };
  conversationSummary?: string;
}

/**
 * Crée un agent IA avec des instructions spécifiques
 * @param instructions Instructions pour l'agent IA
 * @returns Un objet contenant les fonctions de l'agent
 */
export function createAgent(instructions: AgentInstructions) {
  
  /**
   * Génère le prompt système pour l'agent
   */
  function generateSystemPrompt(): string {
    return `
Tu es un agent IA de centre d'appel pour ${instructions.companyInfo.name}.
Ton rôle: ${instructions.role}
Ton objectif: ${instructions.objective}
Persona: ${instructions.persona}

Informations sur l'entreprise:
${instructions.companyInfo.description}

Services offerts:
${instructions.companyInfo.services.join('\n')}

Directives à suivre:
${instructions.guidelines.join('\n')}

Parle toujours en français, sois professionnel, poli et concis. 
N'oublie pas que tu communiques par téléphone, donc garde tes réponses claires et facilement compréhensibles à l'oral.
    `;
  }

  /**
   * Traite une entrée utilisateur et génère une réponse
   * @param context Contexte de la conversation
   * @param userInput Entrée de l'utilisateur à traiter
   * @returns Réponse de l'agent
   */
  async function processInput(
    context: ConversationContext,
    userInput: string
  ): Promise<AgentResponse> {
    // Ajouter l'entrée utilisateur au contexte
    context.currentConversation.push({
      role: 'user',
      content: userInput,
    });

    // Construire les messages pour l'API OpenAI
    const messages = [
      { role: 'system', content: generateSystemPrompt() },
      ...context.currentConversation,
    ];

    try {
      // Appeler l'API OpenAI
      const completion = await openai.chat.completions.create({
        messages: messages as any,
        model: 'gpt-4-turbo',
        temperature: 0.7,
        max_tokens: 300,
      });

      const responseContent = completion.choices[0]?.message?.content || 'Je suis désolé, je n\'ai pas compris.';

      // Ajouter la réponse au contexte
      context.currentConversation.push({
        role: 'assistant',
        content: responseContent,
      });

      // Créer la réponse TwiML
      const twiML = generateTwiML(responseContent);

      return {
        message: responseContent,
        twiML,
        actionRequired: { type: 'none' },
      };
    } catch (error) {
      console.error('Erreur lors du traitement par l\'agent IA:', error);
      return {
        message: 'Désolé, je rencontre des difficultés techniques. Un agent humain va prendre le relais.',
        twiML: generateTwiML('Désolé, je rencontre des difficultés techniques. Un agent humain va prendre le relais.'),
        actionRequired: { 
          type: 'transfer',
          details: { reason: 'technical_error' } 
        },
      };
    }
  }

  /**
   * Génère un résumé de la conversation
   * @param context Contexte de la conversation
   * @returns Résumé de la conversation
   */
  async function generateConversationSummary(
    context: ConversationContext
  ): Promise<string> {
    try {
      // Construire le prompt pour résumer la conversation
      const summaryPrompt = [
        { 
          role: 'system', 
          content: 'Résume la conversation suivante entre un client et un agent de centre d\'appel. Inclus les points clés discutés, les problèmes identifiés et les actions à entreprendre.' 
        },
        { 
          role: 'user', 
          content: context.currentConversation
            .map(msg => `${msg.role === 'user' ? 'Client' : 'Agent'}: ${msg.content}`)
            .join('\n') 
        },
      ];

      // Appeler l'API OpenAI pour générer le résumé
      const completion = await openai.chat.completions.create({
        messages: summaryPrompt as any,
        model: 'gpt-3.5-turbo',
        temperature: 0.3,
        max_tokens: 200,
      });

      return completion.choices[0]?.message?.content || 'Aucun résumé disponible.';
    } catch (error) {
      console.error('Erreur lors de la génération du résumé:', error);
      return 'Erreur lors de la génération du résumé.';
    }
  }

  /**
   * Traite un appel entrant
   * @param call Informations sur l'appel
   * @returns Contexte initial de la conversation et réponse d'accueil
   */
  async function handleIncomingCall(
    call: Call
  ): Promise<{ context: ConversationContext; response: AgentResponse }> {
    // Créer un nouveau contexte pour cet appel
    const context: ConversationContext = {
      callId: call.id,
      customerPhone: call.from,
      currentConversation: [],
    };

    // Message d'accueil
    const greeting = `Bonjour, vous êtes en ligne avec ${instructions.companyInfo.name}. Je suis votre assistant virtuel. Comment puis-je vous aider aujourd'hui?`;
    
    // Ajouter le message d'accueil au contexte
    context.currentConversation.push({
      role: 'assistant',
      content: greeting,
    });

    // Créer la réponse TwiML
    const response: AgentResponse = {
      message: greeting,
      twiML: generateTwiML(greeting),
      actionRequired: { type: 'none' },
    };

    return { context, response };
  }

  // Retourner les fonctions de l'agent
  return {
    handleIncomingCall,
    processInput,
    generateConversationSummary,
  };
}

export default { createAgent }; 