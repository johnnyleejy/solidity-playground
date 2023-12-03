import { expect } from "chai";
import { ethers } from "hardhat";

describe("Spacebear", () => {
    async function deploySpacebearFixture() {
        // Contracts are deployed using the first signer/account by default
        const [owner, address1] = await ethers.getSigners();

        const spaceBearFactory = await ethers.getContractFactory("Spacebear");
        const spaceBear = await spaceBearFactory.deploy();

        return { owner, spaceBear, address1 };
    }

    describe("Deployment", () => {
        it("Should set the right owner", async() => {
            const { owner, spaceBear } = await deploySpacebearFixture();

            expect(await spaceBear.owner()).to.equal(owner.address);
        });

        it("Should mint Spacebear NFT to correct owner", async() => {
            const { spaceBear, address1 } = await deploySpacebearFixture();

            await spaceBear.safeMint(address1, "testurl");

            expect(await spaceBear.ownerOf(0)).to.equal(address1.address);
        });
    });
});
