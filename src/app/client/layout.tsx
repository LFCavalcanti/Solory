'use client';
import SideBar from '@/components/common/SideBar';
import { HStack } from '@chakra-ui/react';

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <HStack
      height="100vh"
      width="100%"
      padding={2}
      spacing={0}
      bgGradient="linear-gradient(to right bottom, #066d87, #087895, #0a84a3, #0d8fb1, #0f9bbf, #00a6c2, #00b1c3, #00bcc2, #13c6a7, #5bcb80, #97cc52, #d4c528);"
    >
      {/* SIDEBAR */}
      <SideBar></SideBar>
      {/* MAIN CONTENT*/}
      {children}
    </HStack>
  );
}
