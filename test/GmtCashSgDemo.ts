import { ethers } from "ethers";
import GmtCasSgDemoAbi from './abi/GmtCasSgDemo.abi.json'
import {expect} from "chai";

describe('GmtCashSgDemo Contract test', () => {
    const rpcUrl = 'https://1rpc.io/sepolia';
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    const contractAddress = '0x73b26A3a51bddF393469A52b0B434fB2521B3b78';

    // Create a contract instance
    const contract = new ethers.Contract(contractAddress, GmtCasSgDemoAbi.abi, provider);

    it('should access GmtCashSgDemo contract', async () => {
        // Read functions provided by contract
        const namesCount = await contract.getNamesCount();
        const selectedPersonToTreatDinner = await contract.selectPersonToTreatDinner();

        console.log(`namesCount: ${namesCount}`);
        console.log(`selectedPersonToTreatDinner: ${selectedPersonToTreatDinner}`);

        expect(namesCount).to.be.gt(0);
        expect(selectedPersonToTreatDinner).to.be.a('string');
    });

    it('should fetch logs emitted by GmtCashSgDemo contract', async () => {
        const latestBlock = await provider.getBlockNumber();
        const fromBlock = Math.max(0, latestBlock - 999);

        // Get all past MemberAdded events
        const events = await contract.queryFilter('MemberAdded', fromBlock, latestBlock);

        // Access event data
        events.forEach(event => {
            console.log(event)
        });

        // Events should be greater than 0
        expect(events.length).to.be.gt(0);
    });

    it('should write to GmtCashSgDemo contract', async () => {
        const privateKey = process.env.PRIVATE_KEY;
        if (!privateKey) throw new Error('Private key not found in environment variables');

        const signer = new ethers.Wallet(privateKey, provider);

        // Create contract instance with signer
        const contractWithSigner = new ethers.Contract(contractAddress, GmtCasSgDemoAbi.abi, signer);

        const tx = await contractWithSigner.addMember('XXX');
        const receipt = await tx.wait();
        console.log(receipt);
        expect(receipt.status).to.equal(1);
    });
});

// 0x918f9687
