import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("UUPSUpgradable", () => {
    const testValue = 3;
    async function deployUpgradableFixture() {
        const [owner, address1] = await ethers.getSigners();

        const upgradableV1Factory = await ethers.getContractFactory("UpgradableV1");
        const upgradableV1Proxy = await upgrades.deployProxy(upgradableV1Factory, [testValue],
            { initializer: "initialize" });

        return { owner, upgradableV1Proxy, address1 };
    }

    describe("Initial V1 deployment", () => {
        it("Should set the right owner", async ()=> {
            const { owner, upgradableV1Proxy } = await deployUpgradableFixture();

            expect(await upgradableV1Proxy.owner()).to.equal(owner.address);
        });

        it("Should deploy with correct testValue", async ()=> {
            const { upgradableV1Proxy } = await deployUpgradableFixture();

            expect(await upgradableV1Proxy.testValue()).to.equal(testValue);
        });
    });

    describe("Increment", () => {
        it("Should increment testValue by 1", async() => {
            const { upgradableV1Proxy } = await deployUpgradableFixture();
            await upgradableV1Proxy.incrementTestValueBy1();

            expect(await upgradableV1Proxy.testValue()).to.equal(testValue + 1);
        });

        it("Should increment testValue by 3", async() => {
            const { upgradableV1Proxy } = await deployUpgradableFixture();

            // When incrementTestValueBy1 is called 3 times
            await Promise.all([upgradableV1Proxy.incrementTestValueBy1(), upgradableV1Proxy.incrementTestValueBy1(),
                upgradableV1Proxy.incrementTestValueBy1()]);

            expect(await upgradableV1Proxy.testValue()).to.equal(testValue + 3);
        });
    });

    describe("Upgrade to V2", () => {
        it("Should upgrade to V2", async() => {
            const { owner, upgradableV1Proxy } = await deployUpgradableFixture();
            const proxyAddress = await upgradableV1Proxy.getAddress();

            // Perform proxy upgrade to V2
            const upgradableV2Factory = await ethers.getContractFactory("UpgradableV2");
            const upgradableV2Proxy = await upgrades.upgradeProxy(proxyAddress, upgradableV2Factory);

            expect(await upgradableV2Proxy.owner()).to.equal(owner.address);
            expect(await upgradableV2Proxy.testValue()).to.equal(testValue);

            // New functions should be callable
            await upgradableV2Proxy.incrementTestValueBy2();
            expect(await upgradableV2Proxy.testValue()).to.equal(testValue + 2);
            await upgradableV2Proxy.resetTestValueToZero();
            expect(await upgradableV2Proxy.testValue()).to.equal(0);

            // And old functions should not exist anymore
            expect(upgradableV2Proxy.incrementTestValueBy1).to.not.exist;
        });

        it("Should retain storage when upgrading to V2", async() => {
            const { upgradableV1Proxy } = await deployUpgradableFixture();
            const proxyAddress = await upgradableV1Proxy.getAddress();

            // When testValue is incremented by 1
            await upgradableV1Proxy.incrementTestValueBy1();

            // Perform proxy upgrade to V2
            const upgradableV2Factory = await ethers.getContractFactory("UpgradableV2");
            const upgradableV2Proxy = await upgrades.upgradeProxy(proxyAddress, upgradableV2Factory);

            expect(await upgradableV2Proxy.testValue()).to.equal(testValue + 1);
        });
    });
});