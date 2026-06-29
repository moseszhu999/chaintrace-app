// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./BankVault.sol";
import "./interfaces/IERC20Minimal.sol";

/// @title FinancierPool
/// @notice Prototype lender-side liquidity pool for ChainTrace receivable financing.
/// @dev This is not a public investment product. It models whitelisted/controlled financiers providing liquidity to a BankVault.
contract FinancierPool {
    address public owner;
    address public riskOfficer;
    BankVault public immutable bankVault;
    address public immutable asset;

    uint256 public totalShares;
    uint256 public totalDeposited;
    uint256 public totalFundedToVault;
    mapping(address => uint256) public sharesOf;

    event OwnerTransferred(address indexed oldOwner, address indexed newOwner);
    event RiskOfficerSet(address indexed riskOfficer);
    event Deposited(address indexed financier, uint256 amount, uint256 sharesMinted);
    event IdleRedeemed(address indexed financier, uint256 sharesBurned, uint256 amount);
    event VaultFunded(address indexed asset, uint256 amount);
    event VaultLiquidityWithdrawn(address indexed asset, uint256 amount);
    event AssetConfigured(address indexed asset, bool supported);
    event LoanContractApproved(address indexed loanContract, bool approved);
    event CreditLineGranted(address indexed borrower, address indexed asset, uint256 limit);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyRisk() {
        require(msg.sender == owner || msg.sender == riskOfficer, "NOT_RISK_OFFICER");
        _;
    }

    constructor(address bankVault_, address asset_, address initialRiskOfficer) {
        require(bankVault_ != address(0), "ZERO_BANK");
        require(asset_ != address(0), "ZERO_ASSET");
        owner = msg.sender;
        riskOfficer = initialRiskOfficer == address(0) ? msg.sender : initialRiskOfficer;
        bankVault = BankVault(bankVault_);
        asset = asset_;
        emit OwnerTransferred(address(0), msg.sender);
        emit RiskOfficerSet(riskOfficer);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ZERO_OWNER");
        emit OwnerTransferred(owner, newOwner);
        owner = newOwner;
    }

    function setRiskOfficer(address newRiskOfficer) external onlyOwner {
        require(newRiskOfficer != address(0), "ZERO_RISK_OFFICER");
        riskOfficer = newRiskOfficer;
        emit RiskOfficerSet(newRiskOfficer);
    }

    function idleBalance() public view returns (uint256) {
        return IERC20Minimal(asset).balanceOf(address(this));
    }

    function deposit(uint256 amount) external {
        require(amount > 0, "ZERO_AMOUNT");
        require(IERC20Minimal(asset).transferFrom(msg.sender, address(this), amount), "TRANSFER_FAILED");
        sharesOf[msg.sender] += amount;
        totalShares += amount;
        totalDeposited += amount;
        emit Deposited(msg.sender, amount, amount);
    }

    /// @notice Redeems only idle pool liquidity held by this pool, not funds already sent to BankVault.
    function redeemIdle(uint256 shares) external {
        require(shares > 0, "ZERO_SHARES");
        require(sharesOf[msg.sender] >= shares, "SHARES_LOW");
        require(idleBalance() >= shares, "IDLE_LIQUIDITY_LOW");
        sharesOf[msg.sender] -= shares;
        totalShares -= shares;
        require(IERC20Minimal(asset).transfer(msg.sender, shares), "TRANSFER_FAILED");
        emit IdleRedeemed(msg.sender, shares, shares);
    }

    /// @notice Configures BankVault support for this pool asset. Requires this pool to own the BankVault.
    function configureSupportedAsset(bool supported) external onlyRisk {
        bankVault.setSupportedAsset(asset, supported);
        emit AssetConfigured(asset, supported);
    }

    /// @notice Moves idle pool liquidity into BankVault for approved receivable loans.
    function fundVault(uint256 amount) external onlyRisk {
        require(amount > 0, "ZERO_AMOUNT");
        require(idleBalance() >= amount, "IDLE_LIQUIDITY_LOW");
        require(IERC20Minimal(asset).approve(address(bankVault), amount), "APPROVE_FAILED");
        bankVault.depositLiquidity(asset, amount);
        totalFundedToVault += amount;
        emit VaultFunded(asset, amount);
    }

    /// @notice Pulls unused liquidity back from BankVault into the pool. Requires this pool to own the BankVault.
    function withdrawVaultLiquidity(uint256 amount) external onlyRisk {
        require(amount > 0, "ZERO_AMOUNT");
        bankVault.withdrawLiquidity(asset, address(this), amount);
        if (amount >= totalFundedToVault) {
            totalFundedToVault = 0;
        } else {
            totalFundedToVault -= amount;
        }
        emit VaultLiquidityWithdrawn(asset, amount);
    }

    function approveLoanContract(address loanContract, bool approved) external onlyRisk {
        bankVault.approveLoanContract(loanContract, approved);
        emit LoanContractApproved(loanContract, approved);
    }

    function grantCreditLine(address borrower, uint256 limit) external onlyRisk {
        bankVault.grantCreditLine(borrower, asset, limit);
        emit CreditLineGranted(borrower, asset, limit);
    }
}
