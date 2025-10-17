'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateGroupForm } from '@/components/create-group-form';
import { authService } from '@/lib/auth-service';
import Link from 'next/link';

export default function NewGroupPage() {
  const router = useRouter();

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      router.push('/sign-in');
    }
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4" />
            Torna alla home
          </Button>
        </Link>
      </div>

      <CreateGroupForm />
    </div>
  );
}

