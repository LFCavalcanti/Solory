import Header from '@/components/common/Header';
import AuthSessionProvider from '@/components/providers/AuthSessionProvider';
import ChakraUiProvider from '@/components/providers/ChakraUiProvider';

export const metadata = {
  title: 'Solory',
  description: 'Facilitando a vida de empreendedores individuais',
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>
          <ChakraUiProvider>
            <Header />
            {children}
          </ChakraUiProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
