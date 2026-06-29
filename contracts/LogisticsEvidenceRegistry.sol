// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title LogisticsEvidenceRegistry
/// @notice Stores logistics evidence gates for ChainTrace trade financing.
/// @dev Raw files stay off-chain. The contract stores hashes, verifier roles, status, timestamps, and URIs.
contract LogisticsEvidenceRegistry {
    enum EvidenceStatus {
        None,
        Pending,
        Verified,
        Blocked,
        Rejected,
        Expired
    }

    enum EvidenceType {
        Container,
        Seal,
        Packing,
        VGM,
        ExportCustoms,
        BillOfLading,
        ImportPermit,
        WarehouseReceipt,
        QualityInspection,
        BuyerAcceptance,
        Other
    }

    struct EvidenceGate {
        bytes32 tradeId;
        bytes32 evidenceId;
        EvidenceType evidenceType;
        address requiredVerifier;
        bytes32 roleHash;
        bytes32 documentHash;
        uint64 dueAt;
        uint32 version;
        EvidenceStatus status;
        uint64 verifiedAt;
        string uri;
    }

    address public owner;
    mapping(bytes32 => EvidenceGate) private gates;
    mapping(bytes32 => bool) public gateExists;

    event OwnerTransferred(address indexed oldOwner, address indexed newOwner);
    event EvidenceGateCreated(bytes32 indexed tradeId, bytes32 indexed evidenceId, EvidenceType evidenceType, address indexed requiredVerifier, uint64 dueAt, string uri);
    event EvidenceVerified(bytes32 indexed tradeId, bytes32 indexed evidenceId, address indexed verifier, bytes32 documentHash, uint32 version);
    event EvidenceBlocked(bytes32 indexed tradeId, bytes32 indexed evidenceId, string reason);
    event EvidenceRejected(bytes32 indexed tradeId, bytes32 indexed evidenceId, string reason);
    event EvidenceExpired(bytes32 indexed tradeId, bytes32 indexed evidenceId);

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnerTransferred(address(0), msg.sender);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "ZERO_OWNER");
        emit OwnerTransferred(owner, newOwner);
        owner = newOwner;
    }

    function createGate(
        bytes32 tradeId,
        bytes32 evidenceId,
        EvidenceType evidenceType,
        address requiredVerifier,
        bytes32 roleHash,
        bytes32 documentHash,
        uint64 dueAt,
        string calldata uri
    ) external onlyOwner {
        require(tradeId != bytes32(0), "EMPTY_TRADE");
        require(evidenceId != bytes32(0), "EMPTY_EVIDENCE");
        require(requiredVerifier != address(0), "ZERO_VERIFIER");
        require(!gateExists[evidenceId], "GATE_EXISTS");

        gates[evidenceId] = EvidenceGate({
            tradeId: tradeId,
            evidenceId: evidenceId,
            evidenceType: evidenceType,
            requiredVerifier: requiredVerifier,
            roleHash: roleHash,
            documentHash: documentHash,
            dueAt: dueAt,
            version: 1,
            status: EvidenceStatus.Pending,
            verifiedAt: 0,
            uri: uri
        });
        gateExists[evidenceId] = true;

        emit EvidenceGateCreated(tradeId, evidenceId, evidenceType, requiredVerifier, dueAt, uri);
    }

    function verifyEvidence(bytes32 evidenceId, bytes32 documentHash, string calldata uri) external {
        require(gateExists[evidenceId], "UNKNOWN_EVIDENCE");
        EvidenceGate storage gate = gates[evidenceId];
        require(msg.sender == gate.requiredVerifier || msg.sender == owner, "NOT_REQUIRED_VERIFIER");
        require(gate.status == EvidenceStatus.Pending || gate.status == EvidenceStatus.Blocked, "NOT_VERIFIABLE");
        require(documentHash != bytes32(0), "EMPTY_DOCUMENT_HASH");
        require(gate.dueAt == 0 || block.timestamp <= gate.dueAt, "EVIDENCE_EXPIRED");

        gate.documentHash = documentHash;
        gate.status = EvidenceStatus.Verified;
        gate.verifiedAt = uint64(block.timestamp);
        gate.version += 1;
        if (bytes(uri).length > 0) {
            gate.uri = uri;
        }

        emit EvidenceVerified(gate.tradeId, evidenceId, msg.sender, documentHash, gate.version);
    }

    function blockEvidence(bytes32 evidenceId, string calldata reason) external onlyOwner {
        require(gateExists[evidenceId], "UNKNOWN_EVIDENCE");
        EvidenceGate storage gate = gates[evidenceId];
        require(gate.status != EvidenceStatus.Verified, "ALREADY_VERIFIED");
        gate.status = EvidenceStatus.Blocked;
        gate.version += 1;
        emit EvidenceBlocked(gate.tradeId, evidenceId, reason);
    }

    function rejectEvidence(bytes32 evidenceId, string calldata reason) external onlyOwner {
        require(gateExists[evidenceId], "UNKNOWN_EVIDENCE");
        EvidenceGate storage gate = gates[evidenceId];
        require(gate.status != EvidenceStatus.Verified, "ALREADY_VERIFIED");
        gate.status = EvidenceStatus.Rejected;
        gate.version += 1;
        emit EvidenceRejected(gate.tradeId, evidenceId, reason);
    }

    function expireEvidence(bytes32 evidenceId) external {
        require(gateExists[evidenceId], "UNKNOWN_EVIDENCE");
        EvidenceGate storage gate = gates[evidenceId];
        require(gate.status == EvidenceStatus.Pending || gate.status == EvidenceStatus.Blocked, "NOT_EXPIRABLE");
        require(gate.dueAt != 0 && block.timestamp > gate.dueAt, "NOT_EXPIRED");
        gate.status = EvidenceStatus.Expired;
        gate.version += 1;
        emit EvidenceExpired(gate.tradeId, evidenceId);
    }

    function getGate(bytes32 evidenceId) external view returns (EvidenceGate memory) {
        require(gateExists[evidenceId], "UNKNOWN_EVIDENCE");
        return gates[evidenceId];
    }

    function isVerified(bytes32 evidenceId) external view returns (bool) {
        return gateExists[evidenceId] && gates[evidenceId].status == EvidenceStatus.Verified;
    }
}
