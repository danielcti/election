import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Election", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployElection() {
    const [owner] = await ethers.getSigners();
    const Election = await ethers.getContractFactory("Election");
    const election = await Election.deploy();

    return { election, owner };
  }

  it("initializes with two candidates", async function () {
    const { election } = await loadFixture(deployElection);
    expect(await election.candidatesCount()).to.equal(2);
  });

  it("it initializes the candidates with the correct values", async function () {
    const { election } = await loadFixture(deployElection);
    const candidate1 = await election.candidates(1);
    const candidate2 = await election.candidates(2);

    expect(candidate1[0]).to.equal(1, "contains the correct id");
    expect(candidate1[1]).to.equal("Candidate 1", "contains the correct name");
    expect(candidate1[2]).to.equal(0, "contains the correct votes count");

    expect(candidate2[0]).to.equal(2, "contains the correct id");
    expect(candidate2[1]).to.equal("Candidate 2", "contains the correct name");
    expect(candidate2[2]).to.equal(0, "contains the correct votes count");
  });

  it("allows a voter to cast a vote", async function () {
    const { election, owner } = await loadFixture(deployElection);
    const candidateId = 1;

    const tx = await election.vote(candidateId, { from: owner.address });
    const receipt = await tx.wait();
    expect(receipt.events?.length).to.equal(1, "an event was triggered");

    const votedEvent = receipt.events && receipt.events[0];
    const votedEventCandidateId = votedEvent?.args && votedEvent.args[0];
    expect(votedEvent?.event).to.equal(
      "votedEvent",
      "the event type is correct"
    );
    expect(votedEventCandidateId.toNumber()).to.equal(
      candidateId,
      "the candidate id is correct"
    );

    const voted = await election.voters(owner.address);
    expect(voted).to.equal(true, "the voter was marked as voted");

    const candidate = await election.candidates(candidateId);
    expect(candidate[2]).to.equal(1, "increments the candidate's vote count");
  });

  it("throws an exception for invalid candiates", async function () {
    const { election, owner } = await loadFixture(deployElection);
    await expect(election.vote(99, { from: owner.address })).to.be.revertedWith(
      "_candidateId should be bigger than 0 and less than candidatesCount"
    );

    const candidate1 = await election.candidates(1);
    const candidate2 = await election.candidates(2);

    expect(candidate1[2]).to.equal(0, "candidate 1 did not receive any votes");
    expect(candidate2[2]).to.equal(0, "candidate 2 did not receive any votes");
  });

  // it("throws an exception for double voting", function() {
  //   return Election.deployed().then(function(instance) {
  //     electionInstance = instance;
  //     candidateId = 2;
  //     electionInstance.vote(candidateId, { from: accounts[1] });
  //     return electionInstance.candidates(candidateId);
  //   }).then(function(candidate) {
  //     var voteCount = candidate[2];
  //     assert.equal(voteCount, 1, "accepts first vote");
  //     // Try to vote again
  //     return electionInstance.vote(candidateId, { from: accounts[1] });
  //   }).then(assert.fail).catch(function(error) {
  //     assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
  //     return electionInstance.candidates(1);
  //   }).then(function(candidate1) {
  //     var voteCount = candidate1[2];
  //     assert.equal(voteCount, 1, "candidate 1 did not receive any votes");
  //     return electionInstance.candidates(2);
  //   }).then(function(candidate2) {
  //     var voteCount = candidate2[2];
  //     assert.equal(voteCount, 1, "candidate 2 did not receive any votes");
  //   });
  // });
});
