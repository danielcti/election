import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

const proposals = ["Proposta 1", "Proposta 2"];
const NOW = new Date();
const startTime = Math.floor(NOW.setMinutes(NOW.getMinutes() + 5) / 1000);
const endTime = Math.floor(NOW.setMinutes(NOW.getMinutes() + 15) / 1000);
const default_address = "0x0000000000000000000000000000000000000000";

describe("Election", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshopt in every test.
  async function deployElection() {
    const [owner, account1, account2] = await ethers.getSigners();
    const Election = await ethers.getContractFactory("Election");
    const election = await Election.deploy(startTime, endTime, proposals);

    return { election, owner, account1, account2 };
  }

  it("should initialize with the correct prpoposals, start and end times", async function () {
    const { election } = await loadFixture(deployElection);
    expect(await election.proposalsCount()).to.equal(proposals.length);
    expect(await election.startTime()).to.equal(startTime);
    expect(await election.endTime()).to.equal(endTime);
    proposals.forEach(async (proposal, index) => {
      const proposalData = await election.proposals(index + 1);
      expect(proposalData[0]).to.equal(index + 1);
      expect(proposalData[1]).to.equal(proposal);
      expect(proposalData[2]).to.equal(0);
    });
  });

  it("should get the correct election statuses", async function () {
    const { election } = await loadFixture(deployElection);
    const NOW = new Date();
    const registerTime = Math.floor(
      NOW.setMinutes(NOW.getMinutes() + 1) / 1000
    );
    expect(await election.getElectionStatus(registerTime)).to.equal(
      "Registration"
    );
    const votingTime = Math.floor(NOW.setMinutes(NOW.getMinutes() + 10) / 1000);
    expect(await election.getElectionStatus(votingTime)).to.equal("Voting");
    const finishedTime = Math.floor(
      NOW.setMinutes(NOW.getMinutes() + 20) / 1000
    );
    expect(await election.getElectionStatus(finishedTime)).to.equal("Finished");
  });

  it("should allow the admin to add a proposal in the register time", async function () {
    const { election, owner } = await loadFixture(deployElection);
    const tx = await election.addProposal("Proposta 3", {
      from: owner.address,
    });
    await tx.wait();

    expect(await election.proposalsCount()).to.equal(3);
    const proposal3 = await election.proposals(3);
    expect(proposal3[0]).to.equal(3, "contains the correct id");
    expect(proposal3[1]).to.equal("Proposta 3", "contains the correct name");
    expect(proposal3[2]).to.equal(0, "contains the correct votes count");
  });

  it("should allow the admin to edit a proposal in the register time", async function () {
    const { election, owner } = await loadFixture(deployElection);
    const tx = await election.editProposal(1, "Nova proposta", {
      from: owner.address,
    });
    await tx.wait();

    const proposal = await election.proposals(1);
    expect(proposal[0]).to.equal(1, "contains the correct id");
    expect(proposal[1]).to.equal("Nova proposta", "contains the correct name");
    expect(proposal[2]).to.equal(0, "contains the correct votes count");
  });

  it("should allow the admin to delete a proposal in the register time", async function () {
    const { election, owner } = await loadFixture(deployElection);
    const tx = await election.deleteProposal(1, {
      from: owner.address,
    });
    await tx.wait();

    const proposal = await election.proposals(1);
    expect(proposal[0]).to.equal(0, "contains the correct id");
    expect(proposal[1]).to.equal("", "contains the correct name");
    expect(proposal[2]).to.equal(0, "contains the correct votes count");
  });

  it("should not allow the admin to add a proposal after register time", async function () {
    const { election, owner } = await loadFixture(deployElection);
    await ethers.provider.send("evm_increaseTime", [600]); // 10 minutes

    await expect(
      election.addProposal("Proposta 3", {
        from: owner.address,
      })
    ).to.be.revertedWith("Periodo de registro acabou.");
  });

  it("should not allow the admin to edit a proposal after register time", async function () {
    const { election, owner } = await loadFixture(deployElection);
    await ethers.provider.send("evm_increaseTime", [600]); // 10 minutes

    await expect(
      election.editProposal(1, "Nova proposta", {
        from: owner.address,
      })
    ).to.be.revertedWith("Periodo de registro acabou.");
  });

  it("should not allow the admin to delete a proposal after register time", async function () {
    const { election, owner } = await loadFixture(deployElection);
    await ethers.provider.send("evm_increaseTime", [600]); // 10 minutes

    await expect(
      election.deleteProposal(1, {
        from: owner.address,
      })
    ).to.be.revertedWith("Periodo de registro acabou.");
  });

  it("should allow the admin to add a shareholder in the register time", async function () {
    const { election, owner, account1 } = await loadFixture(deployElection);
    const tx = await election.addShareholder("Fulano", account1.address, 1, {
      from: owner.address,
    });
    await tx.wait();
    const shareholder = await election.shareholders(account1.address);
    expect(shareholder[0]).to.equal(
      account1.address,
      "contains the correct id"
    );
    expect(shareholder[1]).to.equal("Fulano", "contains the correct name");
    expect(shareholder[2]).to.equal(false, "contains the correct voted value");
    expect(shareholder[3]).to.equal(
      default_address,
      "contains the correct delegate address"
    );
    expect(shareholder[4]).to.equal(0, "contains the correct vote value");
    expect(shareholder[5]).to.equal(1, "contains the correct number of shares");
    expect(shareholder[6]).to.equal(1, "contains the correct weight");
  });

  it("should allow the admin to edit a shareholder in the register time", async function () {
    const { election, owner, account1 } = await loadFixture(deployElection);
    const tx = await election.addShareholder("Fulano", account1.address, 1, {
      from: owner.address,
    });
    await tx.wait();
    const tx2 = await election.editShareholder(
      "Beltrano",
      account1.address,
      2,
      {
        from: owner.address,
      }
    );
    await tx2.wait();
    const shareholder = await election.shareholders(account1.address);
    expect(shareholder[0]).to.equal(
      account1.address,
      "contains the correct id"
    );
    expect(shareholder[1]).to.equal("Beltrano", "contains the correct name");
    expect(shareholder[2]).to.equal(false, "contains the correct voted value");
    expect(shareholder[3]).to.equal(
      default_address,
      "contains the correct delegate address"
    );
    expect(shareholder[4]).to.equal(0, "contains the correct vote value");
    expect(shareholder[5]).to.equal(2, "contains the correct number of shares");
    expect(shareholder[6]).to.equal(2, "contains the correct weight");
  });

  it("should allow the admin to delete a shareholder in the register time", async function () {
    const { election, owner, account1 } = await loadFixture(deployElection);
    const tx = await election.addShareholder("Fulano", account1.address, 1, {
      from: owner.address,
    });
    await tx.wait();
    const tx2 = await election.deleteShareholder(account1.address, {
      from: owner.address,
    });
    await tx2.wait();

    const shareholder = await election.shareholders(account1.address);
    expect(shareholder[0]).to.equal(default_address, "contains the correct id");
    expect(shareholder[1]).to.equal("", "contains the correct name");
    expect(shareholder[2]).to.equal(false, "contains the correct voted value");
    expect(shareholder[3]).to.equal(
      default_address,
      "contains the correct delegate address"
    );
    expect(shareholder[4]).to.equal(0, "contains the correct vote value");
    expect(shareholder[5]).to.equal(0, "contains the correct number of shares");
    expect(shareholder[6]).to.equal(0, "contains the correct weight");
  });

  it("should not allow the admin to add a shareholder after register time", async function () {
    const { election, owner, account1 } = await loadFixture(deployElection);
    await ethers.provider.send("evm_increaseTime", [600]); // 10 minutes

    await expect(
      election.addShareholder("Fulano", account1.address, 1, {
        from: owner.address,
      })
    ).to.be.revertedWith("Periodo de registro acabou.");
  });

  it("should not allow the admin to add a shareholder with a already used address", async function () {
    const { election, owner, account1 } = await loadFixture(deployElection);
    const tx = await election.addShareholder("Fulano", account1.address, 1, {
      from: owner.address,
    });
    await tx.wait();

    await expect(
      election.addShareholder("Beltrano", account1.address, 1, {
        from: owner.address,
      })
    ).to.be.revertedWith("Acionista ja esta registrado.");
  });

  it("should not allow the admin to edit a shareholder after register time", async function () {
    const { election, owner, account1 } = await loadFixture(deployElection);
    const tx = await election.addShareholder("Fulano", account1.address, 1, {
      from: owner.address,
    });
    await tx.wait();

    await ethers.provider.send("evm_increaseTime", [600]); // 10 minutes

    await expect(
      election.editShareholder("Fulano", account1.address, 1, {
        from: owner.address,
      })
    ).to.be.revertedWith("Periodo de registro acabou.");
  });

  it("should not allow the admin to edit a shareholder that does not exist", async function () {
    const { election, owner, account1 } = await loadFixture(deployElection);

    await expect(
      election.editShareholder("Beltrano", account1.address, 1, {
        from: owner.address,
      })
    ).to.be.revertedWith("Acionista nao esta registrado.");
  });

  it("should not allow the admin to delete a shareholder after register time", async function () {
    const { election, owner, account1 } = await loadFixture(deployElection);
    const tx = await election.addShareholder("Fulano", account1.address, 1, {
      from: owner.address,
    });
    await tx.wait();

    await ethers.provider.send("evm_increaseTime", [600]); // 10 minutes

    await expect(
      election.deleteShareholder(account1.address, {
        from: owner.address,
      })
    ).to.be.revertedWith("Periodo de registro acabou.");
  });

  it("should not allow the admin to delete a shareholder that does not exist", async function () {
    const { election, owner, account1 } = await loadFixture(deployElection);

    await expect(
      election.deleteShareholder(account1.address, {
        from: owner.address,
      })
    ).to.be.revertedWith("Acionista nao esta registrado.");
  });

  it("should allow a shareholder to cast a vote in the voting time", async function () {
    const { election, owner, account1 } = await loadFixture(deployElection);

    const tx1 = await election.addShareholder("Fulano", account1.address, 1, {
      from: owner.address,
    });
    await tx1.wait();

    await ethers.provider.send("evm_increaseTime", [600]); // 10 minutes

    const proposalId = 1;
    const tx2 = await election.connect(account1).vote(proposalId);
    await tx2.wait();

    const shareholder = await election.shareholders(account1.address);
    expect(shareholder[2]).to.equal(true, "contains the correct voted value");
    expect(shareholder[4]).to.equal(
      proposalId,
      "contains the correct vote value"
    );

    const proposal = await election.proposals(proposalId);
    expect(proposal[2]).to.equal(1, "increments the proposal's vote count");
  });

  it("should not allow a shareholder to cast a vote after voting time", async function () {
    const { election, owner, account1 } = await loadFixture(deployElection);

    const tx1 = await election.addShareholder("Fulano", account1.address, 1, {
      from: owner.address,
    });
    await tx1.wait();

    await ethers.provider.send("evm_increaseTime", [3600]); // 60 minutes

    await expect(election.connect(account1).vote(1)).to.be.revertedWith(
      "Periodo de votacao acabou."
    );
  });

  it("should not allow a shareholder to cast a vote in a proposal that does not exist", async function () {
    const { election, owner, account1 } = await loadFixture(deployElection);

    const tx1 = await election.addShareholder("Fulano", account1.address, 1, {
      from: owner.address,
    });
    await tx1.wait();

    await ethers.provider.send("evm_increaseTime", [600]); // 10 minutes

    await expect(election.connect(account1).vote(3)).to.be.revertedWith(
      "Proposta nao encontrada."
    );
  });

  it("should not allow the admin to cast a vote", async function () {
    const { election, owner, account1 } = await loadFixture(deployElection);

    const tx1 = await election.addShareholder("Fulano", account1.address, 1, {
      from: owner.address,
    });
    await tx1.wait();

    await ethers.provider.send("evm_increaseTime", [600]); // 10 minutes

    await expect(
      election.vote(1, {
        from: owner.address,
      })
    ).to.be.revertedWith("Apenas acionistas podem performar esta acao.");
  });

  it("should not allow a shareholder to cast a vote twice", async function () {
    const { election, owner, account1 } = await loadFixture(deployElection);

    const tx1 = await election.addShareholder("Fulano", account1.address, 1, {
      from: owner.address,
    });
    await tx1.wait();

    await ethers.provider.send("evm_increaseTime", [600]); // 10 minutes

    const proposalId = 1;
    const tx2 = await election.connect(account1).vote(proposalId);
    await tx2.wait();
    await expect(
      election.connect(account1).vote(proposalId)
    ).to.be.revertedWith("Acionista ja votou.");
  });

  it("should allow a shareholder to delegate a vote in the voting time when the delegate votes first", async function () {
    const { election, owner, account1, account2 } = await loadFixture(
      deployElection
    );

    const tx1 = await election.addShareholder("Fulano", account1.address, 1, {
      from: owner.address,
    });
    await tx1.wait();
    const tx2 = await election.addShareholder("Beltrano", account2.address, 1, {
      from: owner.address,
    });
    await tx2.wait();

    await ethers.provider.send("evm_increaseTime", [600]); // 10 minutes

    const proposalId = 1;
    const tx3 = await election.connect(account1).vote(proposalId);
    await tx3.wait();

    const tx4 = await election.connect(account2).delegate(account1.address);
    await tx4.wait();

    const shareholder1 = await election.shareholders(account1.address);
    expect(shareholder1[6]).to.equal(1, "contains the correct weight value");

    const shareholder2 = await election.shareholders(account2.address);
    expect(shareholder2[2]).to.equal(true, "contains the correct voted value");
    expect(shareholder2[3]).to.equal(
      account1.address,
      "contains the correct delegate value"
    );

    const proposal = await election.proposals(proposalId);
    expect(proposal[2]).to.equal(
      2,
      "increments the proposal's vote count twice"
    );
  });

  it("should allow a shareholder to delegate a vote in the voting time when the delegate votes after it", async function () {
    const { election, owner, account1, account2 } = await loadFixture(
      deployElection
    );

    const tx1 = await election.addShareholder("Fulano", account1.address, 1, {
      from: owner.address,
    });
    await tx1.wait();
    const tx2 = await election.addShareholder("Beltrano", account2.address, 1, {
      from: owner.address,
    });
    await tx2.wait();

    await ethers.provider.send("evm_increaseTime", [600]); // 10 minutes

    const proposalId = 1;
    const tx3 = await election.connect(account2).delegate(account1.address);
    await tx3.wait();

    const tx4 = await election.connect(account1).vote(proposalId);
    await tx4.wait();

    const shareholder1 = await election.shareholders(account1.address);
    expect(shareholder1[6]).to.equal(2, "contains the correct weight value");

    const shareholder2 = await election.shareholders(account2.address);
    expect(shareholder2[2]).to.equal(true, "contains the correct voted value");
    expect(shareholder2[3]).to.equal(
      account1.address,
      "contains the correct delegate value"
    );

    const proposal = await election.proposals(proposalId);
    expect(proposal[2]).to.equal(
      2,
      "increments the proposal's vote count twice"
    );
  });

  it("should not allow a shareholder to delegate a vote after voting time", async function () {
    const { election, owner, account1, account2 } = await loadFixture(
      deployElection
    );

    const tx1 = await election.addShareholder("Fulano", account1.address, 1, {
      from: owner.address,
    });
    await tx1.wait();
    const tx2 = await election.addShareholder("Beltrano", account2.address, 1, {
      from: owner.address,
    });
    await tx2.wait();

    await ethers.provider.send("evm_increaseTime", [600]); // 10 minutes

    const proposalId = 1;
    const tx3 = await election.connect(account1).vote(proposalId);
    await tx3.wait();

    await ethers.provider.send("evm_increaseTime", [3600]); // 60 minutes

    await expect(
      election.connect(account2).delegate(account1.address)
    ).to.be.revertedWith("Periodo de votacao acabou.");
  });

  it("should not allow a shareholder to delegate a vote when he already voted", async function () {
    const { election, owner, account1, account2 } = await loadFixture(
      deployElection
    );

    const tx1 = await election.addShareholder("Fulano", account1.address, 1, {
      from: owner.address,
    });
    await tx1.wait();
    const tx2 = await election.addShareholder("Beltrano", account2.address, 1, {
      from: owner.address,
    });
    await tx2.wait();

    await ethers.provider.send("evm_increaseTime", [600]); // 10 minutes

    const proposalId = 1;
    const tx3 = await election.connect(account1).vote(proposalId);
    await tx3.wait();

    await expect(
      election.connect(account1).delegate(account2.address)
    ).to.be.revertedWith("Acionista ja votou.");
  });

  it("should not allow a shareholder to delegate a vote to himself", async function () {
    const { election, owner, account1 } = await loadFixture(deployElection);

    const tx1 = await election.addShareholder("Fulano", account1.address, 1, {
      from: owner.address,
    });
    await tx1.wait();

    await ethers.provider.send("evm_increaseTime", [600]); // 10 minutes

    await expect(
      election.connect(account1).delegate(account1.address)
    ).to.be.revertedWith("Nao pode delegar para si mesmo.");
  });
});
