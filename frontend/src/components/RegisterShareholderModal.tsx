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
import { Shareholder } from "../utils/types";

interface RegisterShareholderModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  addOrEditShareholder: (
    name: string,
    address: string,
    numberOfShares: number,
    isEdit: boolean
  ) => Promise<void>;
  editingShareholder: Shareholder | undefined;
  setEditingShareholder: (shareholder: Shareholder | undefined) => void;
}

export const RegisterShareholderModal = ({
  isOpen,
  setIsOpen,
  addOrEditShareholder,
  editingShareholder,
  setEditingShareholder,
}: RegisterShareholderModalProps) => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [numberOfShares, setNumberOfShares] = useState<string | number>(0);

  useEffect(() => {
    setName(editingShareholder?.name ?? "");
    setAddress(editingShareholder?.id ?? "");
    setNumberOfShares(editingShareholder?.numberOfShares ?? 0);
  }, [editingShareholder]);

  const onClose = () => {
    setIsOpen(false);
    setEditingShareholder(undefined);
    setName("");
    setAddress("");
    setNumberOfShares(0);
  };

  const onSubmit = async () => {
    await addOrEditShareholder(
      name,
      address,
      Number(numberOfShares) ?? 0,
      !!editingShareholder
    );
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Shareholder Registration Form</ModalHeader>
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
          <Box>
            <Text>Metamask Address</Text>
            <Input
              name="metaMaskAddress"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={!!editingShareholder}
            />
          </Box>
          <Box>
            <Text>Number of shares</Text>
            <Input
              name="numberOfShares"
              value={numberOfShares}
              type="number"
              onChange={(e) => setNumberOfShares(e.target.value)}
            />
          </Box>
        </ModalBody>

        <ModalFooter gap={3}>
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
