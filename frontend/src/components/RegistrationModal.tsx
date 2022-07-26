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
import { useState } from "react";

interface RegistrationModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  requestForVoting: (cpf: string, name: string) => Promise<void>;
}

export const RegistrationModal = ({
  isOpen,
  setIsOpen,
  requestForVoting,
}: RegistrationModalProps) => {
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");

  const onClose = () => {
    setIsOpen(false);
  };

  const onSubmit = async () => {
    await requestForVoting(cpf, name);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Registration Form</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Text>Name</Text>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </Box>
          <Box>
            <Text>CPF</Text>
            <Input value={cpf} onChange={(e) => setCpf(e.target.value)} />
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="green" onClick={onSubmit}>
            Register
          </Button>
          <Button colorScheme="red" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
