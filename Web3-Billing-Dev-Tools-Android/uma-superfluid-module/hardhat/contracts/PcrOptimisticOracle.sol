// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;
import "hardhat/console.sol";

///// OPENZEPELLIN IMPORTS
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

///// UMA IMPORTS
import "@uma/core/contracts/common/implementation/AncillaryData.sol";
import "@uma/core/contracts/common/implementation/Lockable.sol";
import "@uma/core/contracts/common/implementation/MultiCaller.sol";
import "@uma/core/contracts/common/implementation/Testable.sol";
import "@uma/core/contracts/common/interfaces/AddressWhitelistInterface.sol";
import "@uma/core/contracts/oracle/implementation/Constants.sol";
import "@uma/core/contracts/oracle/interfaces/FinderInterface.sol";
import "@uma/core/contracts/oracle/interfaces/IdentifierWhitelistInterface.sol";
import "@uma/core/contracts/oracle/interfaces/OptimisticOracleInterface.sol";
import "@uma/core/contracts/oracle/interfaces/StoreInterface.sol";

//// SUPERFLUID IMPORTS
import {SuperToken} from "@superfluid-finance/ethereum-contracts/contracts/superfluid/SuperToken.sol";

/// PCR IMPORTS
import {IPcrOptimisticOracle} from "./interfaces/IPcrOptimisticOracle.sol";
import {DataTypes} from "./libraries/DataTypes.sol";
import {Events} from "./libraries/Events.sol";

/**
 * @title  OptimisticOracle contract.
 * @notice Allows admins to distribute rewards through  contract secured by UMA Optimistic Oracle.
 */
