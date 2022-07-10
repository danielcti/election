import { ethers } from "hardhat";

async function main() {
  const Election = await ethers.getContractFactory("Election");
  const election = await Election.deploy();
  await election.deployed();

  console.log("Election deployed to:", election.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
