import { Button, Flex, Input, Select, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { CandidatesTable } from "../components/CandidatesTable";
import {
  delegateVote,
  fetchCandidates,
  getElectionStatus,
  getMyAddress,
  getMyProfile,
  vote,
} from "../services/api";
import {
  Candidate,
  default_address,
  ElectionStatus,
  Shareholder,
} from "../utils/types";

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [myProfile, setMyProfile] = useState<Shareholder | undefined>(
    undefined
  );
  const [myAddress, setMyAddress] = useState<string>("");
  const [selectedCandidate, setSelectedCandidate] = useState<number>(-1);
  const [electionStatus, setElectionStatus] = useState<ElectionStatus>(
    ElectionStatus.Registration
  );
  const [delegateAddress, setDelegateAddress] = useState<string>("");

  useEffect(() => {
    async function fetchData() {
      const candidates = await fetchCandidates();
      setCandidates(candidates ?? []);
      const address = await getMyAddress();
      setMyAddress(address ?? "");
      const status = await getElectionStatus();
      setElectionStatus(status ?? ElectionStatus.Registration);
    }
    fetchData();
  }, []);

  useEffect(() => {
    async function fetchData() {
      if (myAddress) {
        const profile = await getMyProfile(myAddress);
        setMyProfile(profile);
      }
    }
    fetchData();
  }, [myAddress]);

  const renderBody = () => {
    if (electionStatus === ElectionStatus.Registration) {
      if (!!myProfile?.name) {
        return (
          <Text fontSize="3xl">The voting time have not started yet.</Text>
        );
      }
      return (
        <Text fontSize="3xl">
          You are not elegible to vote, please request it to the voting admin.
        </Text>
      );
    }

    if (!myProfile?.name) {
      return (
        <Text fontSize="3xl">
          You are not elegible to vote, please request it to the voting admin.
        </Text>
      );
    }

    if (electionStatus === ElectionStatus.Voting) {
      if (myProfile?.voted) {
        return (
          <Text fontSize="3xl">
            {myProfile?.delegate === default_address
              ? "You have already voted. Please wait for the end of the voting to check for the winner."
              : "You have already delegated your vote. Please wait for the end of the voting to check for the winner."}
          </Text>
        );
      }
      return (
        <Flex flexDir="column" gap={4}>
          <Text fontSize="xl">Voting time!</Text>
          <Flex gap={4}>
            <Select
              placeholder="Select candidate"
              size="md"
              onChange={(e) => setSelectedCandidate(parseInt(e.target.value))}
            >
              {candidates?.map((candidate) => (
                <option key={`option-${candidate.id}`} value={candidate.id}>
                  {candidate.name}
                </option>
              ))}
            </Select>
            <Button
              colorScheme="blue"
              size="md"
              onClick={async () => {
                await vote(myAddress, selectedCandidate);
                const profile = await getMyProfile(myAddress);
                setMyProfile(profile);
              }}
            >
              Vote
            </Button>
          </Flex>
          <Flex gap={4}>
            <Input
              placeholder="Delegate account"
              size="md"
              onChange={(e) => setDelegateAddress(e.target.value)}
            />
            <Button
              colorScheme="blue"
              size="md"
              onClick={async () => {
                await delegateVote(delegateAddress, myAddress);
                const profile = await getMyProfile(myAddress);
                setMyProfile(profile);
              }}
            >
              Delegate
            </Button>
          </Flex>
        </Flex>
      );
    }

    return (
      <Flex flexDir="column" gap={4}>
        <CandidatesTable candidates={candidates} />
        <Text fontSize="3xl">Voting is over!</Text>
      </Flex>
    );
  };

  return (
    <Flex
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      maxW={600}
      margin="0 auto"
      height="100vh"
      gap={5}
    >
      {renderBody()}
    </Flex>
  );
}