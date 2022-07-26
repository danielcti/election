import { ethers } from "hardhat";

async function main() {
  const startDate = new Date();
  const endTimestamp = Math.floor(
    startDate.setMinutes(startDate.getMinutes() + 2) / 1000
  );
  const Election = await ethers.getContractFactory("Election");
  const election = await Election.deploy(endTimestamp);
  await election.deployed();

  console.log("Election deployed to:", election.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
