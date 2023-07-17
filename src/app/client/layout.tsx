//import Header from '@/components/common/Header';
import NavBar from '@/components/common/NavBar';

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
