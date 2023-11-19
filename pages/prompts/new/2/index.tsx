import { Breadcrumb, Button, Checkbox, Form, Input, Select, Steps } from 'antd';
import Link from 'next/link';
import { useRouter } from 'next/router';

import useCreatePromptStore, {
  IPromptInputStep2,
} from '@/stores/create-prompt.store';

const { Option } = Select;

export default function CreatePrompt2() {
  const router = useRouter();
  const [prompt, setPromptInputStep2] = useCreatePromptStore((state) => [
    state.prompt,
    state.setPromptInputStep2,
  ]);
  const [form] = Form.useForm<IPromptInputStep2>();
  const promptVariables = useCreatePromptStore(
    (state) => state.promptVariables
  );

  const onFinish = (values: IPromptInputStep2) => {
    setPromptInputStep2(values);
    router.push('/prompts/new/3');
  };

  const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
  };

  const initialValues =
    promptVariables?.reduce((acc: Record<string, any>, promptVariable) => {
      if (promptVariable in prompt.variables) {
        acc[promptVariable] = prompt.variables[promptVariable];
      } else {
        acc[promptVariable] = {
          displayName: '',
          type: 'TextBox',
          isRequired: true,
          defaultValue: '',
        };
      }
      return acc;
    }, {}) || {};

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
          current={1}
          items={[
            {
              title: (
                <Link href="/prompts/new/1">
                  Enter your prompt with variables
                </Link>
              ),
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
          initialValues={initialValues}
        >
          {promptVariables &&
            promptVariables.map((promptVariable) => (
              <Form.Item
                label={`For variable "${promptVariable}":`}
                key={promptVariable}
              >
                <Form.Item
                  label="Display Name"
                  name={[promptVariable, 'displayName']}
                  rules={[
                    { required: true, message: 'Display name is required' },
                  ]}
                  key={`${promptVariable}#displayName`}
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  label="UI Type"
                  name={[promptVariable, 'type']}
                  rules={[{ required: true, message: 'UI type is required' }]}
                  key={`${promptVariable}#type`}
                >
                  <Select placeholder="Choose a UI component type">
                    <Option value="TextBox">TextBox</Option>
                    <Option value="TextArea">TextArea</Option>
                    <Option value="Dropdown">Dropdown</Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  name={[promptVariable, 'isRequired']}
                  valuePropName="isRequired"
                  key={`${promptVariable}#isRequired`}
                >
                  <Checkbox>Is Required</Checkbox>
                </Form.Item>
                <Form.Item
                  label="Default value"
                  name={[promptVariable, 'defaultValue']}
                  key={`${promptVariable}#defaultValue`}
                >
                  <Input />
                </Form.Item>
              </Form.Item>
            ))}

          <Form.Item className="flex justify-center">
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
}
