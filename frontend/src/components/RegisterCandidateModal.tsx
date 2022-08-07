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
import { Candidate } from "../utils/types";

interface RegisterCandidateModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addOrEditCandidate: (name: string) => Promise<void>;
  editingCandidate: Candidate | undefined;
  setEditingCandidate: (candidate: Candidate | undefined) => void;
}

export const RegisterCandidateModal = ({
  isOpen,
  setIsOpen,
  addOrEditCandidate,
  editingCandidate,
  setEditingCandidate,
}: RegisterCandidateModalProps) => {
  const [name, setName] = useState("");

  useEffect(() => {
    if (editingCandidate) {
      setName(editingCandidate.name);
    }
  }, [editingCandidate]);

  const onClose = () => {
    setIsOpen(false);
    setEditingCandidate(undefined);
    setName("");
  };

  const onSubmit = async () => {
    await addOrEditCandidate(name);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Candidate Registration Form</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box>
            <Text>Name</Text>
            <Input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Box>
        </ModalBody>

        <ModalFooter gap={3}>
          <Button colorScheme="green" onClick={onSubmit}>
            {!!editingCandidate ? "Update" : "Register"}
          </Button>
          <Button colorScheme="red" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
