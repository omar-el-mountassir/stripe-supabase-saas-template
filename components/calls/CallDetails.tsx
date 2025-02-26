import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PhoneOutgoing, PhoneIncoming, Clock, Calendar, User } from 'lucide-react';

interface CallDetailsProps {
  call: {
    id: string;
    twilioSid: string;
    from: string;
    to: string;
    status: string;
    direction: string;
    duration: number;
    recordingUrl?: string;
    agentId?: string;
    createdAt: string;
  };
}

export function CallDetails({ call }: CallDetailsProps) {
  // Formatage de la date
  const formattedDate = new Date(call.createdAt).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  // Formatage de la durée
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations de l'appel</CardTitle>
        <CardDescription>
          Détails et métadonnées de cet appel téléphonique
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Direction</p>
            <div className="flex items-center">
              {call.direction === 'outbound' ? (
                <>
                  <PhoneOutgoing className="mr-2 h-4 w-4 text-blue-500" />
                  <span>Sortant</span>
                </>
              ) : (
                <>
                  <PhoneIncoming className="mr-2 h-4 w-4 text-green-500" />
                  <span>Entrant</span>
                </>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Statut</p>
            <CallStatusBadge status={call.status} />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">De</p>
          <p>{call.from}</p>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">À</p>
          <p>{call.to}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              <Calendar className="inline mr-1 h-4 w-4" />
              Date et heure
            </p>
            <p>{formattedDate}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              <Clock className="inline mr-1 h-4 w-4" />
              Durée
            </p>
            <p>{formatDuration(call.duration)}</p>
          </div>
        </div>

        {call.agentId && (
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              <User className="inline mr-1 h-4 w-4" />
              Agent IA
            </p>
            <p>{call.agentId}</p>
          </div>
        )}

        <div className="pt-2">
          <p className="text-sm font-medium text-muted-foreground">ID Twilio</p>
          <p className="font-mono text-xs">{call.twilioSid}</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface CallStatusBadgeProps {
  status: string;
}

function CallStatusBadge({ status }: CallStatusBadgeProps) {
  let badgeContent = '';
  let variant:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline' = 'default';

  switch (status) {
    case 'in-progress':
      badgeContent = 'En cours';
      variant = 'default';
      break;
    case 'completed':
      badgeContent = 'Terminé';
      variant = 'secondary';
      break;
    case 'failed':
      badgeContent = 'Échoué';
      variant = 'destructive';
      break;
    case 'busy':
      badgeContent = 'Occupé';
      variant = 'outline';
      break;
    case 'no-answer':
      badgeContent = 'Sans réponse';
      variant = 'outline';
      break;
    default:
      badgeContent = status;
      variant = 'outline';
  }

  return <Badge variant={variant}>{badgeContent}</Badge>;
} 