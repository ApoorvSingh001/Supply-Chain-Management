pragma solidity ^0.5.0;

// Import the library 'Roles'
import "./Roles.sol";

// Define a contract 'AdministratorRole' to manage this role - add, remove, check
contract Administrator {
  using Roles for Roles.Role;

  // Define 2 events, one for Adding, and other for Removing
  event AdministratorAdded(address indexed account);
  event AdministratorRemoved(address indexed account);

  // Define a struct 'administrators' by inheriting from 'Roles' library, struct Role
  Roles.Role private administrators;

  // In the constructor make the address that deploys this contract the 1st farmer
  constructor() public {
    _addAdministrator(msg.sender);
  }

  // Define a modifier that checks to see if msg.sender has the appropriate role
  modifier onlyAdministrator() {
    require(isAdministrator(msg.sender));
    _;
  }

  // Define a function 'isAdministrator' to check this role
  function isAdministrator(address account) public view returns (bool) {
    return administrators.has(account);
  }

  // Define a function 'addAdministrator' that adds this role
  function addAdministrator(address account) public onlyAdministrator {
    _addAdministrator(account);
  }

  // Define a function 'renounceAdministrator' to renounce this role
  function renounceAdministrator() public {
    _removeAdministrator(msg.sender);
  }

  // Define an internal function '_addAdministrator' to add this role, called by 'addAdministrator'
  function _addAdministrator(address account) internal {
    administrators.add(account);
    emit AdministratorAdded(account);
  }

  // Define an internal function '_removeAdministrator' to remove this role, called by 'removeAdministrator'
  function _removeAdministrator(address account) internal {
    administrators.remove(account);
    emit AdministratorRemoved(account);
  }
}
