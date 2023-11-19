import { Breadcrumb, Button, Form, Input, Steps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChangeEvent, useEffect, useState } from 'react';

import useCreatePromptStore, {
  IPromptInputStep1,
} from '@/stores/create-prompt.store';
import toHandle from '@/utils/toHandle';

export default function CreatePrompt1() {
  const router = useRouter();
  const [form] = Form.useForm<IPromptInputStep1>();
  const [promptInputStep1, setPromptInputStep1] = useCreatePromptStore(
    (state) => [state.promptInputStep1, state.setPromptInputStep1]
  );
  const [isHandleEditedState, setIsHandleEditedState] = useState(false);

  const onFinish = (values: IPromptInputStep1) => {
    try {
    } catch (e) {
      // TODO add error toast or error msg to form input
      // validate mustache
    }
    setPromptInputStep1(values);
    router.push('/prompts/new/2');
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  useEffect(() => {
    form?.setFieldsValue(promptInputStep1);
  }, [promptInputStep1, form]);

  const handleReset = () => {
    setPromptInputStep1({
      name: '',
      handle: '',
      content: '',
    });
    setIsHandleEditedState(false);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    if (!isHandleEditedState) {
      const handle = toHandle(name);
      form?.setFieldsValue({ name, handle });
    } else {
      form?.setFieldsValue({ name });
    }
  };

  const handleHandleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsHandleEditedState(true);
    form?.setFieldsValue({ handle: e.target.value });
  };

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
          current={0}
          items={[
            {
              title: 'Enter your prompt with variables',
            },
            {
              title: 'Select UI component for each variable',
            },
            {
              title: 'Confirm and create',
            },
          ]}
        />
        <br />
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          className="w-full mx-auto"
          initialValues={promptInputStep1}
        >
          <Form.Item
            label={'Name'}
            name={'name'}
            key={'name'}
            rules={[{ required: true, message: 'Name is required' }]}
          >
            <Input
              placeholder="Simple Translator"
              onChange={handleNameChange}
            />
          </Form.Item>
          <Form.Item
            label={'Handle'}
            name={'handle'}
            key={'handle'}
            rules={[{ required: true, message: 'Handle is required' }]}
          >
            <Input
              placeholder="simple-translator"
              onChange={handleHandleChange}
            />
          </Form.Item>
          <Button
            className="mb-4"
            onClick={() => {
              const name = form?.getFieldValue('name');
              const handle = toHandle(name);
              form?.setFieldsValue({ handle });
              setIsHandleEditedState(false);
            }}
          >
            Generate from name
          </Button>
          <Form.Item
            label={'Prompt'}
            name={'content'}
            key={'content'}
            rules={[{ required: true, message: 'Prompt is required' }]}
          >
            <Input.TextArea
              rows={10}
              placeholder="Translate any user input from {{sourceLang}} to {{targetLang}}"
            />
          </Form.Item>

          <Form.Item className="flex justify-center">
            <Button type="primary" htmlType="submit" className="mx-2">
              Next
            </Button>
            <Button onClick={handleReset} className="mx-2">
              Reset
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
}
