import { ethers } from "hardhat";

async function main() {
    const GmtCashSgDemo = await ethers.getContractFactory("GmtCashSgDemo");
    const gmtCashSgDemo = await GmtCashSgDemo.deploy();
    await gmtCashSgDemo.waitForDeployment();

    console.log("GmtCashSgDemo deployed to:", await gmtCashSgDemo.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});

// 1. npx hardhat run scripts/deployGmtCashSgDemo.ts --network sepolia
// 2. npx hardhat verify --network sepolia <deployed network address>
