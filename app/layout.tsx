import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import './globals.css';
import { App } from 'antd';
import AppProvider from './AppProvider';

export const metadata: Metadata = {
  title: 'SmartBot',
  description: 'Management your IoT devices',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body>
        <AppProvider />
        <AntdRegistry>
          <App>{children}</App>
        </AntdRegistry>
      </body>
    </html>
  );
}
