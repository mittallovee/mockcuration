'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm, type LoginFormData } from '@/components/login-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const webhookUrl =
    'https://n8n.lovee.info/webhook/auth';

  const handleSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        // Handle non-2xx responses
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const responseData = await res.json();

      // Check if the webhook response indicates success
      if (responseData.success === true) {
        // Set a simple auth cookie that the middleware will check.
        // Cookie expires in 1 hour.
        try {
          const expires = new Date(Date.now() + 60 * 60 * 1000).toUTCString();
          document.cookie = `auth-token=1; path=/; expires=${expires}; SameSite=Lax`;
        } catch (e) {
          // ignore if not available in some environments
        }
        router.push('/welcome');
      } else {
        setError('Invalid credentials.');
      }

    } catch (e) {
      if (e instanceof Error) {
        setError(`Failed to submit form: ${e.message}`);
      } else {
        setError('An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-12">
      <Card className="w-full max-w-md animate-fade-in-up">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold tracking-tight">
            Curation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm onSubmit={handleSubmit} isLoading={isLoading} />
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="w-full max-w-md mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </main>
  );
}
