// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Election {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }
    mapping(address => bool) public voters;
    mapping(uint256 => Candidate) public candidates;
    uint256 public candidatesCount;
    event votedEvent(uint256 indexed _candidateId);

    constructor() {
        addCandidate("Candidate 1");
        addCandidate("Candidate 2");
    }

    function addCandidate(string memory _name) private {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function vote(uint256 _candidateId) public {
        require(!voters[msg.sender]);
        require(
            _candidateId > 0 && _candidateId <= candidatesCount,
            "_candidateId should be bigger than 0 and less than candidatesCount"
        );

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        emit votedEvent(_candidateId);
    }
}
