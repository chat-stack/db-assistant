import { Breadcrumb, Button, Steps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';

import useCreatePromptStore from '@/stores/create-prompt.store';
import usePromptsStore from '@/stores/prompts.store';

export default function CreatePrompt3() {
  const router = useRouter();
  const [prompt, reset] = useCreatePromptStore((state) => [
    state.prompt,
    state.reset,
  ]);
  const setPrompt = usePromptsStore((state) => state.setPrompt);

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="flex justify-start w-full">
          <Breadcrumb
            className="mr-auto"
            items={[
              {
                title: <Link href="/prompts">Prompts</Link>,
              },
              {
                title: 'Create New Prompt',
              },
            ]}
          />
        </div>
        <br />
        <Steps
          className="w-full mx-auto"
          direction="vertical"
          current={2}
          items={[
            {
              title: (
                <Link href="/prompts/new/1">
                  Enter your prompt with variables
                </Link>
              ),
            },
            {
              title: (
                <Link href="/prompts/new/2">
                  Select UI component for each variable
                </Link>
              ),
            },
            {
              title: 'Confirm and create',
            },
          ]}
        />
        <br />
        <div className="flex items-center justify-center">
          <Button
            onClick={() => {
              setPrompt(prompt);
              reset();
              router.push('/prompts');
            }}
          >
            Confirm and create this new UI prompt
          </Button>
        </div>
      </div>
    </>
  );
}
