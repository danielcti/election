import { QuestionIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import { default_address, ElectionStatus, Shareholder } from "../utils/types";

interface ShareholdersTableProps {
  shareholders: Shareholder[];
  deleteShareholder: (id: string) => void;
  openEditShareholderModal: (shareholder: Shareholder) => void;
  electionStatus: ElectionStatus;
}

export const ShareholdersTable = ({
  shareholders,
  deleteShareholder,
  openEditShareholderModal,
  electionStatus,
}: ShareholdersTableProps) => {
  if (shareholders.length === 0) {
    return (
      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={8} pb={4}>
          Nenhum acionista registrado.
        </Text>
      </Box>
    );
  }

  return (
    <Box width="100%">
      <Text
        fontSize="3xl"
        fontWeight="bold"
        mb={8}
        pb={4}
        borderBottom="1px solid #eee"
      >
        Lista de acionistas
      </Text>
      <TableContainer whiteSpace="normal">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Endereço</Th>
              <Th>Nome</Th>
              <Th whiteSpace="nowrap">
                Ações
                <Tooltip label="Número de ações do acionista." fontSize="md">
                  <QuestionIcon />
                </Tooltip>
              </Th>
              <Th whiteSpace="nowrap">
                Votou/Delegou
                <Tooltip
                  label="Isso indica se o acionista votou ou não e se delegou seu voto para outro acionista."
                  fontSize="md"
                >
                  <QuestionIcon />
                </Tooltip>
              </Th>
              {electionStatus === ElectionStatus.Registration && <Th>Ações</Th>}
            </Tr>
          </Thead>
          <Tbody>
            {shareholders?.map((shareholder) => (
              <Tr key={`row-${shareholder.id}`}>
                <Td>{shareholder.id}</Td>
                <Td>{shareholder.name}</Td>
                <Td>{shareholder.numberOfShares}</Td>
                <Td>
                  {shareholder.delegate !== default_address
                    ? `Delegou voto para: ${shareholder.delegate}`
                    : shareholder.voted
                    ? "Votou"
                    : "Não votou"}
                </Td>
                {electionStatus === ElectionStatus.Registration && (
                  <Td>
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => deleteShareholder(shareholder.id)}
                    >
                      Deletar
                    </Button>
                    <Button
                      colorScheme="green"
                      size="sm"
                      ml={3}
                      onClick={() => openEditShareholderModal(shareholder)}
                    >
                      Editar
                    </Button>
                  </Td>
                )}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};
