import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowUp, ArrowDown, Phone, Clock } from 'lucide-react';

export function CallsStats() {
  // Ces valeurs seraient normalement récupérées depuis l'API
  const statsData = {
    totalCalls: 127,
    callsToday: 24,
    avgDuration: '4m 37s',
    successRate: 92.3,
    trendPercentage: 12.5,
    trend: 'up' as 'up' | 'down',
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        title="Appels totaux"
        value={statsData.totalCalls.toString()}
        description="Total des appels traités"
        icon={<Phone className="h-4 w-4 text-muted-foreground" />}
      />
      
      <StatsCard
        title="Appels aujourd'hui"
        value={statsData.callsToday.toString()}
        description={
          <div className="flex items-center">
            <span className="mr-1">
              {statsData.trend === 'up' ? (
                <ArrowUp className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500" />
              )}
            </span>
            <span className={statsData.trend === 'up' ? 'text-green-500' : 'text-red-500'}>
              {statsData.trendPercentage}%
            </span>
            <span className="ml-1 text-muted-foreground">vs hier</span>
          </div>
        }
        icon={<Phone className="h-4 w-4 text-muted-foreground" />}
      />
      
      <StatsCard
        title="Durée moyenne"
        value={statsData.avgDuration}
        description="Par appel"
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
      />
      
      <StatsCard
        title="Taux de réussite"
        value={`${statsData.successRate}%`}
        description="Appels complétés avec succès"
        icon={<Phone className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}

interface StatsCardProps {
  title: string;
  value: string;
  description: string | React.ReactNode;
  icon?: React.ReactNode;
}

function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
} 