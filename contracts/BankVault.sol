// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./interfaces/IERC20Minimal.sol";

/// @title BankVault
/// @notice Prototype bank-like vault for ChainTrace receivable financing.
/// @dev The vault does not assess real-world risk by itself. It relies on approved loan contracts and off-chain/legal/KYC processes.
contract BankVault {
    struct CreditLine {
        uint256 limit;
        uint256 outstanding;
        bool enabled;
    }

    address public owner;
    address public riskOfficer;
    mapping(address => bool) public supportedAssets;
    mapping(address => bool) public approvedLoanContracts;
    mapping(address => mapping(address => CreditLine)) public creditLines; // borrower => asset => credit line

    event OwnerTransferred(address indexed oldOwner, address indexed newOwner);
    event RiskOfficerSet(address indexed riskOfficer);
    event AssetSupported(address indexed asset, bool supported);
    event LoanContractApproved(address indexed loanContract, bool approved);
    event LiquidityDeposited(address indexed asset, address indexed from, uint256 amount);
    event LiquidityWithdrawn(address indexed asset, address indexed to, uint256 amount);
    event CreditLineGranted(address indexed borrower, address indexed asset, uint256 limit);
    event LoanDisbursed(address indexed loanContract, address indexed borrower, address indexed asset, uint256 amount);
    event LoanRepaid(address indexed loanContract, address indexed borrower, address indexed asset, uint256 amount, uint256 remainingOutstanding);
    event LossReserved(address indexed borrower, address indexed asset, uint256 amount, string reason);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyRisk() {
        require(msg.sender == owner || msg.sender == riskOfficer, "NOT_RISK_OFFICER");
        _;
    }

    modifier onlyApprovedLoan() {
        require(approvedLoanContracts[msg.sender], "NOT_APPROVED_LOAN");
        _;
    }

    constructor(address initialRiskOfficer) {
        owner = msg.sender;
        riskOfficer = initialRiskOfficer == address(0) ? msg.sender : initialRiskOfficer;
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

    function setSupportedAsset(address asset, bool supported) external onlyOwner {
        require(asset != address(0), "ZERO_ASSET");
        supportedAssets[asset] = supported;
        emit AssetSupported(asset, supported);
    }

    function approveLoanContract(address loanContract, bool approved) external onlyOwner {
        require(loanContract != address(0), "ZERO_LOAN");
        approvedLoanContracts[loanContract] = approved;
        emit LoanContractApproved(loanContract, approved);
    }

    function depositLiquidity(address asset, uint256 amount) external {
        require(supportedAssets[asset], "UNSUPPORTED_ASSET");
        require(amount > 0, "ZERO_AMOUNT");
        require(IERC20Minimal(asset).transferFrom(msg.sender, address(this), amount), "TRANSFER_FAILED");
        emit LiquidityDeposited(asset, msg.sender, amount);
    }

    function withdrawLiquidity(address asset, address to, uint256 amount) external onlyOwner {
        require(supportedAssets[asset], "UNSUPPORTED_ASSET");
        require(to != address(0), "ZERO_TO");
        require(amount > 0, "ZERO_AMOUNT");
        require(IERC20Minimal(asset).transfer(to, amount), "TRANSFER_FAILED");
        emit LiquidityWithdrawn(asset, to, amount);
    }

    function grantCreditLine(address borrower, address asset, uint256 limit) external onlyRisk {
        require(borrower != address(0), "ZERO_BORROWER");
        require(supportedAssets[asset], "UNSUPPORTED_ASSET");
        CreditLine storage line = creditLines[borrower][asset];
        require(limit >= line.outstanding, "LIMIT_BELOW_OUTSTANDING");
        line.limit = limit;
        line.enabled = limit > 0;
        emit CreditLineGranted(borrower, asset, limit);
    }

    function availableCredit(address borrower, address asset) public view returns (uint256) {
        CreditLine memory line = creditLines[borrower][asset];
        if (!line.enabled || line.limit <= line.outstanding) return 0;
        return line.limit - line.outstanding;
    }

    function vaultBalance(address asset) external view returns (uint256) {
        return IERC20Minimal(asset).balanceOf(address(this));
    }

    function disburseLoan(address asset, address borrower, uint256 amount) external onlyApprovedLoan {
        require(supportedAssets[asset], "UNSUPPORTED_ASSET");
        require(borrower != address(0), "ZERO_BORROWER");
        require(amount > 0, "ZERO_AMOUNT");
        require(availableCredit(borrower, asset) >= amount, "INSUFFICIENT_CREDIT");

        CreditLine storage line = creditLines[borrower][asset];
        line.outstanding += amount;
        require(IERC20Minimal(asset).transfer(borrower, amount), "TRANSFER_FAILED");
        emit LoanDisbursed(msg.sender, borrower, asset, amount);
    }

    function recordRepayment(address asset, address borrower, uint256 amount) external onlyApprovedLoan {
        require(supportedAssets[asset], "UNSUPPORTED_ASSET");
        require(borrower != address(0), "ZERO_BORROWER");
        require(amount > 0, "ZERO_AMOUNT");
        CreditLine storage line = creditLines[borrower][asset];
        uint256 applied = amount > line.outstanding ? line.outstanding : amount;
        line.outstanding -= applied;
        emit LoanRepaid(msg.sender, borrower, asset, applied, line.outstanding);
    }

    function reserveLoss(address borrower, address asset, uint256 amount, string calldata reason) external onlyRisk {
        require(supportedAssets[asset], "UNSUPPORTED_ASSET");
        require(borrower != address(0), "ZERO_BORROWER");
        require(amount > 0, "ZERO_AMOUNT");
        CreditLine storage line = creditLines[borrower][asset];
        require(line.outstanding >= amount, "LOSS_GT_OUTSTANDING");
        line.outstanding -= amount;
        emit LossReserved(borrower, asset, amount, reason);
    }
}
