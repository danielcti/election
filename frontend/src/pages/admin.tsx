import { Button, Flex, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { CandidatesTable } from "../components/CandidatesTable";
import { RegisterCandidateModal } from "../components/RegisterCandidateModal";
import { RegisterShareholderModal } from "../components/RegisterShareholderModal";
import { ShareholdersTable } from "../components/ShareholdersTable";
import {
  addOrEditCandidate,
  addOrEditShareholder,
  deleteCandidate,
  deleteShareholder,
  fetchCandidates,
  fetchShareholders,
  getElectionStatus,
  getMyAddress,
} from "../services/api";
import { Candidate, ElectionStatus, Shareholder } from "../utils/types";

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [myAddress, setMyAddress] = useState<string>("");
  const [
    isShareholderRegistrationModalOpen,
    setIsShareholderRegistrationModalOpen,
  ] = useState(false);
  const [
    isCandidateRegistrationModalOpen,
    setIsCandidateRegistrationModalOpen,
  ] = useState(false);
  const [electionStatus, setElectionStatus] = useState<ElectionStatus>(
    ElectionStatus.Registration
  );
  const [editingShareholder, setEditingShareholder] = useState<
    Shareholder | undefined
  >(undefined);
  const [editingCandidate, setEditingCandidate] = useState<
    Candidate | undefined
  >(undefined);

  useEffect(() => {
    async function fetchData() {
      const newShareholders = await fetchShareholders();
      setShareholders(newShareholders ?? []);
      const candidates = await fetchCandidates();
      setCandidates(candidates ?? []);
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
            onClick={() => setIsCandidateRegistrationModalOpen(true)}
          >
            Register Candidate
          </Button>
          <RegisterCandidateModal
            isOpen={isCandidateRegistrationModalOpen}
            setIsOpen={setIsCandidateRegistrationModalOpen}
            addOrEditCandidate={async (name: string) => {
              await addOrEditCandidate(
                myAddress,
                name,
                !!editingCandidate,
                editingCandidate?.id
              );
              const candidates = await fetchCandidates();
              setCandidates(candidates ?? []);
            }}
            editingCandidate={editingCandidate}
            setEditingCandidate={setEditingCandidate}
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
      <CandidatesTable
        candidates={candidates}
        isAdmin
        electionStatus={electionStatus}
        deleteCandidate={async (id: number) => {
          await deleteCandidate(id, myAddress);
          const candidates = await fetchCandidates();
          setCandidates(candidates ?? []);
        }}
        openEditCandidateModal={(candidate: Candidate) => {
          setEditingCandidate(candidate);
          setIsCandidateRegistrationModalOpen(true);
        }}
      />
    </Flex>
  );
}
