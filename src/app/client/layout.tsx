'use client';
import SideBar from '@/components/common/SideBar';
import TopMessageSlider from '@/components/common/TopMessageSlider';
import { useTopMessageSliderStore } from '@/lib/hooks/state/useTopMessageSliderStore';
import { HStack, Flex } from '@chakra-ui/react';

export default function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen] = useTopMessageSliderStore((state) => [state.isOpen]);
  return (
    <Flex
      height="100vh"
      width="100vw"
      bgGradient="linear-gradient(to right bottom, #066d87, #087c99, #0b8bac, #0f9bbf, #12abd3);"
    >
      {isOpen && <TopMessageSlider />}
      <HStack height="100%" width="100%" padding={2} spacing={0}>
        {/* SIDEBAR */}
        <SideBar />
        {/* MAIN CONTENT*/}
        {children}
      </HStack>
    </Flex>
  );
}
