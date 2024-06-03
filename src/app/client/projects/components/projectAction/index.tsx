'use client';
import { statusSelectOptions } from '@/types/Project/tProject';
import getTitleByAction from '@/lib/getTitleByAction';
import { useProjectActionFormStore } from '@/lib/hooks/state/useProjectActionFormStore';
//recebe os dados do projeto e qual a ação selecionada
//executa uma mensagem de confirmação e se o usuário clicar em SIM, executa chamada para a API

import {
  Button,
  Flex,
  Heading,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Text,
  useToast,
} from '@chakra-ui/react';
import { tSelectMenuOption } from '@/types/tSelectMenuOption';
import getButtonNameByAction from '@/lib/tokens/getButtonNameByAction';
import { tFechAppReturn } from '@/types/tFechAppReturn';
import fetchApp from '@/lib/fetchApp';
import { useRouter } from 'next/navigation';

//se retornar com sucesso, exibir um toast
export default function ProjectAction() {
  const [isOpen, projectData, action, closeForm] = useProjectActionFormStore(
    (state) => [state.isOpen, state.projectData, state.action, state.closeForm],
  );
  const toast = useToast();
  const router = useRouter();
  const title = getTitleByAction('PROJETO', action);
  const actionLabel = getButtonNameByAction(action);

  function findLiteralLabel(
    literals: tSelectMenuOption[],
    valueToFind: string,
  ) {
    const element: tSelectMenuOption | undefined = literals.find((item) => {
      return item.value === valueToFind;
    });

    if (!element) return '--ERRO--';

    return element.label;
  }

  async function handleAction() {
    let updatedData: tFechAppReturn;
    const apiAction =
      action === 'approve'
        ? 'approval'
        : action === 'cancel'
          ? 'close'
          : action;
    const bodyContent =
      action === 'close'
        ? { action: 'COMPLETE' }
        : action === 'cancel'
          ? { action: 'CANCEL' }
          : null;
    if (
      projectData?.status !== 'PROPOSAL' &&
      (action === 'approve' || action === 'refuse')
    ) {
      toast({
        title: 'Apenas projetos PROPOSTOS podem ser aprovados ou recusados',
        status: 'error',
      });
      return;
    }

    if (
      projectData?.status !== 'APPROVED' &&
      projectData?.status !== 'IN_PROGRESS' &&
      projectData?.status !== 'COMPLETE' &&
      (action === 'close' || action === 'cancel')
    ) {
      toast({
        title:
          'Apenas projetos APROVADOS, EM PROGRESSO ou COMPLETOS podem ser cancelados ou encerrados',
        status: 'error',
      });
      return;
    }

    try {
      updatedData = await fetchApp({
        method: 'POST',
        baseUrl: window.location.origin,
        endpoint: `/api/internal/projects/${projectData?.id}/${apiAction}`,
        // ...(body && { body }),
        ...(bodyContent && {
          body: JSON.stringify(bodyContent),
        }),
        // body: JSON.stringify({
        //   ...projectValidatedData,
        //   milestones: milestoneList,
        // }),
        cache: 'no-store',
      });
      if (!updatedData || updatedData.status !== 200) {
        console.error(updatedData);
        throw Error('Error calling FetchApp');
      }
    } catch (error) {
      console.error(error);
      const message = `Erro ao ${actionLabel} projeto "${projectData?.name}"`;
      toast({
        title: message,
        status: 'error',
      });
      return;
    }
    toast({
      title: `Projeto "${projectData?.name}" ${actionLabel} com sucesso.`,
      status: 'success',
    });
    closeForm();
    router.refresh();
    return;
  }

  return (
    <Modal
      closeOnOverlayClick={false}
      blockScrollOnMount={true}
      scrollBehavior={'inside'}
      isOpen={isOpen}
      onClose={closeForm}
      motionPreset="slideInRight"
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        borderRadius="0"
        maxHeight="calc(100vh - 50px)"
        // maxWidth="calc(100vw - 50px)"
        maxWidth="50vw"
        height="fit-content"
      >
        <ModalBody>
          <Flex
            direction="column"
            padding={4}
            gap={3}
            height="100%"
            width="100%"
          >
            <Flex
              height="100%"
              width="100%"
              alignItems="left"
              justifyContent="center"
              flexDirection="column"
              padding={2}
              bg="whiteAlpha.500"
            >
              <Flex
                borderBottom="5px solid"
                borderColor="brandPrimary.500"
                alignItems="left"
                justifyContent="center"
                bg="backgroundLight"
                flexDirection="column"
                boxShadow="lg"
                padding={2}
                width="100%"
              >
                <Heading
                  mt="auto"
                  mb="auto"
                  ml={4}
                  color="brandPrimary.500"
                  fontFamily="heading"
                  fontSize={20}
                >
                  {title}
                </Heading>
              </Flex>
              <Flex padding={2} gap={3} alignItems="left" ml={4}>
                <Text fontSize="14px">
                  <strong>PROJETO: </strong>
                  {projectData?.name}
                </Text>
                <Text fontSize="14px">
                  <strong>STATUS ATUAL: </strong>
                  {findLiteralLabel(
                    statusSelectOptions,
                    projectData?.status || '',
                  )}
                </Text>
              </Flex>
              <Flex
                flexDirection="row"
                padding={2}
                gap={3}
                alignItems="left"
                ml={4}
              >
                <Button
                  width={28}
                  variant="primary"
                  // mt={6}
                  onClick={handleAction}
                >
                  {actionLabel}
                </Button>
                <Button
                  width={28}
                  variant="secondaryOutline"
                  onClick={closeForm}
                >
                  CANCELAR
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
