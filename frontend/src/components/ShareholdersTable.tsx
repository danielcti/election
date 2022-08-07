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
          No shareholders registered
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
        Shareholders List
      </Text>
      <TableContainer whiteSpace="normal">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Address</Th>
              <Th>Name</Th>
              <Th whiteSpace="nowrap">
                Shares
                <Tooltip label="Shareholder's number of shares." fontSize="md">
                  <QuestionIcon />
                </Tooltip>
              </Th>
              <Th whiteSpace="nowrap">
                Voted/Delegated
                <Tooltip
                  label="It indicates if the shareholder voted/not voted or delegated to another shareholder."
                  fontSize="md"
                >
                  <QuestionIcon />
                </Tooltip>
              </Th>
              {electionStatus === ElectionStatus.Registration && (
                <Th>Actions</Th>
              )}
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
                    ? `Delegated vote to: ${shareholder.delegate}`
                    : shareholder.voted
                    ? "Voted"
                    : "Did not voted"}
                </Td>
                {electionStatus === ElectionStatus.Registration && (
                  <Td>
                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => deleteShareholder(shareholder.id)}
                    >
                      Delete
                    </Button>
                    <Button
                      colorScheme="green"
                      size="sm"
                      ml={3}
                      onClick={() => openEditShareholderModal(shareholder)}
                    >
                      Edit
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
