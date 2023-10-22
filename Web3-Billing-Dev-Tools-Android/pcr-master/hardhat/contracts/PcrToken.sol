// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

import {IPcrToken} from "./interfaces/IPcrToken.sol";

import {ISuperfluid, ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";
import {IInstantDistributionAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IInstantDistributionAgreementV1.sol";

import "@openzeppelin/contracts/token/ERC777/ERC777.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777.sol";
import "@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol";
import "@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import {ERC20Upgradeable} from "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import {IDAv1Library} from "@superfluid-finance/ethereum-contracts/contracts/apps/IDAv1Library.sol";

import {DataTypes} from "./libraries/DataTypes.sol";
import {Events} from "./libraries/Events.sol";

/**
 * The dividends rights token show cases two use cases
 * 1. Use Instant distribution agreement to distribute tokens to token holders.
 * 2. Use SuperApp framework to update `isSubscribing` when new subscription is approved by token holder.
 */
contract PcrToken is ERC20Upgradeable, IPcrToken, IERC777Recipient {
  uint32 public constant INDEX_ID = 0;

  // use the IDAv1Library for the InitData struct
  using IDAv1Library for IDAv1Library.InitData;

  // declare `_idaLib` of type InitData
  IDAv1Library.InitData internal _idaLib;

  uint256 public pcrId;
  address public ADMIN;
  address public TOKEN_INDEX_PUBLISHER_ADDRESS;

  address public OPTIMISTIC_DISTRUBUTOR_ADDRESS;

  ISuperToken private _rewardToken;
  ISuperfluid private _host;
  IInstantDistributionAgreementV1 private _ida;

  // use callbacks to track approved subscriptions
  mapping(address => bool) public isSubscribing;

  constructor() {}

  // ============= =============  Modifiers ============= ============= //
  // #region MOdidiers
  modifier onlyAdmin() {
    require(msg.sender == ADMIN, "NOT_ADMIN");
    _;
  }

  // endregion

  function decimals() public view virtual override returns (uint8) {
    return 0;
  }

  function initialize(DataTypes.PCRTOKEN_INITIALIZER calldata pcrTokenInitializer) external override initializer {
    __ERC20_init(pcrTokenInitializer.name, pcrTokenInitializer.symbol);

    _host = ISuperfluid(pcrTokenInitializer.ida.host);
    _ida = IInstantDistributionAgreementV1(pcrTokenInitializer.ida.ida);
    _rewardToken = ISuperToken(pcrTokenInitializer.ida.rewardToken);
    pcrId = pcrTokenInitializer.rewardId;

    TOKEN_INDEX_PUBLISHER_ADDRESS = address(this);
    ADMIN = pcrTokenInitializer.admin;

    OPTIMISTIC_DISTRUBUTOR_ADDRESS = pcrTokenInitializer.optimisticOracleContract;

    // assign it the host and ida addresses
    _idaLib = IDAv1Library.InitData(_host, _ida);
    _idaLib.createIndex(_rewardToken, INDEX_ID);

    //transferOwnership(msg.sender);

    IERC1820Registry _erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
    bytes32 TOKENS_RECIPIENT_INTERFACE_HASH = keccak256("ERC777TokensRecipient");

    _erc1820.setInterfaceImplementer(address(this), TOKENS_RECIPIENT_INTERFACE_HASH, address(this));
  }

  /// @dev Issue new `amount` of giths to `beneficiary`
  function bulkIssue(address[] memory beneficiaries, uint256 amount) external onlyAdmin {
    for (uint256 i; i < beneficiaries.length; i++) {
      address beneficiary = beneficiaries[i];
      (, , uint128 units, uint256 pendingDistribution) = _idaLib.getSubscription(_rewardToken, TOKEN_INDEX_PUBLISHER_ADDRESS, INDEX_ID, beneficiary);

      uint256 totalUnits = units + pendingDistribution;

      ERC20Upgradeable._mint(beneficiary, amount);

      _idaLib.updateSubscriptionUnits(_rewardToken, INDEX_ID, beneficiary, uint128(totalUnits) + uint128(amount));
    }
    emit Events.RewardBulkUnitsIssued(pcrId, beneficiaries, amount);
  }

  /// @dev Issue new `amount` of giths to `beneficiary`
  function issue(address beneficiary, uint256 amount) external override onlyAdmin {
    (, , uint128 units, uint256 pendingDistribution) = _idaLib.getSubscription(_rewardToken, TOKEN_INDEX_PUBLISHER_ADDRESS, INDEX_ID, beneficiary);

    uint256 totalUnits = units + pendingDistribution;

    ERC20Upgradeable._mint(beneficiary, amount);

    _idaLib.updateSubscriptionUnits(_rewardToken, INDEX_ID, beneficiary, uint128(totalUnits) + uint128(amount));

    emit Events.RewardUnitsIssued(pcrId, beneficiary, amount);
  }

  /// @dev Issue new `amount` of giths to `beneficiary`
  function deleteSubscription(address beneficiary) external override onlyAdmin {
    (, , uint128 units, uint256 pendingDistribution) = _idaLib.getSubscription(_rewardToken, TOKEN_INDEX_PUBLISHER_ADDRESS, INDEX_ID, beneficiary);

    uint256 totalUnits = units + pendingDistribution;

    _idaLib.deleteSubscription(_rewardToken, TOKEN_INDEX_PUBLISHER_ADDRESS, INDEX_ID, beneficiary);

    emit Events.RewardUnitsDeleted(pcrId, beneficiary, totalUnits);
  }

  /// @dev Issue new `amount` of giths to `beneficiary`
  function claim() external {
    // then adjust beneficiary subscription units
    _idaLib.claim(_rewardToken, TOKEN_INDEX_PUBLISHER_ADDRESS, INDEX_ID, msg.sender);
  }

  /// @dev Distribute `amount` of cash among all token holders
  function _distribute(uint256 cashAmount) internal {
    // (uint256 actualCashAmount, ) = _idaLib.calculateDistribution(
    //     _rewardToken,
    //     address(this),
    //     INDEX_ID
    //     cashAmount
    // );
    (int256 availableBalance, , ) = _rewardToken.realtimeBalanceOf(address(this), _host.getNow());


    //  _rewardToken.transferFrom(owner(), address(this), actualCashAmount);

    _idaLib.distribute(_rewardToken, INDEX_ID, cashAmount);
  }

  function tokensReceived(
    address operator,
    address from,
    address to,
    uint256 amount,
    bytes calldata userData,
    bytes calldata operatorData
  ) external override {
    // do stuff
    _distribute(amount);

    // emit Events.RewardDistributed( pcrId, amount);
  }

  /// @dev ERC20Upgradeable._transfer override
  function _transfer(
    address sender,
    address recipient,
    uint256 amount
  ) internal override {
    uint128 senderUnits = uint128(ERC20Upgradeable.balanceOf(sender));
    uint128 recipientUnits = uint128(ERC20Upgradeable.balanceOf(recipient));
    // first try to do ERC20Upgradeable transfer
    ERC20Upgradeable._transfer(sender, recipient, amount);

    _idaLib.updateSubscriptionUnits(_rewardToken, INDEX_ID, sender, senderUnits - uint128(amount));

    _idaLib.updateSubscriptionUnits(_rewardToken, INDEX_ID, recipient, recipientUnits + uint128(amount));
  }
}
