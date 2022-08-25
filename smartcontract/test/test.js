// We import Chai to use its asserting functions here.
const { expect } = require("chai");
const BigNumber = hre.ethers.BigNumber;

describe("Token contract", function () {

  let myDatabase;
  let myAsset;
  let owner, addr1, addr2, addr3, addr4, addr5, random;

  beforeEach(async function () {
    const MyDatabase = await hre.ethers.getContractFactory("Database");
    myDatabase = await MyDatabase.deploy();

    const MyAsset = await hre.ethers.getContractFactory("BEP20Token");
    myAsset = await MyAsset.deploy();

    [owner, addr1, addr2, addr3, addr4, addr5, random] = await ethers.getSigners();

    await myAsset.connect(owner).mint(ethers.utils.parseEther("10000000"));

  });

  describe("Basic function", function () {

    it("Alice send message to Bob", async function () {
      await myDatabase.connect(owner).createAccount("Alice");
      expect(await myDatabase.getUsername(owner.address)).to.be.equal("Alice");
    
      await myDatabase.connect(addr1).createAccount("Bob");
      expect(await myDatabase.getUsername(addr1.address)).to.be.equal("Bob");
    
      await myDatabase.connect(addr2).createAccount("Calos");
      expect(await myDatabase.getUsername(addr2.address)).to.be.equal("Calos");
    
    
      await myDatabase.connect(owner).addDefaultFriend(addr1.address);
    
      var frListAlice = await myDatabase.connect(owner).getMyFriendList();
      expect(frListAlice[0][1]).to.equal("Bob");
    
      await myDatabase.connect(owner).sendMessage(addr1.address, "Hello");
    
      var lsMsg = await myDatabase.connect(owner).readMessage(addr1.address);
      expect(lsMsg[0][2]).to.equal("Hello");
    });
    it("Alice make a normal group", async function () {

      await myDatabase.connect(owner).createAccount("Alice");    
      await myDatabase.connect(addr1).createAccount("Bob");    
      await myDatabase.connect(addr2).createAccount("Calos");

      await myDatabase.connect(owner).createGroup(random.address, "myGroup1", false, "avatar");
      await myDatabase.connect(owner).addMemToGroup(random.address, addr1.address);
      await myDatabase.connect(owner).addMemToGroup(random.address, addr2.address);
    
      await myDatabase.connect(owner).sendMessage(random.address, "Alice");

      var lsMsg = await myDatabase.connect(owner).readMessage(random.address);
      expect(lsMsg[0][2]).to.equal("Alice");

      await myDatabase.connect(addr2).sendMessage(random.address, "Hello Calos");
      lsMsg = await myDatabase.connect(addr2).readMessage(random.address);
      expect(lsMsg[1][2]).to.equal("Hello Calos");

      lsMsg = await myDatabase.connect(addr1).readMessage(random.address);
      expect(lsMsg[1][2]).to.equal("Hello Calos");

    })

    it("Alice make a normal group, anyone can make friend with the group", async function () {

      await myDatabase.connect(owner).createAccount("Alice");    
      await myDatabase.connect(addr1).createAccount("Bob");    
      await myDatabase.connect(addr2).createAccount("Calos");
      await myDatabase.connect(addr3).createAccount("Danny");

      await myDatabase.connect(owner).createGroup(random.address, "myGroup1", false, "avatar");
      await myDatabase.connect(owner).addMemToGroup(random.address, addr1.address);
      await myDatabase.connect(owner).addMemToGroup(random.address, addr2.address);
    
      await myDatabase.connect(owner).sendMessage(random.address, "Alice");

      var lsMsg = await myDatabase.connect(owner).readMessage(random.address);
      expect(lsMsg[0][2]).to.equal("Alice");

      await myDatabase.connect(addr3).addDefaultFriend(random.address);
      var lsMsg = await myDatabase.connect(owner).readMessage(random.address);

      expect(lsMsg[0][2]).to.equal("Alice");
    })

    it("Alice make a asset group", async function () {
      await myDatabase.connect(owner).createAccount("Alice");    
      await myDatabase.connect(addr1).createAccount("Bob");    
      await myDatabase.connect(addr2).createAccount("Calos");
      await myDatabase.connect(addr3).createAccount("Danny");

      await myDatabase.connect(owner).createGroup(myAsset.address, "myGroup1", true, "avatar");

      await myAsset.connect(owner).transfer(addr1.address, ethers.utils.parseEther("1"));

      await myDatabase.connect(owner).addMemToGroup(myAsset.address, addr1.address);
      await expect(myDatabase.connect(owner).addMemToGroup(myAsset.address, addr2.address)).to.be.revertedWith("Your friend does not have enough asset to be added in this group");

      await expect(myDatabase.connect(addr2).addDefaultFriend(myAsset.address)).to.be.revertedWith("You not have enough asset to be added in this group");

      await myAsset.connect(owner).transfer(addr3.address, ethers.utils.parseEther("1"));
      await myDatabase.connect(addr3).addDefaultFriend(myAsset.address);

    })
    it("Bob has no asset but make a asset group", async function () {
      await myDatabase.connect(owner).createAccount("Alice");    
      await myDatabase.connect(addr1).createAccount("Bob");    
      await myDatabase.connect(addr2).createAccount("Calos");
      await myDatabase.connect(addr3).createAccount("Danny");

      await expect(myDatabase.connect(addr2).createGroup(myAsset.address, "myGroup1", true, "avatar")).to.be.revertedWith("You do not have enough asset to send message in this group");

    })

    it("Read all users", async function () {
      await myDatabase.connect(owner).createAccount("Alice");    
      await myDatabase.connect(addr1).createAccount("Bob");    
      await myDatabase.connect(addr2).createAccount("Calos");
      await myDatabase.connect(addr3).createAccount("Danny");

      await myDatabase.connect(owner).createGroup(myAsset.address, "myGroup1", true, "avatar");
      var allUsers = await myDatabase.viewAllUsers();
      expect(allUsers.length).to.equal(5);
      await myDatabase.viewUser(owner.address);
    })
  });
});