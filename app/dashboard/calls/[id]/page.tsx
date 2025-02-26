import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CallDetails } from '@/components/calls/CallDetails';
import { CallTranscription } from '@/components/calls/CallTranscription';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Download, PlayCircle } from 'lucide-react';

interface CallPageProps {
  params: {
    id: string;
  };
}

export const metadata = {
  title: 'NexCallAI - Détails de l\'appel',
};

export default async function CallPage({ params }: CallPageProps) {
  const { id } = params;
  
  // En production, ces données seraient récupérées depuis l'API
  const call = {
    id,
    twilioSid: 'CA123456789',
    from: '+33123456789',
    to: '+33987654321',
    status: 'completed',
    direction: 'outbound',
    duration: 125,
    recordingUrl: 'https://api.example.com/recordings/RE123456789',
    agentId: 'agent-123',
    createdAt: '2025-02-15T14:22:18Z',
    transcript: `
Agent: Bonjour, merci de contacter NexCallAI. Comment puis-je vous aider aujourd'hui?

Client: Bonjour, j'aimerais avoir des informations sur vos services de centre d'appels virtuel.

Agent: Bien sûr, je serais ravi de vous renseigner. NexCallAI propose une plateforme de centre d'appels alimentée par l'IA, qui permet d'automatiser la gestion des appels entrants et sortants. Nos agents IA peuvent répondre aux questions fréquentes, transférer les appels vers des agents humains si nécessaire, et même effectuer des tâches comme la prise de rendez-vous ou la collecte d'informations.

Client: Ça a l'air intéressant. Est-ce que je peux intégrer cela avec mon système CRM existant?

Agent: Absolument! Notre plateforme est conçue pour s'intégrer facilement avec la plupart des systèmes CRM populaires comme Salesforce, HubSpot, ou Microsoft Dynamics. Nous proposons également une API ouverte pour des intégrations personnalisées.

Client: Parfait. Et comment fonctionne la tarification?

Agent: Nous proposons plusieurs formules d'abonnement en fonction de vos besoins. Notre formule de base commence à 49€ par mois et inclut jusqu'à 500 minutes d'appels. Pour obtenir un devis personnalisé, je peux vous mettre en relation avec notre équipe commerciale qui pourra vous proposer une offre adaptée à votre volume d'appels.

Client: D'accord, ce serait utile. Pouvez-vous m'envoyer également de la documentation par email?

Agent: Bien sûr. Puis-je avoir votre adresse email pour vous envoyer notre documentation complète?

Client: Oui, c'est contact@entreprise-exemple.fr

Agent: Parfait, je vous envoie cela immédiatement. Un membre de notre équipe commerciale vous contactera d'ici demain pour discuter de vos besoins spécifiques. Avez-vous d'autres questions?

Client: Non, c'est tout pour le moment. Merci pour votre aide.

Agent: Je vous en prie. Merci d'avoir contacté NexCallAI. Passez une excellente journée!
    `,
  };

  // Si l'appel n'est pas trouvé, rediriger vers une page 404
  if (!call) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Détails de l'appel</h1>
          <p className="text-muted-foreground">
            ID: {call.twilioSid}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/calls" passHref>
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Retour
            </Button>
          </Link>
          {call.recordingUrl && (
            <Button variant="outline">
              <PlayCircle className="mr-2 h-4 w-4" />
              Écouter
            </Button>
          )}
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CallDetails call={call} />
        <CallTranscription transcript={call.transcript} />
      </div>
    </div>
  );
} 