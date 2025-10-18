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
// import { walletService } from '@/lib/wallet-service';
import { StatChip } from '@/components/stat-chip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { QRCodeSVG } from 'qrcode.react';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [settlements, setSettlements] = useState<{ from: string; to: string; amount: number }[]>([]);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [splitBetween, setSplitBetween] = useState<string[]>([]);
  const [inviteUrl, setInviteUrl] = useState('');
  const [paying, setPaying] = useState<string | null>(null);
  const [myReceive, setMyReceive] = useState(0);
  const [myOwe, setMyOwe] = useState(0);

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

      // calcola saldi e suggerimenti
      const computedMembers = groupService.computeBalances(groupData, expensesData);
      setGroup({ ...groupData, members: computedMembers });
      const payments = await groupService.getGroupPayments(groupId);
      const s = groupService.computeSettlementsWithPayments({ ...groupData, members: computedMembers }, expensesData, payments);
      setSettlements(s.map(x => ({
        from: computedMembers.find(m => m.userId === x.fromUserId)?.name || 'Sconosciuto',
        to: computedMembers.find(m => m.userId === x.toUserId)?.name || 'Sconosciuto',
        amount: x.amount,
      })));
      // default pagatore = primo membro (creatore)
      if (!paidBy && computedMembers.length > 0) setPaidBy(computedMembers[0].userId);

      // leggi i miei saldi da Supabase
      const me = authService.getCurrentUser();
      if (me) {
        const mine = await groupService.getMyBalanceForGroup(groupId, me.name);
        setMyReceive(mine.receive);
        setMyOwe(mine.owe);
      } else {
        setMyReceive(0);
        setMyOwe(0);
      }
    } catch (error) {
      console.error('Failed to load group:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openInvite = () => {
    if (!group) return;
    const url = groupService.createInviteLink(group.id);
    setInviteUrl(url);
  };

  const handleSettlePayment = async (fromNickname: string, toNickname: string, amount: number) => {
    if (!group) return;
    setPaying(`${fromNickname}->${toNickname}`);
    try {
      // On-chain: opzionale invio nativo (solo demo UI) - qui non inviamo realmente
      // Persisti il pagamento su Supabase per riflettersi nei saldi
      await groupService.recordPayment({
        group_id: group.id,
        from_nickname: fromNickname,
        to_nickname: toNickname,
        amount_fiat: amount,
        currency: group.currency,
      });
      await loadGroupData();
    } catch (e) {
      console.error('record payment failed', e);
    } finally {
      setPaying(null);
    }
  };

  const handleAddExpense = async () => {
    if (!group) return;
    const validAmount = parseFloat(amount);
    if (!description.trim() || isNaN(validAmount) || validAmount <= 0 || !paidBy) return;
    const membersToSplit = splitBetween.length ? splitBetween : group.members.map(m => m.userId);
    await groupService.addExpense(group.id, {
      description,
      amount: validAmount,
      paidBy,
      splitBetween: membersToSplit,
    });
    setDescription('');
    setAmount('');
    setPaidBy('');
    setSplitBetween([]);
    setShowAddExpense(false);
    await loadGroupData();
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
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={openInvite}>
                  <Users className="h-4 w-4" />
                  Invita
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invita nel gruppo</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input readOnly value={inviteUrl} />
                    <Button variant="secondary" onClick={() => navigator.clipboard.writeText(inviteUrl)}>Copia</Button>
                  </div>
                  <div className="flex justify-center py-4">
                    {!!inviteUrl && <QRCodeSVG value={inviteUrl} size={180} />}
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showAddExpense} onOpenChange={setShowAddExpense}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4" />
                  Aggiungi spesa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuova spesa</DialogTitle>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label>Descrizione</Label>
                    <Input value={description} onChange={e => setDescription(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Importo</Label>
                    <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Pagato da</Label>
                    <select className="w-full h-10 rounded-md border px-3 bg-background" value={paidBy} onChange={e => setPaidBy(e.target.value)}>
                      <option value="">Seleziona</option>
                      {group.members.map(m => (
                        <option key={m.userId} value={m.userId}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>Dividi tra</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {group.members.map(m => {
                        const checked = splitBetween.includes(m.userId);
                        return (
                          <label key={m.userId} className="flex items-center gap-2 text-sm">
                            <input type="checkbox" checked={checked} onChange={(e) => {
                              setSplitBetween(prev => e.target.checked ? [...prev, m.userId] : prev.filter(id => id !== m.userId));
                            }} />
                            {m.name}
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">Se non selezioni nessuno, la spesa è divisa tra tutti</p>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" onClick={() => setShowAddExpense(false)}>Annulla</Button>
                    <Button onClick={handleAddExpense}>Salva</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Balance Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StatChip
            label="Ti devono in totale"
            amount={myReceive}
            currency={group.currency}
            variant="positive"
          />
          <StatChip
            label="Devi in totale"
            amount={myOwe}
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

              {/* Settle Up Section con suggerimenti */}
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Salda i conti</h3>
                      <p className="text-sm text-muted-foreground">Suggerimenti di rimborso</p>
                    </div>
                  </div>

                  {settlements.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Tutti in pari 🎉</p>
                  ) : (
                    <div className="space-y-2">
                      {settlements.map((s, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm gap-2">
                          <span>{s.from} → {s.to}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{formatCurrency(s.amount, group.currency)}</span>
                            <Button size="sm" variant="secondary" disabled={paying === `${s.from}->${s.to}`} onClick={() => handleSettlePayment(s.from, s.to, s.amount)}>
                              {paying === `${s.from}->${s.to}` ? 'Registrazione...' : 'Segna pagamento'}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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

