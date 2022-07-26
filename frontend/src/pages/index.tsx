import { Button, Flex, Select, Text } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { ElectionResults } from "../components/ElectionResults";
import { RegistrationModal } from "../components/RegistrationModal";
import Election from "../contracts/Election.json";

const electionAddress = "0x0165878A594ca255338adfa4d48449f69242Eb8F";

interface Candidate {
  id: number;
  name: string;
  voteCount: number;
}

interface Voter {
  id: string;
  cpf: string;
  name: string;
  voted: boolean;
}

declare let window: any;

export default function Home() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [myProfile, setMyProfile] = useState<Voter | undefined>(undefined);
  const [myAddress, setMyAddress] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<number>(-1);
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [isVotingTime, setIsVotingTime] = useState(true);

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
      checkIfRegistered();
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

  async function checkIfRegistered() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        electionAddress,
        Election.abi,
        provider
      );
      const data = await contract.voters(myAddress);
      setMyProfile({
        id: data[0],
        cpf: data[1],
        name: data[2],
        voted: data[3],
      });
    }
  }

  async function getMyAddress() {
    const [account] = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setMyAddress(account);
  }

  async function requestForVoting(cpf: string, name: string) {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        electionAddress,
        Election.abi,
        signer
      );
      try {
        const transation = await contract.registerVoter(cpf, name, {
          from: myAddress,
        });
        await transation.wait();
        checkIfRegistered();
      } catch (error) {
        console.log(error);
      }
    }
  }

  async function checkIfIsVotingOver() {
    if (typeof window.ethereum !== "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(
        electionAddress,
        Election.abi,
        provider
      );
      const data = await contract.isVotingTime(
        Math.floor(new Date().getTime() / 1000)
      );
      console.log(data);
      setIsVotingTime(data);
    }
  }

  useEffect(() => {
    fetchCandidates();
    getMyAddress();
    checkIfIsVotingOver();
  }, []);

  useEffect(() => {
    if (myAddress) {
      checkIfRegistered();
    }
  }, [myAddress]);

  // useEffect(() => {
  //   if (typeof window.ethereum !== "undefined") {
  //     const provider = new ethers.providers.Web3Provider(window.ethereum);
  //     const contract = new ethers.Contract(
  //       electionAddress,
  //       Election.abi,
  //       provider
  //     );
  //     contract.on("votedEvent", (a, b) => {
  //       fetchCandidates();
  //       checkIfVoted();
  //       console.log(a, b);
  //     });
  //     return () => {
  //       contract.removeAllListeners();
  //     };
  //   }
  // });

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Flex flexDir="column" alignItems="center" p={4}>
      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        setIsOpen={setIsRegistrationModalOpen}
        requestForVoting={requestForVoting}
      />
      <ElectionResults candidates={candidates} />
      <Text mt={4}>Your account: {myAddress}</Text>
      {isVotingTime ? (
        myProfile?.cpf === "" ? (
          <Button onClick={() => setIsRegistrationModalOpen(true)}>
            Request for voting
          </Button>
        ) : myProfile?.voted ? (
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
        )
      ) : (
        <Text>Voting is over</Text>
      )}
    </Flex>
  );
}
