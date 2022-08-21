import { Button, Flex, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ProposalsTable } from "../components/ProposalsTable";
import { RegisterProposalModal } from "../components/RegisterProposalModal";
import { RegisterShareholderModal } from "../components/RegisterShareholderModal";
import { ShareholdersTable } from "../components/ShareholdersTable";
import {
  addOrEditProposal,
  addOrEditShareholder,
  deleteProposal,
  deleteShareholder,
  fetchProposals,
  fetchShareholders,
  getElectionStatus,
  getMyAddress,
} from "../services/api";
import { ElectionStatus, Proposal, Shareholder } from "../utils/types";

export default function Home() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [myAddress, setMyAddress] = useState<string>("");
  const [
    isShareholderRegistrationModalOpen,
    setIsShareholderRegistrationModalOpen,
  ] = useState(false);
  const [isProposalRegistrationModalOpen, setIsProposalRegistrationModalOpen] =
    useState(false);
  const [electionStatus, setElectionStatus] = useState<ElectionStatus>(
    ElectionStatus.Registration
  );
  const [editingShareholder, setEditingShareholder] = useState<
    Shareholder | undefined
  >(undefined);
  const [editingProposal, setEditingProposal] = useState<Proposal | undefined>(
    undefined
  );

  useEffect(() => {
    async function fetchData() {
      const newShareholders = await fetchShareholders();
      setShareholders(newShareholders ?? []);
      const proposals = await fetchProposals();
      setProposals(proposals ?? []);
      const address = await getMyAddress();
      setMyAddress(address ?? "");
      const status = await getElectionStatus();
      setElectionStatus(status ?? ElectionStatus.Registration);
    }
    fetchData();
  }, []);

  return (
    <Flex
      flexDir="column"
      alignItems="center"
      margin="0 auto"
      px={8}
      py={4}
      gap={5}
    >
      <Heading>Admin</Heading>
      {electionStatus === ElectionStatus.Registration && (
        <Flex gap={4}>
          <Button
            colorScheme="blue"
            onClick={() => setIsShareholderRegistrationModalOpen(true)}
          >
            Register Shareholder
          </Button>
          <RegisterShareholderModal
            isOpen={isShareholderRegistrationModalOpen}
            setIsOpen={setIsShareholderRegistrationModalOpen}
            addOrEditShareholder={async (
              name: string,
              address: string,
              numberOfShares: number,
              isEdit: boolean
            ) => {
              await addOrEditShareholder(
                name,
                address,
                numberOfShares,
                isEdit,
                myAddress
              );
              const newShareholders = await fetchShareholders();
              setShareholders(newShareholders ?? []);
            }}
            editingShareholder={editingShareholder}
            setEditingShareholder={setEditingShareholder}
          />
          <Button
            colorScheme="green"
            onClick={() => setIsProposalRegistrationModalOpen(true)}
          >
            Register Proposal
          </Button>
          <RegisterProposalModal
            isOpen={isProposalRegistrationModalOpen}
            setIsOpen={setIsProposalRegistrationModalOpen}
            addOrEditProposal={async (name: string) => {
              await addOrEditProposal(
                myAddress,
                name,
                !!editingProposal,
                editingProposal?.id
              );
              const proposals = await fetchProposals();
              setProposals(proposals ?? []);
            }}
            editingProposal={editingProposal}
            setEditingProposal={setEditingProposal}
          />
        </Flex>
      )}
      <ShareholdersTable
        shareholders={shareholders}
        deleteShareholder={async (address: string) => {
          await deleteShareholder(address, myAddress);
          const newShareholders = await fetchShareholders();
          setShareholders(newShareholders ?? []);
        }}
        openEditShareholderModal={(shareholder: Shareholder) => {
          setEditingShareholder(shareholder);
          setIsShareholderRegistrationModalOpen(true);
        }}
        electionStatus={electionStatus}
      />
      <ProposalsTable
        proposals={proposals}
        isAdmin
        electionStatus={electionStatus}
        deleteProposal={async (id: number) => {
          await deleteProposal(id, myAddress);
          const proposals = await fetchProposals();
          setProposals(proposals ?? []);
        }}
        openEditProposalModal={(proposal: Proposal) => {
          setEditingProposal(proposal);
          setIsProposalRegistrationModalOpen(true);
        }}
      />
    </Flex>
  );
}
