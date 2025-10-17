import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Group } from '@/lib/types';
import { StatChip } from './stat-chip';

interface GroupCardProps {
  group: Group;
}

export function GroupCard({ group }: GroupCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl">{group.name}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Users className="h-4 w-4" />
              {group.members.length} membri
            </CardDescription>
          </div>
          <Badge variant="secondary">{group.currency}</Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-3">
          <StatChip
            label="Ti devono"
            amount={group.totalToReceive}
            currency={group.currency}
            variant="positive"
          />
          <StatChip
            label="Devi"
            amount={group.totalOwed}
            currency={group.currency}
            variant="negative"
          />
        </div>
      </CardContent>
      
      <CardFooter>
        <Link href={`/groups/${group.id}`} className="w-full">
          <Button variant="outline" className="w-full">
            Visualizza dettagli
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}

