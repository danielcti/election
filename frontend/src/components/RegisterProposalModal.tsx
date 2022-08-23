import {
  Box,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Proposal } from "../utils/types";

interface RegisterProposalModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addOrEditProposal: (name: string) => Promise<void>;
  editingProposal: Proposal | undefined;
  setEditingProposal: (proposal: Proposal | undefined) => void;
}

export const RegisterProposalModal = ({
  isOpen,
  setIsOpen,
  addOrEditProposal,
  editingProposal,
  setEditingProposal,
}: RegisterProposalModalProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (editingProposal) {
      setName(editingProposal.name);
    }
  }, [editingProposal]);

  const onClose = () => {
    setIsOpen(false);
    setEditingProposal(undefined);
    setName("");
  };

  const onSubmit = async () => {
    await addOrEditProposal(name);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Formulário de registro de propostas</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Text>Nome</Text>
            <Input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Box>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button colorScheme="green" onClick={onSubmit}>
            {!!editingProposal ? "Atualizar" : "Registrar"}
          </Button>
          <Button colorScheme="red" mr={3} onClick={onClose}>
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
