export interface Shareholder {
  id: string;
  name: string;
  voted: boolean;
  delegate: string;
  vote: number; // id of the proposal
  numberOfShares: number;
}

export interface EthersError {
  code: number;
  data: {
    message: string;
  };
}

export enum ElectionStatus {
  Registration = 0,
  Voting = 1,
  Finished = 2,
}

export interface Proposal {
  id: number;
  name: string;
  voteCount: number;
}

export type ElectionStatusMap = { [key: string]: ElectionStatus };

export const electionStatusMap: ElectionStatusMap = {
  Registration: ElectionStatus.Registration,
  Voting: ElectionStatus.Voting,
  Finished: ElectionStatus.Finished,
};

export const default_address = "0x0000000000000000000000000000000000000000";
