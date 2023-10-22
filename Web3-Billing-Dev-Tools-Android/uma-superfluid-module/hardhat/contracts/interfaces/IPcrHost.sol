// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ISuperfluid, ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";
import {IInstantDistributionAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IInstantDistributionAgreementV1.sol";
import {DataTypes} from "../libraries/DataTypes.sol";


  struct Pcr_addresses {
    address tokenContract;
    address optimisticOracleContract;
  }

/**
 * @title IPcrHost
 * @author Donoso.eth
 *
 * @notice This is the interface for the PcrToken contract, which is cloned upon the creationm of a Perpetual Conditional Reward.
 */
interface IPcrHost {
  /**
   * @notice Initializes the PcrToken, setting the feed as the privileged minter, initializing the name and
   * symbol in the ERC20 Upgradeable contract.
   *
   */
  function createPcrReward(
    DataTypes.PCRHOST_CONFIG_INPUT memory pcrHostConfig,
    DataTypes.IDA_INPUT memory _ida,
    DataTypes.OPTIMISTIC_ORACLE_INPUT memory _optimisticOracleInput
  ) external;

  /**
   * @notice Imint a PcrToken and add token owner to Index subscription
   *
   */
  function getNumbersOfPcrTokens() external view returns (uint256);

  /**
   * @notice Imint a PcrToken and add token owner to Index subscription
   *
   * @param _owner The address to mint the NFT to ans subscriber to the Ida
   */
    function getTotalPcrTokensByUser(address _owner)
    external
    view
    returns (uint256);

    
  // function getTokensAddressByUserAndId(address _owner, uint256 _id)
  //   external
  //   view
  //   returns (Pcr_addresses memory);

}
