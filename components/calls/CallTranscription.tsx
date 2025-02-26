import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface CallTranscriptionProps {
  transcript: string;
}

export function CallTranscription({ transcript }: CallTranscriptionProps) {
  // Séparer le transcript en lignes
  const lines = transcript.trim().split('\n').filter(line => line.trim());
  
  // Regrouper les lignes par personne parlante (Agent/Client)
  const messages = lines.reduce<{ role: string; content: string }[]>((acc, line) => {
    if (line.startsWith('Agent:') || line.startsWith('Client:')) {
      const [role, ...contentParts] = line.split(':');
      const content = contentParts.join(':').trim();
      acc.push({ role, content });
    } else if (acc.length > 0 && line.trim()) {
      // Si ce n'est pas une nouvelle personne, ajouter à la dernière entrée
      acc[acc.length - 1].content += '\n' + line.trim();
    }
    return acc;
  }, []);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          Transcription de l'appel
        </CardTitle>
        <CardDescription>
          Conversation complète entre l'agent et le client
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-auto max-h-[500px]">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div key={index} className={`flex flex-col ${message.role === 'Agent' ? 'items-start' : 'items-end'}`}>
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'Agent'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="font-semibold text-xs mb-1">
                  {message.role === 'Agent' ? 'Agent IA' : 'Client'}
                </div>
                <div className="whitespace-pre-line text-sm">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 