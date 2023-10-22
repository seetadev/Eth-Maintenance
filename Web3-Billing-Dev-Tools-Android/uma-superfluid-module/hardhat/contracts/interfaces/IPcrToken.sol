// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ISuperfluid, ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";
import {IInstantDistributionAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IInstantDistributionAgreementV1.sol";
import {DataTypes} from "../libraries/DataTypes.sol";

/**
 * @title IPcrToken
 * @author Donoso.eth
 *
 * @notice This is the interface for the PcrToken contract, which is cloned upon the creationm of a Perpetual Conditional Reward.
 */
interface IPcrToken {
    /**
     * @notice Initializes the PcrToken, setting the feed as the privileged minter, initializing the name and
     * symbol in the ERC20 Upgradeable contract.
     *
     */
     function initialize( DataTypes.PCRTOKEN_INITIALIZER calldata pcrTokenInitializer ) external ;

    /**
     * @notice Imint a PcrToken and add token owner to Index subscription
     *
     * @param beneficiary The address to mint the NFT to ans subscriber to the Ida
     */
    function issue(address beneficiary, uint256 amount) external;
    
        /**
     * @notice Imint a PcrToken and add token owner to Index subscription
     *
     * @param beneficiary The address to mint the NFT to ans subscriber to the Ida
     */
    function deleteSubscription(address beneficiary) external;
   
}
