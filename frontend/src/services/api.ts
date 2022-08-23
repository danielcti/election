import { formatDistanceToNow } from "date-fns";
import ptBR from "date-fns/locale/pt-BR";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import Election from "../contracts/Election.json";
import {
  ElectionStatus,
  electionStatusMap,
  EthersError,
  Proposal,
  Shareholder,
} from "../utils/types";

declare let window: any;
const electionAddress = "0x5c74c94173F05dA1720953407cbb920F3DF9f887";

export async function fetchShareholders(): Promise<Shareholder[] | undefined> {
  if (typeof window.ethereum === "undefined") {
    toast.error("Por favor instale a Metamask.");
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

export async function fetchProposals(): Promise<Proposal[] | undefined> {
  if (typeof window.ethereum === "undefined") {
    toast.error("Por favor instale a Metamask.");
    return;
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(electionAddress, Election.abi, provider);
  try {
    const data = await contract.proposalsCount();
    const proposalsCount = data.toNumber();
    const newProposals: Proposal[] = [];
    for (let i = 1; i <= proposalsCount; i++) {
      const proposal = await contract.proposals(i);
      if (proposal[0].toNumber() !== 0) {
        newProposals.push({
          id: proposal[0].toNumber(),
          name: proposal[1],
          voteCount: proposal[2].toNumber(),
        });
      }
    }
    return newProposals;
  } catch (error) {
    console.log(error);
  }
}

export async function getElectionStatus(): Promise<ElectionStatus | undefined> {
  if (typeof window.ethereum === "undefined") {
    toast.error("Por favor instale a Metamask.");
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
    toast.error("Por favor instale a Metamask.");
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
    toast("Erro inesperado: ", { type: "error" });
  }
}

export async function getMyAddress(): Promise<string | undefined> {
  const [account] = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return account;
}

export async function addOrEditProposal(
  myAddress: string,
  name: string,
  isEdit: boolean,
  id?: number
) {
  if (typeof window.ethereum === "undefined") {
    toast.error("Por favor instale a Metamask.");
    return;
  }

  await requestAccount();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(electionAddress, Election.abi, signer);
  try {
    let transaction;
    if (isEdit) {
      transaction = await contract.editProposal(id, name, { from: myAddress });
    } else {
      transaction = await contract.addProposal(name, {
        from: myAddress,
      });
    }
    await transaction.wait();
  } catch ({ error }) {
    const typedError = error as EthersError;
    toast(
      "Erro inesperado: " +
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
    toast.error("Por favor instale a Metamask.");
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

export async function vote(myAddress: string, selectedProposal: number) {
  if (typeof window.ethereum === "undefined") {
    toast.error("Por favor instale a Metamask.");
    return;
  }

  await requestAccount();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(electionAddress, Election.abi, signer);
  try {
    const transation = await contract.vote(selectedProposal, {
      from: myAddress,
    });
    await transation.wait();
  } catch (error) {
    toast("Erro inesperado: ", { type: "error" });
  }
}

export async function deleteProposal(id: number, myAddress: string) {
  if (typeof window.ethereum === "undefined") {
    toast.error("Por favor instale a Metamask.");
    return;
  }

  await requestAccount();
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(electionAddress, Election.abi, signer);
  try {
    const transation = await contract.deleteProposal(id, {
      from: myAddress,
    });
    await transation.wait();
  } catch ({ error }) {
    const typedError = error as EthersError;
    toast(
      "Erro inesperado: : " +
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
    toast.error("Por favor instale a Metamask.");
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
      "Erro inesperado: : " +
        typedError?.data?.message?.substr(78)?.replaceAll("'", ""),
      {
        type: "error",
      }
    );
  }
}

export async function deleteShareholder(address: string, myAddress: string) {
  if (typeof window.ethereum === "undefined") {
    toast.error("Por favor instale a Metamask.");
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
      "Erro inesperado: : " +
        typedError?.data?.message?.substr(78)?.replaceAll("'", ""),
      {
        type: "error",
      }
    );
  }
}

export interface StartAndEndTime {
  startTime: number;
  endTime: number;
}

export const getStatus = async (): Promise<StartAndEndTime> => {
  if (typeof window.ethereum === "undefined") {
    toast.error("Por favor instale a Metamask.");
    return {
      startTime: 0,
      endTime: 0,
    };
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const contract = new ethers.Contract(electionAddress, Election.abi, provider);

  const startTime = await contract.startTime();
  // const formattedStartTime = format(
  //   new Date(startTime.toNumber() * 1000),
  //   "dd/MM/yyyy HH:mm:ss"
  // );
  const endTime = await contract.endTime();
  // const formattedEndTime = format(
  //   new Date(endTime.toNumber() * 1000),
  //   "dd/MM/yyyy HH:mm:ss"
  // );

  const formattedStartTime = `Início da votação ${formatDistanceToNow(
    startTime.toNumber() * 1000,
    {
      addSuffix: true,
      locale: ptBR,
    }
  )}`;

  const formattedEndTime = `Fim da votação ${formatDistanceToNow(
    endTime.toNumber() * 1000,
    {
      addSuffix: true,
      locale: ptBR,
    }
  )}`;

  return { startTime: startTime.toNumber(), endTime: endTime.toNumber() };
};
