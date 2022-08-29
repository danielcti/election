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
        require(block.timestamp <= startTime, "Periodo de registro acabou.");
        _;
    }

    modifier votingTime() {
        require(block.timestamp <= endTime, "Periodo de votacao acabou.");
        _;
    }

    modifier onlyOwner() {
        require(
            msg.sender == owner,
            "Apenas o administrador pode perfomar esta acao."
        );
        _;
    }

    modifier onlyShareholder() {
        require(
            shareholders[msg.sender].id != address(0),
            "Apenas acionistas podem performar esta acao."
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
        require(proposals[_id].id == _id, "Proposta nao encontrada.");
        proposals[_id].name = _name;
    }

    function deleteProposal(uint256 _id) public onlyOwner registrationTime {
        require(proposals[_id].id == _id, "Proposta nao encontrada.");
        delete proposals[_id];
    }

    function addShareholder(
        string memory _name,
        address _id,
        uint256 _numberOfShares
    ) public registrationTime onlyOwner {
        require(
            shareholders[_id].id == address(0),
            "Acionista ja esta registrado."
        );
        Shareholder memory shareholder = Shareholder(
            _id,
            _name,
            false,
            address(0),
            0,
            _numberOfShares,
            _numberOfShares
        );
        shareholders[_id] = shareholder;
        shareholdersAddresses.push(_id);
    }

    function editShareholder(
        string memory _name,
        address _id,
        uint256 _numberOfShares
    ) public registrationTime onlyOwner {
        require(
            shareholders[_id].id != address(0),
            "Acionista nao esta registrado."
        );
        shareholders[_id].name = _name;
        shareholders[_id].numberOfShares = _numberOfShares;
        shareholders[_id].weight = _numberOfShares;
    }

    function deleteShareholder(address _id) public registrationTime onlyOwner {
        require(
            shareholders[_id].id != address(0),
            "Acionista nao esta registrado."
        );
        delete shareholders[_id];
        address[] memory newShareholdersAddresses = new address[](
            shareholdersAddresses.length - 1
        );
        for (uint256 i = 0; i < shareholdersAddresses.length; i++) {
            if (shareholdersAddresses[i] != _id) {
                newShareholdersAddresses[i] = shareholdersAddresses[i];
            }
        }
        shareholdersAddresses = newShareholdersAddresses;
    }

    function vote(uint256 _proposalId) public votingTime onlyShareholder {
        require(
            shareholders[msg.sender].numberOfShares != 0,
            "Acionista nao possui acoes."
        );
        require(!shareholders[msg.sender].voted, "Acionista ja votou.");
        require(
            proposals[_proposalId].id == _proposalId,
            "Proposta nao encontrada."
        );

        shareholders[msg.sender].voted = true;
        shareholders[msg.sender].vote = _proposalId;
        proposals[_proposalId].votes += shareholders[msg.sender].weight;
    }

    function delegate(address _to) public votingTime onlyShareholder {
        Shareholder storage sender = shareholders[msg.sender];
        require(sender.numberOfShares != 0, "Acionista nao possui acoes.");
        require(!sender.voted, "Acionista ja votou.");

        require(_to != msg.sender, "Nao pode delegar para si mesmo.");

        while (shareholders[_to].delegate != address(0)) {
            _to = shareholders[_to].delegate;
            require(_to != msg.sender, "Foi encontrado um loop de delegacao.");
        }

        Shareholder storage delegate_ = shareholders[_to];

        require(delegate_.weight >= 1);

        sender.voted = true;
        sender.delegate = _to;

        if (delegate_.voted) {
            proposals[delegate_.vote].votes += sender.weight;
        } else {
            delegate_.weight += sender.weight;
        }
    }
}
