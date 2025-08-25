import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ClientWelcome from './ClientWelcome';

export default async function WelcomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token')?.value;
  if (!token) {
    redirect('/');
  }
  return <ClientWelcome />;
}
