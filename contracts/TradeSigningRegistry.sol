// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title TradeSigningRegistry
/// @notice Stores four-flow signing/seal gates for one or many supply-chain trades.
/// @dev Raw files stay off-chain. The contract stores only hashes, signer roles, status, timestamps, and version numbers.
contract TradeSigningRegistry {
    enum SlotStatus {
        None,
        Pending,
        Signed,
        Blocked,
        Expired
    }

    enum FlowType {
        Commercial,
        Logistics,
        Funds,
        Information
    }

    struct SigningSlot {
        bytes32 tradeId;
        bytes32 slotId;
        FlowType flow;
        address requiredSigner;
        bytes32 roleHash;
        bytes32 documentHash;
        uint64 dueAt;
        uint32 version;
        SlotStatus status;
        uint64 signedAt;
        string uri;
    }

    address public owner;
    mapping(bytes32 => SigningSlot) private slots;
    mapping(bytes32 => bool) public slotExists;

    event OwnerTransferred(address indexed oldOwner, address indexed newOwner);
    event SlotCreated(bytes32 indexed tradeId, bytes32 indexed slotId, address indexed requiredSigner, FlowType flow, uint64 dueAt, string uri);
    event SlotSigned(bytes32 indexed tradeId, bytes32 indexed slotId, address indexed signer, bytes32 documentHash, uint32 version);
    event SlotBlocked(bytes32 indexed tradeId, bytes32 indexed slotId, string reason);
    event SlotExpired(bytes32 indexed tradeId, bytes32 indexed slotId);

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

    function createSlot(
        bytes32 tradeId,
        bytes32 slotId,
        FlowType flow,
        address requiredSigner,
        bytes32 roleHash,
        bytes32 documentHash,
        uint64 dueAt,
        string calldata uri
    ) external onlyOwner {
        require(tradeId != bytes32(0), "EMPTY_TRADE");
        require(slotId != bytes32(0), "EMPTY_SLOT");
        require(requiredSigner != address(0), "ZERO_SIGNER");
        require(!slotExists[slotId], "SLOT_EXISTS");

        slots[slotId] = SigningSlot({
            tradeId: tradeId,
            slotId: slotId,
            flow: flow,
            requiredSigner: requiredSigner,
            roleHash: roleHash,
            documentHash: documentHash,
            dueAt: dueAt,
            version: 1,
            status: SlotStatus.Pending,
            signedAt: 0,
            uri: uri
        });
        slotExists[slotId] = true;

        emit SlotCreated(tradeId, slotId, requiredSigner, flow, dueAt, uri);
    }

    function signSlot(bytes32 slotId, bytes32 documentHash, string calldata uri) external {
        require(slotExists[slotId], "UNKNOWN_SLOT");
        SigningSlot storage slot = slots[slotId];
        require(msg.sender == slot.requiredSigner, "NOT_REQUIRED_SIGNER");
        require(slot.status == SlotStatus.Pending || slot.status == SlotStatus.Blocked, "NOT_SIGNABLE");
        require(documentHash != bytes32(0), "EMPTY_DOCUMENT_HASH");
        require(slot.dueAt == 0 || block.timestamp <= slot.dueAt, "SLOT_EXPIRED");

        slot.documentHash = documentHash;
        slot.status = SlotStatus.Signed;
        slot.signedAt = uint64(block.timestamp);
        slot.version += 1;
        if (bytes(uri).length > 0) {
            slot.uri = uri;
        }

        emit SlotSigned(slot.tradeId, slotId, msg.sender, documentHash, slot.version);
    }

    function blockSlot(bytes32 slotId, string calldata reason) external onlyOwner {
        require(slotExists[slotId], "UNKNOWN_SLOT");
        SigningSlot storage slot = slots[slotId];
        require(slot.status != SlotStatus.Signed, "ALREADY_SIGNED");
        slot.status = SlotStatus.Blocked;
        slot.version += 1;
        emit SlotBlocked(slot.tradeId, slotId, reason);
    }

    function expireSlot(bytes32 slotId) external {
        require(slotExists[slotId], "UNKNOWN_SLOT");
        SigningSlot storage slot = slots[slotId];
        require(slot.status == SlotStatus.Pending || slot.status == SlotStatus.Blocked, "NOT_EXPIRABLE");
        require(slot.dueAt != 0 && block.timestamp > slot.dueAt, "NOT_EXPIRED");
        slot.status = SlotStatus.Expired;
        slot.version += 1;
        emit SlotExpired(slot.tradeId, slotId);
    }

    function getSlot(bytes32 slotId) external view returns (SigningSlot memory) {
        require(slotExists[slotId], "UNKNOWN_SLOT");
        return slots[slotId];
    }

    function isSigned(bytes32 slotId) external view returns (bool) {
        return slotExists[slotId] && slots[slotId].status == SlotStatus.Signed;
    }
}
