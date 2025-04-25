import { ethers } from 'ethers';
import { expect } from 'chai';

describe('RPC Demo', () => {
    it('should access block from RPC url', async () => {
        const rpcUrl = 'https://1rpc.io/sepolia';
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        // Get the latest block
        const block = await provider.getBlock('latest');

        expect(block).to.exist;
        expect(block?.number).to.be.above(0);

        console.log(block);
    });

    it('should access transaction from RPC url', async () => {
        const rpcUrl = 'https://1rpc.io/sepolia';
        const provider = new ethers.JsonRpcProvider(rpcUrl);

        // Get transaction by hash
        const transaction = await provider.getTransaction('0xb547a209d1d572661b82dc5aa094392a674f53d27445f5004a9992f29fc4c803');

        expect(transaction).to.exist;

        console.log(transaction);
    });

    it('should get private key from mnemonic', () => {
        // mnemonic phrase > seed > private key is a one way cryptographic function
        const mnemonic = process.env.SEED_PHRASE || '';
        const wallet = ethers.Wallet.fromPhrase(mnemonic);
        const privateKey = wallet.privateKey;
        const address = wallet.address;

        console.log("Private Key:", privateKey);
        console.log("Address:", address);
        expect(address).to.be.equal('0xFAF534DEefFa4e6E5E457128c10762992a6f7296');
    });
});
