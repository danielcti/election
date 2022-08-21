// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "../node_modules/hardhat/console.sol";

contract Election {
    struct Proposal {
        uint256 id;
        string name;
        uint256 votes;
    }
    struct Shareholder {
        address id;
        string name;
        bool voted;
        address delegate;
        uint256 vote; // id of the proposal
        uint256 numberOfShares;
        uint256 weight; // number of shares + delegated shares
    }

    address public owner;

    mapping(uint256 => Proposal) public proposals;
    uint256 public proposalsCount;

    mapping(address => Shareholder) public shareholders;
    address[] public shareholdersAddresses;

    uint64 public startTime;
    uint64 public endTime;

    event votedEvent(uint256 indexed _proposalId);

    constructor(
        uint64 _startTime,
        uint64 _endTime,
        string[] memory _proposals
    ) {
        owner = msg.sender;
        startTime = _startTime;
        endTime = _endTime;
        for (uint256 i = 0; i < _proposals.length; i++) {
            addProposal(_proposals[i]);
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

    function addProposal(string memory _name)
        public
        onlyOwner
        registrationTime
    {
        proposalsCount++;
        proposals[proposalsCount] = Proposal(proposalsCount, _name, 0);
    }

    function editProposal(uint256 _id, string memory _name)
        public
        onlyOwner
        registrationTime
    {
        require(_id > 0 && _id <= proposalsCount, "Invalid proposal id");
        proposals[_id].name = _name;
    }

    function deleteProposal(uint256 id) public onlyOwner registrationTime {
        require(proposals[id].id == id, "Proposal not found");
        proposals[id].id = 0;
        proposals[id].name = "";
        proposals[id].votes = 0;
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

    function vote(uint256 _proposalId) public votingTime onlyShareholder {
        require(
            shareholders[msg.sender].numberOfShares != 0,
            "You have no shares"
        );
        require(!shareholders[msg.sender].voted, "You already voted");
        require(
            _proposalId > 0 && _proposalId <= proposalsCount,
            "_proposalId should be bigger than 0 and less than proposalsCount"
        );

        shareholders[msg.sender].voted = true;
        shareholders[msg.sender].vote = _proposalId;
        proposals[_proposalId].votes += shareholders[msg.sender].weight;
        emit votedEvent(_proposalId);
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
            proposals[delegate_.vote].votes += sender.weight;
        } else {
            delegate_.weight += sender.weight;
        }
    }
}
