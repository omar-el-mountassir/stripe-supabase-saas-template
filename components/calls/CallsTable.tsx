import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  Eye,
  PhoneOutgoing,
  PhoneIncoming,
  FileText,
  Trash,
} from 'lucide-react';
import Link from 'next/link';

interface Call {
  id: string;
  twilioSid: string;
  from: string;
  to: string;
  status: string;
  direction: string;
  duration: number | null;
  createdAt: string;
}

export function CallsTable() {
  // Ces données seraient normalement récupérées via une requête API
  const calls: Call[] = [
    {
      id: '1',
      twilioSid: 'CA123456789',
      from: '+33123456789',
      to: '+33987654321',
      status: 'completed',
      direction: 'outbound',
      duration: 125,
      createdAt: '2025-02-15T14:22:18Z',
    },
    {
      id: '2',
      twilioSid: 'CA987654321',
      from: '+33698765432',
      to: '+33123456789',
      status: 'in-progress',
      direction: 'inbound',
      duration: null,
      createdAt: '2025-02-15T15:10:05Z',
    },
    {
      id: '3',
      twilioSid: 'CA456789123',
      from: '+33123456789',
      to: '+33654321987',
      status: 'failed',
      direction: 'outbound',
      duration: 12,
      createdAt: '2025-02-14T11:45:30Z',
    },
    {
      id: '4',
      twilioSid: 'CA789123456',
      from: '+33654321987',
      to: '+33123456789',
      status: 'completed',
      direction: 'inbound',
      duration: 347,
      createdAt: '2025-02-14T09:18:22Z',
    },
    {
      id: '5',
      twilioSid: 'CA321654987',
      from: '+33123456789',
      to: '+33789456123',
      status: 'no-answer',
      direction: 'outbound',
      duration: 0,
      createdAt: '2025-02-13T16:33:45Z',
    },
  ];

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Direction</TableHead>
            <TableHead>De</TableHead>
            <TableHead>À</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Durée</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.map((call) => (
            <TableRow key={call.id}>
              <TableCell className="font-medium">
                {new Date(call.createdAt).toLocaleString('fr-FR', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </TableCell>
              <TableCell>
                {call.direction === 'outbound' ? (
                  <div className="flex items-center">
                    <PhoneOutgoing className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Sortant</span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <PhoneIncoming className="mr-2 h-4 w-4 text-green-500" />
                    <span>Entrant</span>
                  </div>
                )}
              </TableCell>
              <TableCell>{call.from}</TableCell>
              <TableCell>{call.to}</TableCell>
              <TableCell>
                <CallStatusBadge status={call.status} />
              </TableCell>
              <TableCell>
                {call.duration !== null ? formatDuration(call.duration) : '-'}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Ouvrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Voir les détails</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Transcription</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Trash className="mr-2 h-4 w-4" />
                      <span>Supprimer</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex items-center justify-end p-4">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </Button>
          <Button variant="outline" size="sm">
            Suivant
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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