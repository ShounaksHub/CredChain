// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ProofIDRegistry
/// @author ProofID
/// @notice On-chain registry that anchors a lightweight, verifiable pointer
///         to each student's off-chain ProofID profile.
/// @dev Only essential identity fields and a SHA-256 profile hash are
///      stored on-chain. The full profile (bio, projects, achievements,
///      socials, etc.) lives off-chain and is committed to via
///      `profileHash`, so any tampering with the off-chain data can be
///      detected by re-hashing and comparing against this contract.
contract ProofIDRegistry is Ownable {
    // ---------------------------------------------------------------------
    // Errors
    // ---------------------------------------------------------------------

    /// @notice Thrown when `msg.sender` already owns a profile.
    error ProfileAlreadyExists(address wallet);

    /// @notice Thrown when the caller has no profile but one is required.
    error ProfileDoesNotExist(address wallet);

    /// @notice Thrown when `fullName` is empty.
    error EmptyName();

    /// @notice Thrown when `university` is empty.
    error EmptyUniversity();

    /// @notice Thrown when `department` is empty.
    error EmptyDepartment();

    /// @notice Thrown when `graduationYear` is outside the sane bounds.
    error InvalidGraduationYear(uint16 graduationYear);

    /// @notice Thrown when `profileHash` is the zero hash.
    error InvalidProfileHash();

    /// @notice Thrown when someone other than the profile owner attempts
    ///         to modify a profile.
    error NotProfileOwner(address caller, address owner);

    // ---------------------------------------------------------------------
    // Storage
    // ---------------------------------------------------------------------

    /// @notice Earliest graduation year accepted, to reject garbage input.
    uint16 public constant MIN_GRADUATION_YEAR = 2000;

    /// @notice Latest graduation year accepted, to reject garbage input.
    uint16 public constant MAX_GRADUATION_YEAR = 2100;

    /// @notice On-chain student identity record.
    /// @dev Fields are ordered to pack tightly:
    ///      slot0: walletAddress (20 bytes) + graduationYear (2 bytes)
    ///             + isVerified (1 byte) + exists (1 byte) = 24 bytes.
    ///      slot1: fullName (string, dynamic).
    ///      slot2: university (string, dynamic).
    ///      slot3: department (string, dynamic).
    ///      slot4: profileHash (bytes32).
    ///      slot5: createdAt (uint40) + updatedAt (uint40) packed together.
    struct Student {
        address walletAddress;
        uint16 graduationYear;
        bool isVerified;
        bool exists;
        string fullName;
        string university;
        string department;
        bytes32 profileHash;
        uint40 createdAt;
        uint40 updatedAt;
    }

    /// @dev wallet => student profile.
    mapping(address => Student) private _students;

    /// @notice Total number of profiles ever created.
    uint256 public totalProfiles;

    // ---------------------------------------------------------------------
    // Events
    // ---------------------------------------------------------------------

    /// @notice Emitted when a new student profile is created.
    event ProfileCreated(
        address indexed wallet,
        string fullName,
        string university,
        bytes32 profileHash,
        uint40 createdAt
    );

    /// @notice Emitted when a student profile is updated by its owner.
    event ProfileUpdated(
        address indexed wallet,
        bytes32 profileHash,
        string department,
        uint16 graduationYear,
        uint40 updatedAt
    );

    /// @notice Emitted when the contract owner verifies a student.
    event StudentVerified(address indexed wallet, address indexed verifier, uint40 verifiedAt);

    /// @notice Emitted when the contract owner removes a student's verification.
    event VerificationRemoved(address indexed wallet, address indexed remover, uint40 removedAt);

    // ---------------------------------------------------------------------
    // Modifiers
    // ---------------------------------------------------------------------

    /// @dev Reverts if `msg.sender` does not own a profile.
    modifier onlyProfileOwner() {
        if (!_students[msg.sender].exists) revert ProfileDoesNotExist(msg.sender);
        _;
    }

    // ---------------------------------------------------------------------
    // Constructor
    // ---------------------------------------------------------------------

    /// @param initialOwner Address that will own the registry (able to
    ///        verify/unverify students).
    constructor(address initialOwner) Ownable(initialOwner) {}

    // ---------------------------------------------------------------------
    // Write functions
    // ---------------------------------------------------------------------

    /// @notice Creates the caller's student profile.
    /// @dev Each wallet may own exactly one profile; the profile cannot be
    ///      recreated or overwritten via this function once it exists.
    /// @param fullName Student's full name (must be non-empty).
    /// @param university Student's university (must be non-empty).
    /// @param department Student's department (must be non-empty).
    /// @param graduationYear Expected graduation year, bounded to a sane range.
    /// @param profileHash SHA-256 hash of the complete off-chain profile.
    function createProfile(
        string calldata fullName,
        string calldata university,
        string calldata department,
        uint16 graduationYear,
        bytes32 profileHash
    ) external {
        if (_students[msg.sender].exists) revert ProfileAlreadyExists(msg.sender);
        _validateProfileInputs(fullName, university, department, graduationYear, profileHash);

        uint40 timestamp = uint40(block.timestamp);

        _students[msg.sender] = Student({
            walletAddress: msg.sender,
            graduationYear: graduationYear,
            isVerified: false,
            exists: true,
            fullName: fullName,
            university: university,
            department: department,
            profileHash: profileHash,
            createdAt: timestamp,
            updatedAt: timestamp
        });

        unchecked {
            ++totalProfiles;
        }

        emit ProfileCreated(msg.sender, fullName, university, profileHash, timestamp);
    }

    /// @notice Updates the caller's existing profile.
    /// @dev Only `profileHash`, `department` and `graduationYear` are
    ///      mutable post-creation; `fullName` and `university` are treated
    ///      as immutable identity anchors and cannot be changed here.
    /// @param newProfileHash New SHA-256 hash of the off-chain profile.
    /// @param newDepartment Updated department.
    /// @param newGraduationYear Updated graduation year.
    function updateProfile(
        bytes32 newProfileHash,
        string calldata newDepartment,
        uint16 newGraduationYear
    ) external onlyProfileOwner {
        if (bytes(newDepartment).length == 0) revert EmptyDepartment();
        if (newGraduationYear < MIN_GRADUATION_YEAR || newGraduationYear > MAX_GRADUATION_YEAR) {
            revert InvalidGraduationYear(newGraduationYear);
        }
        if (newProfileHash == bytes32(0)) revert InvalidProfileHash();

        Student storage student = _students[msg.sender];
        uint40 timestamp = uint40(block.timestamp);

        student.profileHash = newProfileHash;
        student.department = newDepartment;
        student.graduationYear = newGraduationYear;
        student.updatedAt = timestamp;

        emit ProfileUpdated(msg.sender, newProfileHash, newDepartment, newGraduationYear, timestamp);
    }

    /// @notice Marks a student's profile as verified.
    /// @dev Only callable by the contract owner (e.g. a university admin
    ///      key or ProofID's verification service).
    /// @param wallet Address of the student to verify.
    function verifyStudent(address wallet) external onlyOwner {
        if (!_students[wallet].exists) revert ProfileDoesNotExist(wallet);

        _students[wallet].isVerified = true;

        emit StudentVerified(wallet, msg.sender, uint40(block.timestamp));
    }

    /// @notice Removes verification status from a student's profile.
    /// @dev Only callable by the contract owner.
    /// @param wallet Address of the student whose verification is revoked.
    function removeVerification(address wallet) external onlyOwner {
        if (!_students[wallet].exists) revert ProfileDoesNotExist(wallet);

        _students[wallet].isVerified = false;

        emit VerificationRemoved(wallet, msg.sender, uint40(block.timestamp));
    }

    // ---------------------------------------------------------------------
    // Read functions
    // ---------------------------------------------------------------------

    /// @notice Returns the full on-chain profile for a wallet.
    /// @param wallet Address to look up.
    /// @return wallet_ The student's wallet address.
    /// @return fullName The student's full name.
    /// @return university The student's university.
    /// @return department The student's department.
    /// @return graduationYear The student's expected graduation year.
    /// @return profileHash SHA-256 hash of the off-chain profile.
    /// @return createdAt Unix timestamp the profile was created.
    /// @return updatedAt Unix timestamp the profile was last updated.
    /// @return verified Whether the profile is currently verified.
    function getProfile(address wallet)
        external
        view
        returns (
            address wallet_,
            string memory fullName,
            string memory university,
            string memory department,
            uint16 graduationYear,
            bytes32 profileHash,
            uint40 createdAt,
            uint40 updatedAt,
            bool verified
        )
    {
        Student storage student = _students[wallet];
        if (!student.exists) revert ProfileDoesNotExist(wallet);

        return (
            student.walletAddress,
            student.fullName,
            student.university,
            student.department,
            student.graduationYear,
            student.profileHash,
            student.createdAt,
            student.updatedAt,
            student.isVerified
        );
    }

    /// @notice Returns whether a wallet has created a profile.
    /// @param wallet Address to check.
    /// @return True if a profile exists for `wallet`.
    function profileExists(address wallet) external view returns (bool) {
        return _students[wallet].exists;
    }

    /// @notice Returns only the profile hash for a wallet.
    /// @param wallet Address to look up.
    /// @return SHA-256 hash of the off-chain profile.
    function getProfileHash(address wallet) external view returns (bytes32) {
        if (!_students[wallet].exists) revert ProfileDoesNotExist(wallet);
        return _students[wallet].profileHash;
    }

    // ---------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------

    /// @dev Validates the mutable-on-creation fields shared by profile
    ///      creation. Kept internal and reused to avoid duplicated logic.
    function _validateProfileInputs(
        string calldata fullName,
        string calldata university,
        string calldata department,
        uint16 graduationYear,
        bytes32 profileHash
    ) private pure {
        if (bytes(fullName).length == 0) revert EmptyName();
        if (bytes(university).length == 0) revert EmptyUniversity();
        if (bytes(department).length == 0) revert EmptyDepartment();
        if (graduationYear < MIN_GRADUATION_YEAR || graduationYear > MAX_GRADUATION_YEAR) {
            revert InvalidGraduationYear(graduationYear);
        }
        if (profileHash == bytes32(0)) revert InvalidProfileHash();
    }
}
