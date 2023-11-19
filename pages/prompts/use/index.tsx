import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function UsePrompt() {
  const router = useRouter();
  useEffect(() => {
    router.push('/prompts');
  }, [router]);
}
