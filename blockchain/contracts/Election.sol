// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "../node_modules/hardhat/console.sol";

contract Election {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }
    struct Voter {
        address id;
        string cpf;
        string name;
        bool voted;
    }
    mapping(address => Voter) public voters;
    mapping(uint256 => Candidate) public candidates;
    uint256 public candidatesCount;
    uint64 private votingDeadline;
    event votedEvent(uint256 indexed _candidateId);

    constructor(uint64 _votingDeadline) {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
        votingDeadline = _votingDeadline;
    }

    modifier votingTime() {
        require(
            block.timestamp <= votingDeadline,
            "Action not performed during voting phase"
        );
        _;
    }

    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function registerVoter(string memory _cpf, string memory _name)
        public
        votingTime
    {
        require(
            voters[msg.sender].id == address(0),
            "You are already registered"
        );
        Voter memory voter = Voter(msg.sender, _cpf, _name, false);
        voters[msg.sender] = voter;
    }

    function vote(uint256 _candidateId) public votingTime {
        require(!voters[msg.sender].voted, "You already voted");
        require(
            _candidateId > 0 && _candidateId <= candidatesCount,
            "_candidateId should be bigger than 0 and less than candidatesCount"
        );

        voters[msg.sender].voted = true;
        candidates[_candidateId].voteCount++;
        emit votedEvent(_candidateId);
    }

    function isVotingTime(uint256 currentTime) public view returns (bool) {
        return currentTime <= votingDeadline;
    }
}
