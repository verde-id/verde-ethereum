pragma solidity ^0.4.17;

import './User.sol';
import './Condition.sol';

contract UserDirectory {

  struct Users {
    mapping(string => User) users;
  }

  mapping (string => Users) private _users;
  uint public userCount;

  event LogNewUser(string namespace, string id, address userContract);

  function UserDirectory() public {
    userCount = 0;
  }

  function newUser(
    address _owner,
    string _namespace,
    string _id
  ) 
    public
  {
    User user = new User();
    Condition condition = new Condition(1);
    user.newUser(_owner, _namespace, _id);
    user.setConditionContractAddress(condition);
    _users[_namespace].users[_id] = user;
    userCount++;
    // Create new user event.
    LogNewUser(_namespace, _id, user); 
  }

  function findUserByNamespaceAndId(
    string _namespace,
    string _id
  ) public view returns (address user) {
    user = _users[_namespace].users[_id];
  }

}
