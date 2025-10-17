'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { groupService } from '@/lib/group-service';

export function CreateGroupForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [members, setMembers] = useState<string[]>(['']);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addMemberField = () => {
    setMembers([...members, '']);
  };

  const removeMemberField = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const updateMember = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!groupName.trim()) {
      newErrors.groupName = 'Il nome del gruppo è obbligatorio';
    }

    if (!currency.trim()) {
      newErrors.currency = 'La valuta è obbligatoria';
    }

    const validMembers = members.filter(m => m.trim());
    if (validMembers.length === 0) {
      newErrors.members = 'Aggiungi almeno un membro';
    }

    // Validate email format
    members.forEach((member, index) => {
      if (member.trim() && !member.includes('@')) {
        newErrors[`member_${index}`] = 'Email non valida';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const validMembers = members.filter(m => m.trim());
      const group = await groupService.createGroup(groupName, currency, validMembers);
      
      // Navigate to the new group
      router.push(`/groups/${group.id}`);
    } catch (error) {
      console.error('Failed to create group:', error);
      setErrors({ submit: 'Errore nella creazione del gruppo' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Crea un nuovo gruppo</CardTitle>
          <CardDescription>
            Aggiungi i dettagli del gruppo e invita i membri
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Group Name */}
          <div className="space-y-2">
            <Label htmlFor="groupName">Nome del gruppo *</Label>
            <Input
              id="groupName"
              placeholder="es. Weekend in montagna"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              aria-invalid={!!errors.groupName}
              aria-describedby={errors.groupName ? 'groupName-error' : undefined}
            />
            {errors.groupName && (
              <p id="groupName-error" className="text-sm text-red-600">
                {errors.groupName}
              </p>
            )}
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label htmlFor="currency">Valuta *</Label>
            <Input
              id="currency"
              placeholder="EUR"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase())}
              maxLength={3}
              aria-invalid={!!errors.currency}
              aria-describedby={errors.currency ? 'currency-error' : undefined}
            />
            {errors.currency && (
              <p id="currency-error" className="text-sm text-red-600">
                {errors.currency}
              </p>
            )}
          </div>

          {/* Members */}
          <div className="space-y-2">
            <Label>Membri del gruppo</Label>
            <div className="space-y-2">
              {members.map((member, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="email@esempio.com"
                    value={member}
                    onChange={(e) => updateMember(index, e.target.value)}
                    aria-label={`Email membro ${index + 1}`}
                    aria-invalid={!!errors[`member_${index}`]}
                  />
                  {members.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeMemberField(index)}
                      aria-label="Rimuovi membro"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addMemberField}
              className="w-full mt-2"
            >
              <Plus className="h-4 w-4" />
              Aggiungi membro
            </Button>
            {errors.members && (
              <p className="text-sm text-red-600">{errors.members}</p>
            )}
          </div>

          {errors.submit && (
            <p className="text-sm text-red-600">{errors.submit}</p>
          )}
        </CardContent>

        <CardFooter className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Annulla
          </Button>
          <Button type="submit" disabled={isLoading} className="flex-1">
            {isLoading ? 'Creazione...' : 'Crea gruppo'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

