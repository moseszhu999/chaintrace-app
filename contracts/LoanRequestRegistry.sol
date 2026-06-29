// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title LoanRequestRegistry
/// @notice Entry-point registry for SME receivable-financing requests before a concrete loan contract is created.
/// @dev This prototype records the financing intent, evidence-pack pointer, readiness score, and review status.
contract LoanRequestRegistry {
    enum RequestStatus {
        Draft,
        Submitted,
        PreReview,
        ReviewBlocked,
        Approved,
        Rejected,
        Cancelled,
        ConvertedToLoan
    }

    struct LoanRequest {
        bytes32 tradeId;
        address requester;
        address borrower;
        address beneficiary;
        address asset;
        uint256 receivableAmount;
        uint256 requestedAdvance;
        uint16 readinessScore;
        uint16 maxScore;
        uint64 createdAt;
        uint64 updatedAt;
        RequestStatus status;
        string evidencePackURI;
        bytes32 evidencePackHash;
        string blockerCode;
    }

    address public owner;
    uint256 public requestNonce;

    mapping(bytes32 => LoanRequest) private requests;
    mapping(address => bytes32[]) private requestIdsByRequester;

    event LoanRequestSubmitted(
        bytes32 indexed requestId,
        bytes32 indexed tradeId,
        address indexed requester,
        address borrower,
        address beneficiary,
        address asset,
        uint256 receivableAmount,
        uint256 requestedAdvance,
        uint16 readinessScore,
        uint16 maxScore,
        RequestStatus status,
        string blockerCode
    );
    event LoanRequestStatusChanged(bytes32 indexed requestId, RequestStatus oldStatus, RequestStatus newStatus, string blockerCode);
    event LoanRequestEvidencePackUpdated(bytes32 indexed requestId, string evidencePackURI, bytes32 evidencePackHash);
    event LoanRequestConverted(bytes32 indexed requestId, address indexed loanContract);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyRequesterOrOwner(bytes32 requestId) {
        require(msg.sender == requests[requestId].requester || msg.sender == owner, "NOT_REQUESTER_OR_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function submitPreReviewRequest(
        bytes32 tradeId,
        address borrower,
        address beneficiary,
        address asset,
        uint256 receivableAmount,
        uint256 requestedAdvance,
        uint16 readinessScore,
        uint16 maxScore,
        string calldata evidencePackURI,
        bytes32 evidencePackHash,
        string calldata blockerCode
    ) external returns (bytes32 requestId) {
        require(tradeId != bytes32(0), "ZERO_TRADE");
        require(borrower != address(0), "ZERO_BORROWER");
        require(beneficiary != address(0), "ZERO_BENEFICIARY");
        require(asset != address(0), "ZERO_ASSET");
        require(receivableAmount > 0, "ZERO_RECEIVABLE");
        require(requestedAdvance > 0, "ZERO_ADVANCE");
        require(requestedAdvance <= receivableAmount, "ADVANCE_TOO_HIGH");
        require(maxScore > 0, "ZERO_MAX_SCORE");
        require(readinessScore <= maxScore, "BAD_SCORE");
        require(bytes(evidencePackURI).length > 0 || evidencePackHash != bytes32(0), "NO_EVIDENCE_PACK");

        requestNonce += 1;
        requestId = keccak256(abi.encodePacked(block.chainid, address(this), msg.sender, tradeId, requestNonce));
        uint64 nowTs = uint64(block.timestamp);

        requests[requestId] = LoanRequest({
            tradeId: tradeId,
            requester: msg.sender,
            borrower: borrower,
            beneficiary: beneficiary,
            asset: asset,
            receivableAmount: receivableAmount,
            requestedAdvance: requestedAdvance,
            readinessScore: readinessScore,
            maxScore: maxScore,
            createdAt: nowTs,
            updatedAt: nowTs,
            status: RequestStatus.PreReview,
            evidencePackURI: evidencePackURI,
            evidencePackHash: evidencePackHash,
            blockerCode: blockerCode
        });
        requestIdsByRequester[msg.sender].push(requestId);

        emit LoanRequestSubmitted(
            requestId,
            tradeId,
            msg.sender,
            borrower,
            beneficiary,
            asset,
            receivableAmount,
            requestedAdvance,
            readinessScore,
            maxScore,
            RequestStatus.PreReview,
            blockerCode
        );
    }

    function getRequest(bytes32 requestId) external view returns (LoanRequest memory) {
        require(requests[requestId].requester != address(0), "UNKNOWN_REQUEST");
        return requests[requestId];
    }

    function getRequesterRequestIds(address requester) external view returns (bytes32[] memory) {
        return requestIdsByRequester[requester];
    }

    function updateEvidencePack(
        bytes32 requestId,
        string calldata evidencePackURI,
        bytes32 evidencePackHash
    ) external onlyRequesterOrOwner(requestId) {
        require(requests[requestId].requester != address(0), "UNKNOWN_REQUEST");
        require(bytes(evidencePackURI).length > 0 || evidencePackHash != bytes32(0), "NO_EVIDENCE_PACK");
        LoanRequest storage loanRequest = requests[requestId];
        require(
            loanRequest.status == RequestStatus.PreReview || loanRequest.status == RequestStatus.ReviewBlocked,
            "BAD_STATUS"
        );

        loanRequest.evidencePackURI = evidencePackURI;
        loanRequest.evidencePackHash = evidencePackHash;
        loanRequest.updatedAt = uint64(block.timestamp);
        emit LoanRequestEvidencePackUpdated(requestId, evidencePackURI, evidencePackHash);
    }

    function setReviewStatus(
        bytes32 requestId,
        RequestStatus newStatus,
        string calldata blockerCode
    ) external onlyOwner {
        require(requests[requestId].requester != address(0), "UNKNOWN_REQUEST");
        require(
            newStatus == RequestStatus.PreReview ||
                newStatus == RequestStatus.ReviewBlocked ||
                newStatus == RequestStatus.Approved ||
                newStatus == RequestStatus.Rejected,
            "BAD_REVIEW_STATUS"
        );
        LoanRequest storage loanRequest = requests[requestId];
        RequestStatus oldStatus = loanRequest.status;
        loanRequest.status = newStatus;
        loanRequest.blockerCode = blockerCode;
        loanRequest.updatedAt = uint64(block.timestamp);
        emit LoanRequestStatusChanged(requestId, oldStatus, newStatus, blockerCode);
    }

    function convertToLoan(bytes32 requestId, address loanContract) external onlyOwner {
        require(requests[requestId].requester != address(0), "UNKNOWN_REQUEST");
        require(loanContract != address(0), "ZERO_LOAN");
        LoanRequest storage loanRequest = requests[requestId];
        require(loanRequest.status == RequestStatus.Approved, "NOT_APPROVED");
        RequestStatus oldStatus = loanRequest.status;
        loanRequest.status = RequestStatus.ConvertedToLoan;
        loanRequest.updatedAt = uint64(block.timestamp);
        emit LoanRequestStatusChanged(requestId, oldStatus, RequestStatus.ConvertedToLoan, "");
        emit LoanRequestConverted(requestId, loanContract);
    }

    function cancel(bytes32 requestId, string calldata reason) external onlyRequesterOrOwner(requestId) {
        require(requests[requestId].requester != address(0), "UNKNOWN_REQUEST");
        LoanRequest storage loanRequest = requests[requestId];
        require(
            loanRequest.status == RequestStatus.PreReview || loanRequest.status == RequestStatus.ReviewBlocked,
            "NOT_CANCELLABLE"
        );
        RequestStatus oldStatus = loanRequest.status;
        loanRequest.status = RequestStatus.Cancelled;
        loanRequest.blockerCode = reason;
        loanRequest.updatedAt = uint64(block.timestamp);
        emit LoanRequestStatusChanged(requestId, oldStatus, RequestStatus.Cancelled, reason);
    }
}
