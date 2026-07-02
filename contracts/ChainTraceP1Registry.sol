// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract ChainTraceP1Registry {
    enum Role {
        NONE,
        EXPORTER,
        BUYER,
        LOGISTICS,
        INSPECTOR,
        BANK,
        OPERATOR,
        AUDITOR
    }

    enum DocumentKind {
        PO,
        INVOICE,
        PACKING_LIST,
        BILL_OF_LADING,
        INSPECTION_REPORT,
        OTHER
    }

    enum CaseState {
        DRAFT_INTENT,
        PRE_REVIEW,
        PROOF_COLLECTED,
        GATES_NOT_PASSED
    }

    struct TradeCase {
        address creator;
        bytes32 caseCommitment;
        CaseState state;
        bool exists;
    }

    struct DocumentProof {
        bytes32 documentHash;
        bytes32 metadataHash;
        DocumentKind kind;
        address submitter;
        uint256 timestamp;
    }

    mapping(address => Role) public roles;
    mapping(bytes32 => TradeCase) public cases;
    mapping(bytes32 => DocumentProof[]) private documentProofs;
    mapping(bytes32 => mapping(bytes32 => bool)) public gateEvaluations;

    event RoleRegistered(address indexed wallet, Role role);
    event CaseCreated(bytes32 indexed caseId, address indexed creator, bytes32 caseCommitment);
    event DocumentProofAdded(
        bytes32 indexed caseId,
        bytes32 documentHash,
        bytes32 metadataHash,
        DocumentKind kind
    );
    event GateEvaluated(bytes32 indexed caseId, bytes32 gateHash, bool passed);
    event CaseStateTransitioned(bytes32 indexed caseId, CaseState fromState, CaseState toState);

    error RoleAlreadyRegistered();
    error RoleRequired();
    error ExporterRoleRequired();
    error CaseNotFound();
    error InvalidCaseState();
    error FundingExecutionForbidden();

    function registerRole(Role role) external {
        if (roles[msg.sender] != Role.NONE) {
            revert RoleAlreadyRegistered();
        }
        if (role == Role.NONE) {
            revert RoleRequired();
        }

        roles[msg.sender] = role;
        emit RoleRegistered(msg.sender, role);
    }

    function createCase(bytes32 caseCommitment) external returns (bytes32 caseId) {
        if (roles[msg.sender] != Role.EXPORTER) {
            revert ExporterRoleRequired();
        }

        caseId = keccak256(abi.encodePacked(msg.sender, caseCommitment, block.chainid, block.number));
        cases[caseId] = TradeCase({
            creator: msg.sender,
            caseCommitment: caseCommitment,
            state: CaseState.DRAFT_INTENT,
            exists: true
        });

        emit CaseCreated(caseId, msg.sender, caseCommitment);
    }

    function addDocumentProof(
        bytes32 caseId,
        bytes32 documentHash,
        bytes32 metadataHash,
        DocumentKind kind
    ) external {
        if (roles[msg.sender] == Role.NONE) {
            revert RoleRequired();
        }
        if (!cases[caseId].exists) {
            revert CaseNotFound();
        }

        documentProofs[caseId].push(DocumentProof({
            documentHash: documentHash,
            metadataHash: metadataHash,
            kind: kind,
            submitter: msg.sender,
            timestamp: block.timestamp
        }));

        emit DocumentProofAdded(caseId, documentHash, metadataHash, kind);
    }

    function recordGateEvaluation(bytes32 caseId, bytes32 gateHash, bool passed) external {
        if (roles[msg.sender] == Role.NONE) {
            revert RoleRequired();
        }
        if (!cases[caseId].exists) {
            revert CaseNotFound();
        }
        if (passed && gateHash == fundingExecutionGateHash()) {
            revert FundingExecutionForbidden();
        }

        gateEvaluations[caseId][gateHash] = passed;
        emit GateEvaluated(caseId, gateHash, passed);
    }

    function transitionCaseState(bytes32 caseId, CaseState nextState) external {
        if (roles[msg.sender] == Role.NONE) {
            revert RoleRequired();
        }
        if (!cases[caseId].exists) {
            revert CaseNotFound();
        }
        if (uint8(nextState) > uint8(CaseState.GATES_NOT_PASSED)) {
            revert InvalidCaseState();
        }

        CaseState fromState = cases[caseId].state;
        cases[caseId].state = nextState;
        emit CaseStateTransitioned(caseId, fromState, nextState);
    }

    function disbursementAllowed(bytes32) external pure returns (bool) {
        return false;
    }

    function getDocumentProofCount(bytes32 caseId) external view returns (uint256) {
        return documentProofs[caseId].length;
    }

    function getDocumentProof(bytes32 caseId, uint256 index) external view returns (DocumentProof memory) {
        return documentProofs[caseId][index];
    }

    function fundingExecutionGateHash() public pure returns (bytes32) {
        return keccak256("FUNDING_EXECUTION_GATE");
    }
}
