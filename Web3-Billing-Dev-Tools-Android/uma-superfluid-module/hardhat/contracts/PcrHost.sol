// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import {ISuperfluid, ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";
import {IInstantDistributionAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IInstantDistributionAgreementV1.sol";

import {IPcrToken} from "./interfaces/IPcrToken.sol";
import {IPcrOptimisticOracle} from "./interfaces/IPcrOptimisticOracle.sol";
import {IPcrHost} from "./interfaces/IPcrHost.sol";

import {DataTypes} from "./libraries/DataTypes.sol";
import {Events} from "./libraries/Events.sol";

import "@uma/core/contracts/oracle/interfaces/FinderInterface.sol";

contract PcrHost is IPcrHost {
  using Counters for Counters.Counter;
  Counters.Counter public _pcrTokensIssued;

  struct Pcr_addresses {
    address tokenContract;
    address optimisticOracleContract;
  }

  mapping(address => mapping(uint256 => Pcr_addresses)) private _pcrTokensContractsByUser;
  mapping(address => uint256) private _pcrTokensByUser;

  constructor() {}
  
  function createPcrReward(
    DataTypes.PCRHOST_CONFIG_INPUT memory pcrHostConfig,
    DataTypes.IDA_INPUT memory _ida,
    DataTypes.OPTIMISTIC_ORACLE_INPUT memory _optimisticOracleInput
  ) external override {
    _pcrTokensIssued.increment();

    uint256 id = _pcrTokensIssued.current();

    _pcrTokensByUser[msg.sender]++;
    uint256 _tokenId = _pcrTokensByUser[msg.sender];
    address _tokenContract = Clones.clone(pcrHostConfig.pcrTokenImpl);

    //// TODO CLONE OPTIMISTIC CONTRACT

    address _optimisticOracleContract = Clones.clone(pcrHostConfig.pcrOptimisticOracleImpl);

    _pcrTokensContractsByUser[msg.sender][_tokenId] = Pcr_addresses({tokenContract: _tokenContract, optimisticOracleContract: _optimisticOracleContract});

    string memory tokenSymbol = string(abi.encodePacked("PCR", Strings.toString(id)));

    string memory tokenName = string(abi.encodePacked("Perpetual Conditional Reward Token Nr: ", Strings.toString(id)));

    //// INITIALIZE TOJEN cONTRACT WITH
    DataTypes.PCRTOKEN_INITIALIZER memory pcrTokenInitializer;
    pcrTokenInitializer = DataTypes.PCRTOKEN_INITIALIZER({
      admin: msg.sender,
      rewardId: id,
      optimisticOracleContract: _optimisticOracleContract,
      name: tokenName,
      symbol: tokenSymbol,
      ida: _ida
    });

    IPcrToken(_tokenContract).initialize(pcrTokenInitializer);

    DataTypes.PCR_OPTIMISTIC_ORACLE_INITIALIZER memory pcrOptimisticOracleContractInitializer;
    pcrOptimisticOracleContractInitializer = DataTypes.PCR_OPTIMISTIC_ORACLE_INITIALIZER({
      admin: msg.sender,
      rewardId: id,
      tokenContract: _tokenContract,
      rewardToken: _ida.rewardToken,
      optimisticOracleInput: _optimisticOracleInput
    });

    IPcrOptimisticOracle(_optimisticOracleContract).initialize(pcrOptimisticOracleContractInitializer);

    DataTypes.REWARD_EVENT memory rewardEvent = DataTypes.REWARD_EVENT(
      msg.sender,
      _optimisticOracleInput.target,
      _optimisticOracleInput.targetCondition,
      _ida.rewardToken,
      string(abi.encodePacked(tokenSymbol, " ", tokenName)),
      id,
      block.timestamp + _optimisticOracleInput.interval,
      _optimisticOracleInput,
      _tokenContract,
      _optimisticOracleContract,
      pcrHostConfig.title,
      pcrHostConfig.description,
      pcrHostConfig.url
    );

    emit Events.RewardCreated(rewardEvent);
  }

  // ============= View Functions ============= ============= =============  //

  // #region ViewFunctions

  function getNumbersOfPcrTokens() external view override returns (uint256) {
    uint256 id = _pcrTokensIssued.current();
    return id;
  }

  function getTotalPcrTokensByUser(address _owner) external view override returns (uint256) {
    uint256 _totalPcrTokens = _pcrTokensByUser[_owner];
    return _totalPcrTokens;
  }

  function getTokensAddressByUserAndId(address _owner, uint256 _id) external view returns (Pcr_addresses memory) {
    Pcr_addresses memory _contractAdresses = _pcrTokensContractsByUser[_owner][_id];
    return _contractAdresses;
  }

  // #endregion View Functions
}
