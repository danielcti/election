import { ethers } from "ethers";
import { toast } from "react-toastify";
import Election from "../contracts/Election.json";
import {
  Candidate,
  ElectionStatus,
  electionStatusMap,
  EthersError,
  Shareholder,
} from "../utils/types";

declare let window: any;
const electionAddress = "0xDC11f7E700A4c898AE5CAddB1082cFfa76512aDD";

export async function fetchShareholders(): Promise<Shareholder[] | undefined> {
  if (typeof window.ethereum === "undefined") {
    toast.error("Please install MetaMask to vote");
    return;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(electionAddress, Election.abi, provider);
  try {
    let err: Error | undefined = undefined;
    const newShareholders: Shareholder[] = [];
    while (err === undefined) {
      try {
        const shareholderAddress = await contract.shareholdersAddresses(
          newShareholders.length
        );
        const shareholder = await contract.shareholders(shareholderAddress);
        newShareholders.push({
          id: shareholder[0],
          name: shareholder[1],
          voted: shareholder[2],
          delegate: shareholder[3],
          vote: shareholder[4].toNumber(),
          numberOfShares: shareholder[5].toNumber(),
        });
      } catch (e) {
        err = e as Error;
      }
    }
    return newShareholders;
  } catch (error) {
    console.log(error);
  }
}

export async function fetchCandidates(): Promise<Candidate[] | undefined> {
  if (typeof window.ethereum === "undefined") {
    toast.error("Please install MetaMask to vote");
    return;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(electionAddress, Election.abi, provider);
  try {
    const data = await contract.candidatesCount();
    const candidatesCount = data.toNumber();
    const newCandidates: Candidate[] = [];
    for (let i = 1; i <= candidatesCount; i++) {
      const candidate = await contract.candidates(i);
      if (candidate[0].toNumber() !== 0) {
        newCandidates.push({
          id: candidate[0].toNumber(),
          name: candidate[1],
          voteCount: candidate[2].toNumber(),
        });
      }
    }
    return newCandidates;
  } catch (error) {
    console.log(error);
  }
}

export async function getElectionStatus(): Promise<ElectionStatus | undefined> {
  if (typeof window.ethereum === "undefined") {
    toast.error("Please install MetaMask to vote");
    return;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(electionAddress, Election.abi, provider);
  const status: string = await contract.getElectionStatus(
    Math.floor(new Date().getTime() / 1000)
  );
  return electionStatusMap[status];
}

export async function requestAccount() {
  await window.ethereum.request({ method: "eth_requestAccounts" });
}

export async function delegateVote(delegateAddress: string, myAddress: string) {
  if (typeof window.ethereum === "undefined") {
    toast.error("Please install MetaMask to vote");
    return;
  }

  await requestAccount();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(electionAddress, Election.abi, signer);
  try {
    const transation = await contract.delegate(delegateAddress, {
      from: myAddress,
    });
    await transation.wait();
  } catch (error) {
    toast("Unexpected error", { type: "error" });
  }
}

export async function getMyAddress(): Promise<string | undefined> {
  const [account] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return account;
}

export async function addOrEditCandidate(
  myAddress: string,
  name: string,
  isEdit: boolean,
  id?: number
) {
  if (typeof window.ethereum === "undefined") {
    toast.error("Please install MetaMask to vote");
    return;
  }

  await requestAccount();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(electionAddress, Election.abi, signer);
  try {
    let transaction;
    if (isEdit) {
      transaction = await contract.editCandidate(id, name, { from: myAddress });
    } else {
      transaction = await contract.addCandidate(name, {
        from: myAddress,
      });
    }
    await transaction.wait();
  } catch ({ error }) {
    const typedError = error as EthersError;
    toast(
      "Unexpected error: " +
        typedError?.data?.message?.substr(78)?.replaceAll("'", ""),
      {
        type: "error",
      }
    );
  }
}

export async function getMyProfile(
  myAddress: string
): Promise<Shareholder | undefined> {
  if (typeof window.ethereum === "undefined") {
    toast.error("Please install MetaMask to vote");
    return;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(electionAddress, Election.abi, provider);
  const data = await contract.shareholders(myAddress);
  return {
    id: data[0],
    name: data[1],
    voted: data[2],
    delegate: data[3],
    vote: data[4].toNumber(),
    numberOfShares: data[5].toNumber(),
  };
}

export async function vote(myAddress: string, selectedCandidate: number) {
  if (typeof window.ethereum === "undefined") {
    toast.error("Please install MetaMask to vote");
    return;
  }

  await requestAccount();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(electionAddress, Election.abi, signer);
  try {
    const transation = await contract.vote(selectedCandidate, {
      from: myAddress,
    });
    await transation.wait();
  } catch (error) {
    toast("Unexpected error", { type: "error" });
  }
}

export async function deleteCandidate(id: number, myAddress: string) {
  if (typeof window.ethereum === "undefined") {
    toast.error("Please install MetaMask to vote");
    return;
  }

  await requestAccount();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(electionAddress, Election.abi, signer);
  try {
    const transation = await contract.deleteCandidate(id, {
      from: myAddress,
    });
    await transation.wait();
  } catch ({ error }) {
    const typedError = error as EthersError;
    toast(
      "Unexpected error: " +
        typedError?.data?.message?.substr(78)?.replaceAll("'", ""),
      {
        type: "error",
      }
    );
  }
}

export async function addOrEditShareholder(
  name: string,
  address: string,
  numberOfShares: number,
  isEdit: boolean,
  myAddress: string
) {
  if (typeof window.ethereum === "undefined") {
    toast.error("Please install MetaMask to vote");
    return;
  }

  await requestAccount();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(electionAddress, Election.abi, signer);
  try {
    let transaction: any;
    if (isEdit) {
      transaction = await contract.editShareholder(
        name,
        address,
        numberOfShares,
        {
          from: myAddress,
        }
      );
    } else {
      transaction = await contract.addShareholder(
        name,
        address,
        numberOfShares,
        {
          from: myAddress,
        }
      );
    }
    await transaction.wait();
  } catch ({ error }) {
    const typedError = error as EthersError;
    toast(
      "Unexpected error: " +
        typedError?.data?.message?.substr(78)?.replaceAll("'", ""),
      {
        type: "error",
      }
    );
  }
}

export async function deleteShareholder(address: string, myAddress: string) {
  if (typeof window.ethereum === "undefined") {
    toast.error("Please install MetaMask to vote");
    return;
  }

  await requestAccount();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(electionAddress, Election.abi, signer);
  try {
    const transation = await contract.deleteShareholder(address, {
      from: myAddress,
    });
    await transation.wait();
  } catch ({ error }) {
    const typedError = error as EthersError;
    toast(
      "Unexpected error: " +
        typedError?.data?.message?.substr(78)?.replaceAll("'", ""),
      {
        type: "error",
      }
    );
  }
}
