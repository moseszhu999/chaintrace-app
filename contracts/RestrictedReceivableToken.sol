// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title RestrictedReceivableToken
/// @notice Minimal restricted token for receivable-backed RWA representation.
/// @dev Prototype only. Not a public ERC20 offering. Whitelisted transfer, freeze, redemption, and maturity burn are built in.
contract RestrictedReceivableToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 6;
    address public owner;
    address public issuer;
    bytes32 public tradeId;
    bytes32 public receivableHash;
    bool public transfersPaused;
    bool public redeemed;

    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => bool) public whitelist;
    mapping(address => bool) public frozen;

    event OwnerTransferred(address indexed oldOwner, address indexed newOwner);
    event WhitelistSet(address indexed account, bool allowed);
    event FrozenSet(address indexed account, bool frozen);
    event TransfersPaused(bool paused);
    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);
    event Minted(address indexed to, uint256 amount, bytes32 tradeId, bytes32 receivableHash);
    event Redeemed(address indexed by, string reason);
    event MaturedAndBurned(address indexed from, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyWhitelisted(address account) {
        require(whitelist[account], "NOT_WHITELISTED");
        require(!frozen[account], "FROZEN");
        _;
    }

    constructor(string memory name_, string memory symbol_, address issuer_, bytes32 tradeId_, bytes32 receivableHash_) {
        require(issuer_ != address(0), "ZERO_ISSUER");
        name = name_;
        symbol = symbol_;
        owner = msg.sender;
        issuer = issuer_;
        tradeId = tradeId_;
        receivableHash = receivableHash_;
        whitelist[msg.sender] = true;
        whitelist[issuer_] = true;
        emit OwnerTransferred(address(0), msg.sender);
        emit WhitelistSet(msg.sender, true);
        emit WhitelistSet(issuer_, true);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ZERO_OWNER");
        emit OwnerTransferred(owner, newOwner);
        owner = newOwner;
        whitelist[newOwner] = true;
        emit WhitelistSet(newOwner, true);
    }

    function setWhitelist(address account, bool allowed) external onlyOwner {
        require(account != address(0), "ZERO_ACCOUNT");
        whitelist[account] = allowed;
        emit WhitelistSet(account, allowed);
    }

    function setFrozen(address account, bool frozen_) external onlyOwner {
        frozen[account] = frozen_;
        emit FrozenSet(account, frozen_);
    }

    function pauseTransfers(bool paused) external onlyOwner {
        transfersPaused = paused;
        emit TransfersPaused(paused);
    }

    function mint(address to, uint256 amount) external onlyOwner onlyWhitelisted(to) {
        require(!redeemed, "REDEEMED");
        require(amount > 0, "ZERO_AMOUNT");
        totalSupply += amount;
        balanceOf[to] += amount;
        emit Minted(to, amount, tradeId, receivableHash);
        emit Transfer(address(0), to, amount);
    }

    function approve(address spender, uint256 amount) external onlyWhitelisted(msg.sender) onlyWhitelisted(spender) returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        require(allowed >= amount, "ALLOWANCE_LOW");
        allowance[from][msg.sender] = allowed - amount;
        _transfer(from, to, amount);
        return true;
    }

    function redeem(string calldata reason) external onlyOwner {
        require(!redeemed, "ALREADY_REDEEMED");
        redeemed = true;
        transfersPaused = true;
        emit Redeemed(msg.sender, reason);
        emit TransfersPaused(true);
    }

    function burnAtMaturity(address from, uint256 amount) external onlyOwner {
        require(redeemed, "NOT_REDEEMED");
        require(balanceOf[from] >= amount, "BALANCE_LOW");
        balanceOf[from] -= amount;
        totalSupply -= amount;
        emit MaturedAndBurned(from, amount);
        emit Transfer(from, address(0), amount);
    }

    function _transfer(address from, address to, uint256 amount) internal onlyWhitelisted(from) onlyWhitelisted(to) {
        require(!transfersPaused, "TRANSFERS_PAUSED");
        require(!redeemed, "REDEEMED");
        require(amount > 0, "ZERO_AMOUNT");
        require(balanceOf[from] >= amount, "BALANCE_LOW");
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
    }
}
