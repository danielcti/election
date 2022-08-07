import { ethers } from "hardhat";

const candidates = ["John", "Jane", "Joe"];

async function main() {
  const NOW = new Date();
  const startTime = Math.floor(NOW.setMinutes(NOW.getMinutes() + 5) / 1000);
  const endTime = Math.floor(NOW.setMinutes(NOW.getMinutes() + 15) / 1000);
  const Election = await ethers.getContractFactory("Election");
  const election = await Election.deploy(startTime, endTime, candidates);
  await election.deployed();

  console.log("Election deployed to:", election.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
