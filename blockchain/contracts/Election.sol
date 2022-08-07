// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "../node_modules/hardhat/console.sol";

contract Election {
    struct Candidate {
        uint256 id;
        string name;
        uint256 votes;
    }
    struct Shareholder {
        address id;
        string name;
        bool voted;
        address delegate;
        uint256 vote; // id of the candidate
        uint256 numberOfShares;
        uint256 weight; // number of shares + delegated shares
    }

    address public owner;

    mapping(uint256 => Candidate) public candidates;
    uint256 public candidatesCount;

    mapping(address => Shareholder) public shareholders;
    address[] public shareholdersAddresses;

    uint64 private startTime;
    uint64 private endTime;

    event votedEvent(uint256 indexed _candidateId);

    constructor(
        uint64 _startTime,
        uint64 _endTime,
        string[] memory _candidates
    ) {
        owner = msg.sender;
        startTime = _startTime;
        endTime = _endTime;
        for (uint256 i = 0; i < _candidates.length; i++) {
            addCandidate(_candidates[i]);
        }
    }

    modifier registrationTime() {
        require(block.timestamp <= startTime, "Registration time is over");
        _;
    }

    modifier votingTime() {
        require(block.timestamp <= endTime, "Voting time is over");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyShareholder() {
        require(
            shareholders[msg.sender].id != address(0),
            "Only shareholder can perform this action"
        );
        _;
    }

    function getElectionStatus(uint256 currentTime)
        public
        view
        returns (string memory)
    {
        if (currentTime < startTime) {
            return "Registration";
        } else if (currentTime < endTime) {
            return "Voting";
        } else {
            return "Finished";
        }
    }

    function isVotingTime(uint256 currentTime) public view returns (bool) {
        return currentTime <= endTime && currentTime >= startTime;
    }

    function addCandidate(string memory _name)
        public
        onlyOwner
        registrationTime
    {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    function editCandidate(uint256 _id, string memory _name)
        public
        onlyOwner
        registrationTime
    {
        require(_id > 0 && _id <= candidatesCount, "Invalid candidate id");
        candidates[_id].name = _name;
    }

    function deleteCandidate(uint256 id) public onlyOwner registrationTime {
        require(candidates[id].id == id, "Candidate not found");
        candidates[id].id = 0;
        candidates[id].name = "";
        candidates[id].votes = 0;
    }

    function addShareholder(
        string memory _name,
        address id,
        uint256 _numberOfShares
    ) public registrationTime onlyOwner {
        require(
            shareholders[id].id == address(0),
            "You are already registered"
        );
        Shareholder memory shareholder = Shareholder(
            id,
            _name,
            false,
            address(0),
            0,
            _numberOfShares,
            _numberOfShares
        );
        shareholders[id] = shareholder;
        shareholdersAddresses.push(id);
    }

    function editShareholder(
        string memory _name,
        address id,
        uint256 _numberOfShares
    ) public registrationTime onlyOwner {
        require(shareholders[id].id != address(0), "You are not registered");
        shareholders[id].name = _name;
        shareholders[id].numberOfShares = _numberOfShares;
        shareholders[id].weight = _numberOfShares;
    }

    function deleteShareholder(address id) public registrationTime onlyOwner {
        require(shareholders[id].id != address(0), "You are not registered");
        delete shareholders[id];
        address[] memory newShareholdersAddresses = new address[](
            shareholdersAddresses.length - 1
        );
        for (uint256 i = 0; i < shareholdersAddresses.length; i++) {
            if (shareholdersAddresses[i] != id) {
                newShareholdersAddresses[i] = shareholdersAddresses[i];
            }
        }
        shareholdersAddresses = newShareholdersAddresses;
    }

    function vote(uint256 _candidateId) public votingTime onlyShareholder {
        require(
            shareholders[msg.sender].numberOfShares != 0,
            "You have no shares"
        );
        require(!shareholders[msg.sender].voted, "You already voted");
        require(
            _candidateId > 0 && _candidateId <= candidatesCount,
            "_candidateId should be bigger than 0 and less than candidatesCount"
        );

        shareholders[msg.sender].voted = true;
        shareholders[msg.sender].vote = _candidateId;
        candidates[_candidateId].votes += shareholders[msg.sender].weight;
        emit votedEvent(_candidateId);
    }

    function delegate(address to) external {
        Shareholder storage sender = shareholders[msg.sender];
        require(sender.numberOfShares != 0, "You have no right to vote");
        require(!sender.voted, "You already voted.");

        require(to != msg.sender, "Self-delegation is disallowed.");

        while (shareholders[to].delegate != address(0)) {
            to = shareholders[to].delegate;
            require(to != msg.sender, "Found loop in delegation.");
        }

        Shareholder storage delegate_ = shareholders[to];

        require(delegate_.weight >= 1);

        sender.voted = true;
        sender.delegate = to;

        if (delegate_.voted) {
            candidates[delegate_.vote].votes += sender.weight;
        } else {
            delegate_.weight += sender.weight;
        }
    }
}
