// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./BankVault.sol";
import "./interfaces/IERC20Minimal.sol";

interface ITradeSigningRegistry {
    function isSigned(bytes32 slotId) external view returns (bool);
}

interface ILogisticsEvidenceRegistry {
    function isVerified(bytes32 evidenceId) external view returns (bool);
}

/// @title ReceivableLoan
/// @notice Prototype receivable financing loan contract.
/// @dev It gates USDC disbursement by reading signing slots and logistics evidence gates.
contract ReceivableLoan {
    enum LoanStatus {
        Draft,
        Gated,
        Ready,
        Disbursed,
        Repaid,
        Defaulted,
        Cancelled
    }

    struct LoanTerms {
        bytes32 tradeId;
        address asset;
        address borrower;
        address financier;
        uint256 receivableAmount;
        uint256 principal;
        uint256 fee;
        uint64 maturityAt;
        bytes32[] requiredSigningSlots;
        bytes32[] requiredLogisticsEvidence;
    }

    address public owner;
    BankVault public immutable bankVault;
    ITradeSigningRegistry public immutable signingRegistry;
    ILogisticsEvidenceRegistry public immutable logisticsRegistry;
    LoanTerms public terms;
    LoanStatus public status;
    uint256 public repaidAmount;

    event LoanStatusChanged(LoanStatus oldStatus, LoanStatus newStatus);
    event GatesChecked(uint256 passed, uint256 total, bool allPassed);
    event SigningGatesChecked(uint256 passed, uint256 total, bool allPassed);
    event LogisticsGatesChecked(uint256 passed, uint256 total, bool allPassed);
    event Disbursed(address indexed borrower, uint256 principal);
    event Repaid(address indexed payer, uint256 amount, uint256 totalRepaid);
    event Defaulted(string reason);
    event Cancelled(string reason);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyFinancierOrOwner() {
        require(msg.sender == terms.financier || msg.sender == owner, "NOT_FINANCIER_OR_OWNER");
        _;
    }

    constructor(
        address bankVault_,
        address signingRegistry_,
        address logisticsRegistry_,
        bytes32 tradeId,
        address asset,
        address borrower,
        address financier,
        uint256 receivableAmount,
        uint256 principal,
        uint256 fee,
        uint64 maturityAt,
        bytes32[] memory requiredSigningSlots,
        bytes32[] memory requiredLogisticsEvidence
    ) {
        require(bankVault_ != address(0), "ZERO_BANK");
        require(signingRegistry_ != address(0), "ZERO_REGISTRY");
        require(logisticsRegistry_ != address(0), "ZERO_LOGISTICS_REGISTRY");
        require(asset != address(0), "ZERO_ASSET");
        require(borrower != address(0), "ZERO_BORROWER");
        require(financier != address(0), "ZERO_FINANCIER");
        require(principal > 0, "ZERO_PRINCIPAL");
        require(receivableAmount >= principal + fee, "BAD_TERMS");
        require(requiredSigningSlots.length + requiredLogisticsEvidence.length > 0, "NO_GATES");

        owner = msg.sender;
        bankVault = BankVault(bankVault_);
        signingRegistry = ITradeSigningRegistry(signingRegistry_);
        logisticsRegistry = ILogisticsEvidenceRegistry(logisticsRegistry_);
        terms = LoanTerms({
            tradeId: tradeId,
            asset: asset,
            borrower: borrower,
            financier: financier,
            receivableAmount: receivableAmount,
            principal: principal,
            fee: fee,
            maturityAt: maturityAt,
            requiredSigningSlots: requiredSigningSlots,
            requiredLogisticsEvidence: requiredLogisticsEvidence
        });
        status = LoanStatus.Gated;
        emit LoanStatusChanged(LoanStatus.Draft, LoanStatus.Gated);
    }

    function requiredRepayment() public view returns (uint256) {
        return terms.principal + terms.fee;
    }

    function gateCount() external view returns (uint256) {
        return terms.requiredSigningSlots.length + terms.requiredLogisticsEvidence.length;
    }

    function signingGateCount() external view returns (uint256) {
        return terms.requiredSigningSlots.length;
    }

    function logisticsGateCount() external view returns (uint256) {
        return terms.requiredLogisticsEvidence.length;
    }

    function checkSigningGates() public view returns (uint256 passed, uint256 total, bool allPassed) {
        total = terms.requiredSigningSlots.length;
        for (uint256 i = 0; i < total; i += 1) {
            if (signingRegistry.isSigned(terms.requiredSigningSlots[i])) {
                passed += 1;
            }
        }
        allPassed = passed == total;
    }

    function checkLogisticsGates() public view returns (uint256 passed, uint256 total, bool allPassed) {
        total = terms.requiredLogisticsEvidence.length;
        for (uint256 i = 0; i < total; i += 1) {
            if (logisticsRegistry.isVerified(terms.requiredLogisticsEvidence[i])) {
                passed += 1;
            }
        }
        allPassed = passed == total;
    }

    function checkGates() public view returns (uint256 passed, uint256 total, bool allPassed) {
        (uint256 signingPassed, uint256 signingTotal, ) = checkSigningGates();
        (uint256 logisticsPassed, uint256 logisticsTotal, ) = checkLogisticsGates();
        passed = signingPassed + logisticsPassed;
        total = signingTotal + logisticsTotal;
        allPassed = passed == total;
    }

    function refreshReadiness() public returns (bool ready) {
        (uint256 signingPassed, uint256 signingTotal, bool signingAllPassed) = checkSigningGates();
        (uint256 logisticsPassed, uint256 logisticsTotal, bool logisticsAllPassed) = checkLogisticsGates();
        uint256 passed = signingPassed + logisticsPassed;
        uint256 total = signingTotal + logisticsTotal;
        bool allPassed = signingAllPassed && logisticsAllPassed;

        emit SigningGatesChecked(signingPassed, signingTotal, signingAllPassed);
        emit LogisticsGatesChecked(logisticsPassed, logisticsTotal, logisticsAllPassed);
        emit GatesChecked(passed, total, allPassed);

        if (allPassed && status == LoanStatus.Gated) {
            _setStatus(LoanStatus.Ready);
            return true;
        }
        return allPassed;
    }

    function disburse() external onlyFinancierOrOwner {
        require(status == LoanStatus.Gated || status == LoanStatus.Ready, "BAD_STATUS");
        require(refreshReadiness(), "GATES_NOT_PASSED");
        bankVault.disburseLoan(terms.asset, terms.borrower, terms.principal);
        _setStatus(LoanStatus.Disbursed);
        emit Disbursed(terms.borrower, terms.principal);
    }

    function repay(uint256 amount) external {
        require(status == LoanStatus.Disbursed, "NOT_DISBURSED");
        require(amount > 0, "ZERO_AMOUNT");
        require(IERC20Minimal(terms.asset).transferFrom(msg.sender, address(bankVault), amount), "TRANSFER_FAILED");
        repaidAmount += amount;
        bankVault.recordRepayment(terms.asset, terms.borrower, amount);
        emit Repaid(msg.sender, amount, repaidAmount);

        if (repaidAmount >= requiredRepayment()) {
            _setStatus(LoanStatus.Repaid);
        }
    }

    function markDefault(string calldata reason) external onlyFinancierOrOwner {
        require(status == LoanStatus.Disbursed, "NOT_DISBURSED");
        require(block.timestamp > terms.maturityAt, "NOT_MATURED");
        _setStatus(LoanStatus.Defaulted);
        emit Defaulted(reason);
    }

    function cancel(string calldata reason) external onlyOwner {
        require(status == LoanStatus.Gated || status == LoanStatus.Ready, "NOT_CANCELLABLE");
        _setStatus(LoanStatus.Cancelled);
        emit Cancelled(reason);
    }

    function _setStatus(LoanStatus newStatus) internal {
        LoanStatus old = status;
        status = newStatus;
        emit LoanStatusChanged(old, newStatus);
    }
}
