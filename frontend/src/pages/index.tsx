import {
  Button,
  Flex,
  Select,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import Election from "../contracts/Election.json";

const electionAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

interface Candidate {
  id: number;
  name: string;
  voteCount: number;
}

declare let window: any;

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
  const [myAddress, setMyAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<number>(-1);

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function vote() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        electionAddress,
        Election.abi,
        signer
      );
      const transation = await contract.vote(selectedCandidate, {
        from: myAddress,
      });
      await transation.wait();
      fetchCandidates();
      checkIfVoted();
    }
  }

  async function fetchCandidates() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        electionAddress,
        Election.abi,
        provider
      );
      try {
        const data = await contract.candidatesCount();
        const candidatesCount = data.toNumber();
        const newCandidates: Candidate[] = [];
        for (let i = 1; i <= candidatesCount; i++) {
          const candidate = await contract.candidates(i);
          newCandidates.push({
            id: candidate[0].toNumber(),
            name: candidate[1],
            voteCount: candidate[2].toNumber(),
          });
        }
        setCandidates(newCandidates);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }
  }

  async function checkIfVoted() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        electionAddress,
        Election.abi,
        provider
      );
      const data = await contract.voters(myAddress);
      setAlreadyVoted(data);
    }
  }

  async function getMyAddress() {
    const [account] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setMyAddress(account);
  }

  useEffect(() => {
    fetchCandidates();
    getMyAddress();
  }, []);

  useEffect(() => {
    if (myAddress) {
      checkIfVoted();
    }
  }, [myAddress]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Flex flexDir="column" alignItems="center" p={4}>
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
      {alreadyVoted ? (
        <Text my={4}>You have already voted</Text>
      ) : (
        <Flex my={4} gap={4}>
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
          <Button colorScheme="blue" size="md" onClick={() => vote()}>
            Vote
          </Button>
        </Flex>
      )}
      <Text mt={4}>Your account: {myAddress}</Text>
    </Flex>
  );
}
