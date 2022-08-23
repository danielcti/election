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
import { ElectionStatus, Proposal } from "../utils/types";

interface ProposalsTableProps {
  proposals: Proposal[];
  openEditProposalModal?: (proposal: Proposal) => void;
  electionStatus?: ElectionStatus;
  deleteProposal?: (id: number) => void;
  isAdmin?: boolean;
}

export const ProposalsTable = ({
  proposals,
  deleteProposal,
  electionStatus,
  isAdmin = false,
  openEditProposalModal,
}: ProposalsTableProps) => {
  if (proposals.length === 0) {
    return (
      <Box>
        <Text fontSize="xl" fontWeight="bold" mb={8} pb={4}>
          Nenhuma proposta registrada.
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
        Lista de propostas
      </Text>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Nome</Th>
              <Th>Votos</Th>
              {isAdmin && electionStatus === ElectionStatus.Registration && (
                <Th>Ações</Th>
              )}
            </Tr>
          </Thead>
          <Tbody>
            {proposals?.map((proposal) => (
              <Tr key={`row-${proposal.id}`}>
                <Td>{proposal.id}</Td>
                <Td>{proposal.name}</Td>
                <Td>{proposal.voteCount ?? "x"}</Td>
                {isAdmin && electionStatus === ElectionStatus.Registration && (
                  <Td>
                    <Button
                      colorScheme="red"
                      onClick={() =>
                        !!deleteProposal && deleteProposal(proposal.id)
                      }
                    >
                      Deletar
                    </Button>
                    <Button
                      colorScheme="blue"
                      onClick={() =>
                        !!openEditProposalModal &&
                        openEditProposalModal(proposal)
                      }
                      ml={3}
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
