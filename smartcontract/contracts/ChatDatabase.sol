// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.7;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Database {

    // Stores the default name of an user and her friends info
    struct user {
        string name;
        address userAddress;
        friend[] friendList;
        uint256 userType; // 1 : normal user, 2: group
        bool checkOwnId;
        string avatar;
    }

    // Each friend is identified by its address and name assigned by the second party
    struct friend {
        address pubkey;
        string name;
        uint256 userType;
    }

    // message construct stores the single chat message and its metadata
    struct message {
        address sender;
        uint256 timestamp;
        string msg;
    }

    // Collection of users registered on the application
    mapping(address => user) userList;
    // Collection of messages communicated in a channel between two users
    mapping(bytes32 => message[]) allMessages; // key : Hash(user1,user2)
    // List of all users for searching
    user[] allUsers;

    // It checks whether a user(identified by its public key)
    // has created an account on this application or not
    function checkUserExists(address pubkey) public view returns(bool) {
        return bytes(userList[pubkey].name).length > 0;
    }

    // Registers the caller(msg.sender) to our app with a non-empty username
    function createAccount(string calldata name) external {
        require(checkUserExists(msg.sender)==false, "User already exists!");
        require(bytes(name).length>0, "Username cannot be empty!"); 
        userList[msg.sender].name = name;
        userList[msg.sender].userType = 1;
        userList[msg.sender].userAddress = msg.sender;
        allUsers.push(userList[msg.sender]);
    }

    // Registers the a group with id, name, isAssetGroup and avatar
    function createGroup(address groupId, string calldata name, bool checkOwnId, string calldata avatar) external {
        require(checkUserExists(groupId)==false, "Group already exists!");
        require(bytes(name).length>0, "Group name cannot be empty!"); 
        
        if (checkOwnId==true) {
            IERC20 token = IERC20(groupId);
            require(token.balanceOf(msg.sender)>0, "You do not have enough asset to send message in this group");
        }

        userList[groupId].name = name;
        userList[groupId].userType = 2;
        userList[groupId].checkOwnId = checkOwnId;
        userList[groupId].userAddress = groupId;
        userList[groupId].avatar = avatar;

        _addFriend(groupId, msg.sender, userList[msg.sender].name,1);
        _addFriend(msg.sender, groupId, name,2);

        allUsers.push(userList[groupId]);
    }

    // add member inside group
    function addMemToGroup(address groupId, address friend_key) external {
        require(checkUserExists(groupId), "Create a group first!");
        require(checkUserExists(friend_key), "User is not registered!");
        require(checkAlreadyFriends(groupId,friend_key)==false, "These users are already friends!");
        require(userList[groupId].userType==2, "This is not a group");

        if (userList[groupId].checkOwnId==true) {
            IERC20 token = IERC20(groupId);
            require(token.balanceOf(friend_key)>0, "Your friend does not have enough asset to be added in this group");
        }
        _addFriend(groupId, friend_key, userList[friend_key].name,1);
        _addFriend(friend_key, groupId, userList[groupId].name,2);

    }

    // Returns the default name provided by an user
    function getUsername(address pubkey) external view returns(string memory) {
        require(checkUserExists(pubkey), "User is not registered!");
        return userList[pubkey].name;
    }

    // Adds new user as your friend with an default nickname
    function addDefaultFriend(address friend_key) external {
        require(checkUserExists(msg.sender), "Create an account first!");
        require(checkUserExists(friend_key), "User is not registered!");
        require(msg.sender!=friend_key, "Users cannot add themselves as friends!");
        require(checkAlreadyFriends(msg.sender,friend_key)==false, "These users are already friends!");

        if (userList[friend_key].userType==2 && userList[friend_key].checkOwnId==true) {
            IERC20 token = IERC20(friend_key);
            require(token.balanceOf(msg.sender)>0, "You not have enough asset to be added in this group");
        }

        _addFriend(msg.sender, friend_key, userList[friend_key].name,userList[friend_key].userType);
        _addFriend(friend_key, msg.sender, userList[msg.sender].name,1);
    }

    // Adds new user as your friend with an associated nickname
    function addFriend(address friend_key, string calldata name) external {
        require(checkUserExists(msg.sender), "Create an account first!");
        require(checkUserExists(friend_key), "User is not registered!");
        require(msg.sender!=friend_key, "Users cannot add themselves as friends!");
        require(checkAlreadyFriends(msg.sender,friend_key)==false, "These users are already friends!");

        _addFriend(msg.sender, friend_key, name, userList[friend_key].userType);
        _addFriend(friend_key, msg.sender, userList[msg.sender].name,1);
    }

    // Checks if two users are already friends or not
    function checkAlreadyFriends(address pubkey1, address pubkey2) internal view returns(bool) {

        if(userList[pubkey1].friendList.length > userList[pubkey2].friendList.length)
        {
            address tmp = pubkey1;
            pubkey1 = pubkey2;
            pubkey2 = tmp;
        }

        for(uint i=0; i<userList[pubkey1].friendList.length; ++i)
        {
            if(userList[pubkey1].friendList[i].pubkey == pubkey2)
                return true;
        }
        return false;
    }

    // A helper function to update the friendList
    function _addFriend(address me, address friend_key, string memory name, uint256 userType) internal {
        friend memory newFriend = friend(friend_key,name, userType);
        userList[me].friendList.push(newFriend);
    }

    // Returns list of friends of the sender
    function getMyFriendList() external view returns(friend[] memory) {
        return userList[msg.sender].friendList;
    }

    // Returns a unique code for the channel created between the two users
    function _getChatCode(address pubkey1, address pubkey2) internal pure returns(bytes32) {
        if(pubkey1 < pubkey2)
            return keccak256(abi.encodePacked(pubkey1, pubkey2));
        else
            return keccak256(abi.encodePacked(pubkey2, pubkey1));
    }

    // Sends a new message to a given friend
    function sendMessage(address friend_key, string calldata _msg) external {
        require(checkUserExists(msg.sender), "Create an account first!");
        require(checkUserExists(friend_key), "User is not registered!");
        require(checkAlreadyFriends(msg.sender,friend_key), "You are not friends with the given user");

        if (userList[friend_key].userType == 1) {
            bytes32 chatCode = _getChatCode(msg.sender, friend_key);
            message memory newMsg = message(msg.sender, block.timestamp, _msg);
            allMessages[chatCode].push(newMsg);
        } else if (userList[friend_key].userType == 2 && userList[friend_key].checkOwnId==false) {
            bytes32 chatCode = _getChatCode(friend_key, friend_key);
            message memory newMsg = message(msg.sender, block.timestamp, _msg);
            allMessages[chatCode].push(newMsg);
        }  else if (userList[friend_key].userType == 2 && userList[friend_key].checkOwnId==true) {
            IERC20 token = IERC20(friend_key);
            require(token.balanceOf(msg.sender)>0, "You do not have enough asset to send message in this group");
            bytes32 chatCode = _getChatCode(friend_key, friend_key);
            message memory newMsg = message(msg.sender, block.timestamp, _msg);
            allMessages[chatCode].push(newMsg);
        }
    }

    // Returns all the chat messages communicated in a channel
    function readMessage(address friend_key) external view returns(message[] memory) {
        if (userList[friend_key].userType == 1) {
            bytes32 chatCode = _getChatCode(msg.sender, friend_key);
            return allMessages[chatCode];
        } else {
            bytes32 chatCode = _getChatCode(friend_key, friend_key);
            return allMessages[chatCode];
        }
    }
    
    // Returns all the users in our system
    function viewAllUsers() external view returns(user[] memory) {
        return allUsers;
    }

    // View a specific user
    function viewUser(address userAddress) external view returns(user memory) {
        return userList[userAddress];
    }
}