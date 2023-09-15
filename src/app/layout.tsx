import LoadingSpinner from '@/components/common/LoadingSpinner';
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
    <html lang="pt-BR">
      <body>
        <AuthSessionProvider>
          <ChakraUiProvider>
            <LoadingSpinner />
            {children}
          </ChakraUiProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
