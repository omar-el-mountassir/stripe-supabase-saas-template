import { CallsTable } from '@/components/calls/CallsTable';
import { CallsHeader } from '@/components/calls/CallsHeader';
import { CallsStats } from '@/components/calls/CallsStats';

export const metadata = {
  title: 'NexCallAI - Gestion des appels',
};

export default async function CallsPage() {
  return (
    <div className="flex flex-col gap-5 w-full">
      <h1 className="text-2xl font-bold tracking-tight">Gestion des appels</h1>
      
      <CallsStats />
      
      <div className="flex flex-col gap-5">
        <CallsHeader />
        <CallsTable />
      </div>
    </div>
  );
} 