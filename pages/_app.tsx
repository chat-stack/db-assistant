import 'tailwindcss/tailwind.css';

import {
  BulbOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { Layout, Menu } from 'antd';
import { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

const { Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[]
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('Prompts', '/prompts', <BulbOutlined />),
  getItem('DB Chat', '/db-chat', <DatabaseOutlined />),
  getItem('Settings', '/settings', <SettingOutlined />),
  // getItem('Team', 'sub2', <TeamOutlined />, [
  //   getItem('Team 1', '6'),
  //   getItem('Team 2', '8'),
  // ]),
];

const App = ({ Component, pageProps }: AppProps) => {
  const [collapsed, setCollapsed] = useState(false);

  const router = useRouter();

  let selectedKey = '/prompts';
  items.forEach((item) => {
    if (item?.key) {
      if (router.pathname.split('/')[1].includes(item.key.toString())) {
        selectedKey = item.key.toString();
      }
    }
  });

  return (
    <Layout className="min-h-screen">
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
      >
        <div>
          <h1 className="text-center text-gray-100">DB Assistant</h1>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          items={items}
          defaultSelectedKeys={[selectedKey]}
          onSelect={(item) => {
            if (router.pathname !== item.key.toString()) {
              router.push(item.key.toString() + '/');
            }
          }}
        />
      </Sider>
      <Layout>
        <Content className="m-8">
          <Component {...pageProps} />
        </Content>
        <Footer className="text-center py-4">
          Created with ❤️ by James Zhang - Give it a ⭐ @Github
        </Footer>
      </Layout>
    </Layout>
  );
};

export default App;
