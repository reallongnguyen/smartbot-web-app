import type { Metadata } from 'next';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import './globals.css';
import { App } from 'antd';
import usePubSub from '@/repositories/pubsub/usePubSub';

export const metadata: Metadata = {
  title: 'SmartBot',
  description: 'Management your IoT devices',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  usePubSub();

  return (
    <html lang='en'>
      <body>
        <AntdRegistry>
          <App>{children}</App>
        </AntdRegistry>
      </body>
    </html>
  );
}
