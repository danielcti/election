import {
  Box,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";

interface Candidate {
  id: number;
  name: string;
  voteCount: number;
}

interface ElectionResultsProps {
  candidates: Candidate[];
}

export const ElectionResults = ({ candidates }: ElectionResultsProps) => {
  return (
    <Box>
      <Text
        fontSize="3xl"
        fontWeight="bold"
        mb={8}
        pb={4}
        borderBottom="1px solid #eee"
      >
        Election Results
      </Text>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Name</Th>
              <Th isNumeric>Votes</Th>
            </Tr>
          </Thead>
          <Tbody>
            {candidates?.map((candidate) => (
              <Tr key={`row-${candidate.id}`}>
                <Td>{candidate.id}</Td>
                <Td>{candidate.name}</Td>
                <Td isNumeric>{candidate.voteCount}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};
