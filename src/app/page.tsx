'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GroupCard } from '@/components/group-card';
import { authService } from '@/lib/auth-service';
import { groupService } from '@/lib/group-service';
import { Group } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.push('/sign-in');
      return;
    }

    loadGroups();
  }, [router]);

  const loadGroups = async () => {
    setIsLoading(true);
    try {
      const data = await groupService.getGroups();
      setGroups(data);
    } catch (error) {
      console.error('Failed to load groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalOwed = groups.reduce((sum, group) => sum + group.totalOwed, 0);
  const totalToReceive = groups.reduce((sum, group) => sum + group.totalToReceive, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">I tuoi gruppi</h1>
            <p className="text-muted-foreground">
              Gestisci le spese condivise con amici e familiari
            </p>
          </div>
          <Link href="/groups/new">
            <Button size="lg" className="gap-2">
              <Plus className="h-5 w-5" />
              Crea gruppo
            </Button>
          </Link>
        </div>

        {/* Summary Stats */}
        {groups.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gruppi totali</p>
                <p className="text-2xl font-bold">{groups.length}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <div className="p-3 rounded-full bg-green-50 dark:bg-green-950">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ti devono</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  €{totalToReceive.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-lg border bg-card">
              <div className="p-3 rounded-full bg-red-50 dark:bg-red-950">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Devi</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  €{totalOwed.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Nessun gruppo ancora</h3>
          <p className="text-muted-foreground mb-6">
            Crea il tuo primo gruppo per iniziare a dividere le spese
          </p>
          <Link href="/groups/new">
            <Button>
              <Plus className="h-4 w-4" />
              Crea il tuo primo gruppo
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard key={group.id} group={group} />
          ))}
        </div>
      )}
    </div>
  );
}
