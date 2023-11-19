import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function CreatePrompt() {
  const router = useRouter();
  useEffect(() => {
    router.push('/prompts/new/1');
  }, [router]);
}
