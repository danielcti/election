import { QuestionIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Select,
  Text,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ProposalsTable } from "../components/ProposalsTable";
import {
  delegateVote,
  fetchProposals,
  getElectionStatus,
  getMyAddress,
  getMyProfile,
  getStatus,
  StartAndEndTime,
  vote,
} from "../services/api";
import { formatTimestampDistanceFromNow } from "../utils/helper";
import {
  default_address,
  ElectionStatus,
  Proposal,
  Shareholder,
} from "../utils/types";

export default function Home() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [myProfile, setMyProfile] = useState<Shareholder | undefined>(
    undefined
  );
  const [myAddress, setMyAddress] = useState<string>("");
  const [selectedProposal, setSelectedProposal] = useState<number>(-1);
  const [electionStatus, setElectionStatus] = useState<ElectionStatus>(
    ElectionStatus.Registration
  );
  const [delegateAddress, setDelegateAddress] = useState<string>("");
  const [startAndEndTime, setStartAndEndTime] = useState<StartAndEndTime>(
    {} as StartAndEndTime
  );
  const [now, setNow] = useState<number>(Date.now());

  useEffect(() => {
    async function fetchData() {
      const proposals = await fetchProposals();
      setProposals(proposals ?? []);
      const address = await getMyAddress();
      setMyAddress(address ?? "");
      const status = await getElectionStatus();
      setElectionStatus(status ?? ElectionStatus.Registration);
      const { startTime, endTime } = await getStatus();
      setStartAndEndTime({
        startTime,
        endTime,
      });
    }
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 60 * 1000);

    return () => clearInterval(interval);
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
          <Text fontSize="3xl">O período de votação ainda não começou.</Text>
        );
      }
      return (
        <Text fontSize="3xl">
          Você não está elegível para votar. Por favor solicite a um
          administrador.
        </Text>
      );
    }

    if (!myProfile?.name) {
      return <Text fontSize="3xl">Você não está elegível para votar.</Text>;
    }

    if (electionStatus === ElectionStatus.Voting) {
      if (myProfile?.voted) {
        return (
          <Text fontSize="3xl">
            {myProfile?.delegate === default_address
              ? "Você já votou. Por favor aguarde o fim da votação para ver os resultados."
              : "Você já delegou seu voto. Por favor aguarde o fim da votação para ver os resultados."}
          </Text>
        );
      }
      return (
        <Flex flexDir="column" gap={4}>
          <Flex gap={4}>
            <Select
              placeholder="Selecione a proposta"
              size="md"
              onChange={(e) => setSelectedProposal(parseInt(e.target.value))}
            >
              {proposals?.map((proposal) => (
                <option key={`option-${proposal.id}`} value={proposal.id}>
                  {proposal.name}
                </option>
              ))}
            </Select>
            <Button
              colorScheme="blue"
              size="md"
              onClick={async () => {
                await vote(myAddress, selectedProposal);
                const profile = await getMyProfile(myAddress);
                setMyProfile(profile);
              }}
            >
              Votar
            </Button>
          </Flex>
          <Flex gap={4}>
            <Input
              placeholder="Endereço do delegado"
              size="md"
              onChange={(e) => setDelegateAddress(e.target.value)}
            />
            <Tooltip
              label="Endereço do acionista que você deseja delegar seu voto."
              fontSize="md"
            >
              <QuestionIcon />
            </Tooltip>
            <Button
              colorScheme="blue"
              size="md"
              onClick={async () => {
                await delegateVote(delegateAddress, myAddress);
                const profile = await getMyProfile(myAddress);
                setMyProfile(profile);
              }}
            >
              Delegar
            </Button>
          </Flex>
        </Flex>
      );
    }

    return (
      <Flex flexDir="column" gap={4}>
        <ProposalsTable proposals={proposals} />
        {/* <ProposalsBarChart proposals={proposals} /> */}
        <Text fontSize="3xl">A votação terminou!</Text>
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
      <Heading>Sistema de votação</Heading>
      <Box>
        <Text>
          Inicio da votação
          {formatTimestampDistanceFromNow(startAndEndTime.startTime)}
        </Text>
        <Text>
          Fim da votação
          {formatTimestampDistanceFromNow(startAndEndTime.endTime)}
        </Text>
      </Box>
      {renderBody()}
    </Flex>
  );
}
