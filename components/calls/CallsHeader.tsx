import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Phone, Plus, Search } from 'lucide-react';

export function CallsHeader() {
  return (
    <div className="flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
      <div className="flex items-center gap-2 w-full md:w-auto">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un appel..."
            className="w-full pl-8"
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="in-progress">En cours</SelectItem>
            <SelectItem value="completed">Terminés</SelectItem>
            <SelectItem value="failed">Échoués</SelectItem>
            <SelectItem value="busy">Occupé</SelectItem>
            <SelectItem value="no-answer">Sans réponse</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center gap-2 w-full md:w-auto">
        <Button variant="outline">
          <Phone className="mr-2 h-4 w-4" />
          Historique
        </Button>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvel appel
        </Button>
      </div>
    </div>
  );
} 