contract PcrOptimisticOracle is IPcrOptimisticOracle, Initializable, MultiCaller {
  using SafeERC20 for IERC20;
  using Counters for Counters.Counter;

  /********************************************
   *      STATE VARIABLES AND CONSTANTS       *
   ********************************************/

  // Reserve for bytes appended to ancillary data (e.g. OracleSpoke) when resolving price from non-mainnet chains.
  // This also covers appending pcrId by this contract.
  uint256 public constant ANCILLARY_BYTES_RESERVE = 512;

  // Restrict Optimistic Oracle liveness to between 10 minutes and 100 years.
  uint256 public constant MINIMUM_LIVENESS = 10 minutes;
  uint256 public constant MAXIMUM_LIVENESS = 5200 weeks;

  // Ancillary data length limit can be synced and stored in the contract.
  uint256 public ancillaryBytesLimit;

  // Rewards are stored in a REward Struct
  DataTypes.Reward public reward;

  // Reward/token id provided by initialization
  uint256 public pcrId;

  // Adress of the instantiate IDA Superfluid Contract for token transfer
  address public TOKEN_INDEX_PUBLISHER_ADDRESS;

  // Proposal counter
  Counters.Counter public _proposalId;

  // Proposal
  DataTypes.Proposal public proposal;

  // Uma finder address
  FinderInterface public finder;
  address public rewardToken; // This cannot be declared immutable as bondToken needs to be checked against whitelist.

  // Interface parameters that can be synced and stored in the contract.
  StoreInterface public store;
  OptimisticOracleInterface public optimisticOracle;

  /**
   * @notice Constructor.
   * @dev Constructor is empty as this contract os the implementation for later clones
   */
  constructor() {}

  // ============= =============  Modifiers ============= ============= //
  // #region Modidiers
  modifier onlyAdmin() {
    require(msg.sender == reward.admin, "NOT_ADMIN");
    _;
  }

  modifier onlyActiveRewards() {
    require(reward.rewardStatus == DataTypes.RewardStatus.Active, "REWARD_PAUSED_OR_REMOVED");
    _;
  }

  // endregion

  /**
   * @notice initializer of the contract/oracle
   */
  function initialize(DataTypes.PCR_OPTIMISTIC_ORACLE_INITIALIZER calldata optimisticOracleinitializer) external initializer {
    finder = optimisticOracleinitializer.optimisticOracleInput.finder;
    rewardToken = optimisticOracleinitializer.rewardToken;
    pcrId = optimisticOracleinitializer.rewardId;
    TOKEN_INDEX_PUBLISHER_ADDRESS = optimisticOracleinitializer.tokenContract;
    syncUmaEcosystemParams();
    _createReward(
      optimisticOracleinitializer.admin,
      optimisticOracleinitializer.optimisticOracleInput.rewardAmount,
      optimisticOracleinitializer.optimisticOracleInput.target,
      optimisticOracleinitializer.optimisticOracleInput.targetCondition,
      optimisticOracleinitializer.optimisticOracleInput.interval,
      optimisticOracleinitializer.optimisticOracleInput.optimisticOracleLivenessTime,
      optimisticOracleinitializer.optimisticOracleInput.priceIdentifier,
      optimisticOracleinitializer.optimisticOracleInput.customAncillaryData,
      optimisticOracleinitializer.optimisticOracleInput.priceType
    );

    // Generate hash for proposalId.
    _proposalId.increment();
  }

  /********************************************
   *            PUBLIC FUNCTIONS             *
   ********************************************/

  /**
   * @notice Allows anyone to deposit additional rewards for distribution before `earliestNextAction`.
   * @dev The caller must approve this contract to transfer `additionalRewardAmount` amount of `rewardToken`.
   * @param depositAmount Additional reward amount that the admin is posting for distribution.
   */
  function depositReward(uint256 depositAmount) external onlyActiveRewards {
    // Pull additional rewards from the admin.
    IERC20(reward.rewardToken).safeTransferFrom(msg.sender, address(this), depositAmount);

    // Update rewardAmount and log new amount.
    emit Events.RewardDeposit(pcrId, depositAmount);


  }

  /**
   * @notice Allows the admin to change the Reward Amount
   *
   * @param newRewardAmount New reward amount that the admin is posting for distribution.
   */
  function updateRewardAmount(uint256 newRewardAmount) external onlyAdmin {
    reward.rewardAmount = newRewardAmount;

    emit Events.RewardAmountUpdated(pcrId, newRewardAmount);
  }

  /**
   * @notice Allows the admin to change the target and target conditoin for the reward
   * @dev function tested but not implemented in frontend
   * @param _newTarget New target for the REward KPI
   * @param _newTargetCondition New targetCondition (Greater, Greater or Equal, Equal, Less or Equal, Less)
   */
  function changeTarget(int256 _newTarget, DataTypes.TargetCondition _newTargetCondition) external onlyAdmin {
    reward.target = _newTarget;
    reward.targetCondition = _newTargetCondition;

    emit Events.RewardTargetAndConditionChanged(pcrId, reward.target, reward.targetCondition);
  }

  /**
   * @notice Allows the admin to Pause the Reward or Unpause
   * @dev The removed/delete state not yet implemented
   */
  function switchRewardStatus() external onlyAdmin {
    if (reward.rewardStatus == DataTypes.RewardStatus.Active) {
      reward.rewardStatus = DataTypes.RewardStatus.Paused;
    } else if (reward.rewardStatus == DataTypes.RewardStatus.Paused) {
      reward.rewardStatus = DataTypes.RewardStatus.Active;
      reward.rewardStep = DataTypes.RewardStep.Funding;
      reward.earliestNextAction = block.timestamp + reward.interval;
    }
    emit Events.RewardSwitchStatus(pcrId, reward.rewardStatus);
  }

  /********************************************
   *          DISTRIBUTION FUNCTIONS          *
   ********************************************/

  /**
   * @notice Allows any caller to propose distribution for funded reward starting from `earliestNextAction`.
   * Only one undisputed proposal at a time is allowed.
   * @dev The caller must approve this contract to transfer
   * @param _proposedPrice The Proposed KPI value when tarhet value or Yes/No when imple question
   */
  function proposeDistribution(int256 _proposedPrice) external onlyActiveRewards {
    uint256 timestamp = block.timestamp;

    require(timestamp >= reward.earliestNextAction, "NOT_IN_FUNDING");
    require(reward.rewardStep == DataTypes.RewardStep.Funding, "NOT_PROPOSALS");

    uint256 id = _proposalId.current();

    // Flag reward as proposed so that any subsequent proposals are blocked till dispute.
    reward.rewardStep = DataTypes.RewardStep.Pending;

    // Append pcrId to ancillary data.
    bytes memory ancillaryData = _appendpcrId(reward.customAncillaryData);

    // Request price from Optimistic Oracle.
    optimisticOracle.requestPrice(reward.priceIdentifier, timestamp, ancillaryData, IERC20(0x489Bf230d4Ab5c2083556E394a28276C22c3B580), 0);

    // Set proposal liveness and bond.
    optimisticOracle.setCustomLiveness(reward.priceIdentifier, timestamp, ancillaryData, reward.optimisticOracleLivenessTime);

    // Propose Value.
    optimisticOracle.proposePriceFor(msg.sender, address(this), reward.priceIdentifier, timestamp, ancillaryData, int256(_proposedPrice));

    // Store and log proposed distribution.
    proposal = DataTypes.Proposal({pcrId: pcrId, proposalId: id, timestamp: timestamp});
    emit Events.ProposalCreated(msg.sender, id, pcrId, _proposedPrice);
  }

  function disputeDistribution() external onlyActiveRewards {
    uint256 timestamp = block.timestamp;
    require(timestamp > reward.earliestNextAction, "NOT_YET_LIVENESS_PERIOD");
    require(timestamp <= reward.earliestNextAction + reward.optimisticOracleLivenessTime, "PASSED_LIVENESS_PERIOD");
    require(reward.rewardStep == DataTypes.RewardStep.Pending, "STEP_NOT_PENDING");

    // Append pcrId to ancillary data.
    bytes memory ancillaryData = _appendpcrId(reward.customAncillaryData);

    // Dispute Price
    optimisticOracle.disputePriceFor(msg.sender, address(this), reward.priceIdentifier, proposal.timestamp, ancillaryData);
  }

  /**
   * @notice Allows any caller to execute distribution that has been validated by the Optimistic Oracle.
   * @dev Calling this for unresolved proposals will revert.
   */
  function executeDistribution() external onlyActiveRewards {
    // All valid proposals should have non-zero proposal timestamp.

    require(proposal.timestamp != 0, "Invalid proposalId");

    // Only one validated proposal per reward can be executed for distribution.
    require(reward.rewardStep == DataTypes.RewardStep.Pending, "Reward not in Execurion Period");

    // Append reward index to ancillary data.
    bytes memory ancillaryData = _appendpcrId(reward.customAncillaryData);

    // Get resolved price. Reverts if the request is not settled or settleable.
    int256 resolvedPrice = optimisticOracle.settleAndGetPrice(reward.priceIdentifier, proposal.timestamp, ancillaryData);

    // Get  if the condition is met for distribution
    bool isConditionMet = _checkTargetCondition(resolvedPrice, reward.target, reward.targetCondition);

    // Create a new Proposal ID
    _proposalId.increment();
    uint256 new_proposal_id = _proposalId.current();

    // Prepare the reward for the next distribution and propsal
    reward.earliestNextAction = block.timestamp + reward.interval;
    reward.rewardStep = DataTypes.RewardStep.Funding;

    if (isConditionMet == true) {
      SuperToken(rewardToken).approve(TOKEN_INDEX_PUBLISHER_ADDRESS, reward.rewardAmount);
      SuperToken(rewardToken).send(TOKEN_INDEX_PUBLISHER_ADDRESS, reward.rewardAmount, "0x");

      //// Proposal is accepted
      emit Events.ProposalAcceptedAndDistribuition(proposal.pcrId, proposal.proposalId, new_proposal_id, resolvedPrice);
    }
    // ProposalRejected can be emitted multiple times whenever someone tries to execute the same rejected proposal.
    else {
      emit Events.ProposalRejected(proposal.pcrId, proposal.proposalId, new_proposal_id, resolvedPrice);
    }
  }

  /********************************************
   *          MAINTENANCE FUNCTIONS           *
   ********************************************/

  /**
   * @notice Updates the address stored in this contract for the OptimisticOracle and the Store to the latest
   * versions set in the Finder. Also pull finalFee from Store contract.
   * @dev There is no risk of leaving this function public for anyone to call as in all cases we want the addresses
   * in this contract to map to the latest version in the Finder and store the latest final fee.
   */
  function syncUmaEcosystemParams() public {
    store = _getStore();
    optimisticOracle = _getOptimisticOracle();
    ancillaryBytesLimit = optimisticOracle.ancillaryBytesLimit();
  }

  /********************************************
   *            CALLBACK FUNCTIONS            *
   ********************************************/

  /**
   * @notice Unblocks new distribution proposals when there is a dispute posted on OptimisticOracle.
   * @dev Only accessable as callback through OptimisticOracle on disputes.
   * @param identifier Price identifier from original proposal.
   * @param timestamp Timestamp when distribution proposal was posted.
   * @param ancillaryData Ancillary data of the price being requested (includes stamped pcrId).
   * @param refund Refund received (not used in this contract).
   */
  function priceDisputed(
    bytes32 identifier,
    uint256 timestamp,
    bytes memory ancillaryData,
    uint256 refund
  ) external {
    require(msg.sender == address(optimisticOracle), "Not authorized");

    reward.rewardStep = DataTypes.RewardStep.Funding;
  
    uint256 id = _proposalId.current();
    emit Events.ProposalDisputed(msg.sender, id, pcrId);

 
  }

  /********************************************
   *            INTERNAL FUNCTIONS            *
   ********************************************/

  /**
   * @notice Allows any caller to create a Reward struct and deposit tokens that are linked to these rewards.
   * @dev The caller must approve this contract to transfer `rewardAmount` amount of `rewardToken`.
   * @param rewardAmount Maximum reward amount that the admin is posting for distribution.
   * @param interval Starting timestamp when proposals for distribution can be made.
   * @param priceIdentifier Identifier that should be passed to the Optimistic Oracle on proposed distribution.
   * @param customAncillaryData Custom ancillary data that should be sent to the Optimistic Oracle on proposed
   * distribution.
   * @param optimisticOracleLivenessTime Liveness period in seconds during which proposed distribution can be
   * disputed through Optimistic Oracle.
   */
  function _createReward(
    address admin,
    uint256 rewardAmount,
    int256 target,
    DataTypes.TargetCondition targetCondition,
    uint256 interval,
    uint256 optimisticOracleLivenessTime,
    bytes32 priceIdentifier,
    bytes memory customAncillaryData,
    DataTypes.PriceType priceType
  ) internal {
    require(_getIdentifierWhitelist().isIdentifierSupported(priceIdentifier), "Identifier not registered");
    require(_ancillaryDataWithinLimits(customAncillaryData), "Ancillary data too long");
    require(optimisticOracleLivenessTime >= MINIMUM_LIVENESS, "OO liveness too small");
    require(optimisticOracleLivenessTime < MAXIMUM_LIVENESS, "OO liveness too large");

    // Pull maximum rewards from the admin.
    // rewardToken.safeTransferFrom(msg.sender, address(this), rewardAmount);

    uint256 earliestNextAction = block.timestamp + interval;

    // Store funded reward and log created reward.
    reward = DataTypes.Reward({
      rewardStep: DataTypes.RewardStep.Funding,
      rewardStatus: DataTypes.RewardStatus.Active,
      admin: admin,
      target: target,
      targetCondition: targetCondition,
      priceType: priceType,
      rewardToken: rewardToken,
      rewardAmount: rewardAmount,
      interval: interval,
      earliestNextAction: earliestNextAction,
      optimisticOracleLivenessTime: optimisticOracleLivenessTime,
      priceIdentifier: priceIdentifier,
      customAncillaryData: customAncillaryData
    });
  }

  function _checkTargetCondition(
    int256 _proposedPrice,
    int256 _target,
    DataTypes.TargetCondition _targetCondition
  ) internal returns (bool) {
    bool resultCheck = false;

    if (_targetCondition == DataTypes.TargetCondition.GT && _proposedPrice > _target) {
      resultCheck = true;
    } else if (_targetCondition == DataTypes.TargetCondition.GTE && _proposedPrice >= _target) {
      resultCheck = true;
    } else if (_targetCondition == DataTypes.TargetCondition.E && _proposedPrice == _target) {
      resultCheck = true;
    } else if (_targetCondition == DataTypes.TargetCondition.LTE && _proposedPrice <= _target) {
      resultCheck = true;
    } else if (_targetCondition == DataTypes.TargetCondition.LT && _proposedPrice < _target) {
      resultCheck = true;
    }

    return resultCheck;
  }

  function _getStore() internal view returns (StoreInterface) {
    return StoreInterface(finder.getImplementationAddress(OracleInterfaces.Store));
  }

  function _getOptimisticOracle() internal view returns (OptimisticOracleInterface) {
    return OptimisticOracleInterface(finder.getImplementationAddress(OracleInterfaces.OptimisticOracle));
  }

  function _getIdentifierWhitelist() internal view returns (IdentifierWhitelistInterface) {
    return IdentifierWhitelistInterface(finder.getImplementationAddress(OracleInterfaces.IdentifierWhitelist));
  }

  function _getCollateralWhitelist() internal view returns (AddressWhitelistInterface) {
    return AddressWhitelistInterface(finder.getImplementationAddress(OracleInterfaces.CollateralWhitelist));
  }

  function _appendpcrId(bytes memory customAncillaryData) internal view returns (bytes memory) {
    return AncillaryData.appendKeyValueUint(customAncillaryData, "PcrId", pcrId);
  }

  function _ancillaryDataWithinLimits(bytes memory customAncillaryData) internal view returns (bool) {
    // Since pcrId has variable length as string, it is not appended here and is assumed
    // to be included in ANCILLARY_BYTES_RESERVE.
    return optimisticOracle.stampAncillaryData(customAncillaryData, address(this)).length + ANCILLARY_BYTES_RESERVE <= ancillaryBytesLimit;
  }
}
