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
  Tr,
} from "@chakra-ui/react";
import { Candidate, ElectionStatus } from "../utils/types";

interface CandidatesTableProps {
  candidates: Candidate[];
  openEditCandidateModal?: (candidate: Candidate) => void;
  electionStatus?: ElectionStatus;
  deleteCandidate?: (id: number) => void;
  isAdmin?: boolean;
}

export const CandidatesTable = ({
  candidates,
  deleteCandidate,
  electionStatus,
  isAdmin = false,
  openEditCandidateModal,
}: CandidatesTableProps) => {
  if (candidates.length === 0) {
    return (
      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={8} pb={4}>
          No candidates registered
        </Text>
      </Box>
    );
  }

  return (
    <Box w="100%">
      <Text
        fontSize="3xl"
        fontWeight="bold"
        mb={8}
        pb={4}
        borderBottom="1px solid #eee"
      >
        Candidates List
      </Text>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Name</Th>
              <Th>Votes</Th>
              {isAdmin && electionStatus === ElectionStatus.Registration && (
                <Th>Actions</Th>
              )}
            </Tr>
          </Thead>
          <Tbody>
            {candidates?.map((candidate) => (
              <Tr key={`row-${candidate.id}`}>
                <Td>{candidate.id}</Td>
                <Td>{candidate.name}</Td>
                <Td>{candidate.voteCount ?? "x"}</Td>
                {isAdmin && electionStatus === ElectionStatus.Registration && (
                  <Td>
                    <Button
                      colorScheme="red"
                      onClick={() =>
                        !!deleteCandidate && deleteCandidate(candidate.id)
                      }
                    >
                      Delete
                    </Button>
                    <Button
                      colorScheme="blue"
                      onClick={() =>
                        !!openEditCandidateModal &&
                        openEditCandidateModal(candidate)
                      }
                      ml={3}
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
