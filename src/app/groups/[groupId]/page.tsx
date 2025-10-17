'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Users, Receipt, DollarSign, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { authService } from '@/lib/auth-service';
import { groupService } from '@/lib/group-service';
import { Group, Expense } from '@/lib/types';
import { StatChip } from '@/components/stat-chip';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.push('/sign-in');
      return;
    }

    loadGroupData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.groupId, router]);

  const loadGroupData = async () => {
    setIsLoading(true);
    try {
      const groupId = params.groupId as string;
      const [groupData, expensesData] = await Promise.all([
        groupService.getGroup(groupId),
        groupService.getGroupExpenses(groupId),
      ]);
      
      if (!groupData) {
        router.push('/');
        return;
      }
      
      setGroup(groupData);
      setExpenses(expensesData);
    } catch (error) {
      console.error('Failed to load group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('it-IT', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

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

  if (!group) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4" />
            Torna ai gruppi
          </Button>
        </Link>
      </div>

      {/* Group Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{group.name}</h1>
              <Badge variant="secondary">{group.currency}</Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <Users className="h-4 w-4" />
              {group.members.length} membri • Creato il {formatDate(group.createdAt)}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <Users className="h-4 w-4" />
              Invita
            </Button>
            <Button>
              <Plus className="h-4 w-4" />
              Aggiungi spesa
            </Button>
          </div>
        </div>

        {/* Balance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatChip
            label="Ti devono in totale"
            amount={group.totalToReceive}
            currency={group.currency}
            variant="positive"
          />
          <StatChip
            label="Devi in totale"
            amount={group.totalOwed}
            currency={group.currency}
            variant="negative"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="expenses" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="expenses">
            <Receipt className="h-4 w-4" />
            Spese
          </TabsTrigger>
          <TabsTrigger value="members">
            <Users className="h-4 w-4" />
            Membri
          </TabsTrigger>
        </TabsList>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-4">
          {expenses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Receipt className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Nessuna spesa</h3>
                <p className="text-muted-foreground mb-6">
                  Inizia aggiungendo la prima spesa di questo gruppo
                </p>
                <Button>
                  <Plus className="h-4 w-4" />
                  Aggiungi spesa
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {expenses.map((expense) => (
                <Card key={expense.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Receipt className="h-5 w-5 text-muted-foreground" />
                          <h3 className="text-lg font-semibold">{expense.description}</h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatDate(expense.date)}
                          </span>
                          <span>
                            Pagato da: {group.members.find(m => m.userId === expense.paidBy)?.name || 'Sconosciuto'}
                          </span>
                          <span>
                            Diviso tra {expense.splitBetween.length} {expense.splitBetween.length === 1 ? 'persona' : 'persone'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">
                          {formatCurrency(expense.amount, group.currency)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(expense.amount / expense.splitBetween.length, group.currency)} / persona
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Settle Up Section */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-full bg-primary/10">
                        <DollarSign className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Salda i conti</h3>
                        <p className="text-sm text-muted-foreground">
                          Registra un pagamento per saldare i debiti
                        </p>
                      </div>
                    </div>
                    <Button variant="default">
                      Salda
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="grid gap-4">
            {group.members.map((member) => (
              <Card key={member.userId}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatar} alt={member.name} />
                        <AvatarFallback>
                          {member.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {member.balance === 0 ? (
                        <Badge variant="outline">In pari</Badge>
                      ) : member.balance > 0 ? (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Deve ricevere</p>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {formatCurrency(member.balance, group.currency)}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Deve dare</p>
                          <p className="text-lg font-bold text-red-600 dark:text-red-400">
                            {formatCurrency(Math.abs(member.balance), group.currency)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-dashed">
            <CardContent className="text-center py-8">
              <Button variant="outline">
                <Plus className="h-4 w-4" />
                Invita nuovi membri
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

