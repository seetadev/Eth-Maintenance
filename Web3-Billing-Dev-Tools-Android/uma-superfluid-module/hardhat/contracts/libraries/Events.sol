// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import {DataTypes} from "./DataTypes.sol";

library Events {
    /**
     * @dev Emitted when a new Perpetual Conditional Reward is created.
     *
    
     */

    //// HOST CONTRACT
    event RewardCreated(DataTypes.REWARD_EVENT reward);


     //// OPTIMISTIC ORACLE CONTRACT
    event RewardDeposit(uint256 pcrId, uint256 depositAmount);

    event RewardAmountUpdated(uint256 pcrId, uint256 newRewardAmount);

    event RewardTargetAndConditionChanged(uint256 pcrId, int256 target, DataTypes.TargetCondition targetCondition);

    event RewardSwitchStatus(uint256 pcrId, DataTypes.RewardStatus rewardStatus);
    
    event ProposalCreated(address proposer, uint256 proposalId, uint256 pcrId,int256 priceProposed);

    event ProposalDisputed(address proposer, uint256 proposalId, uint256 pcrId);

    event ProposalRejected(uint256 pcrId, uint256 proposalId, uint256 newProposalId,int256 resolvedPrice);

    event ProposalAcceptedAndDistribuition(uint256 pcrId, uint256 proposalId, uint256 newProposalId,int256 resolvedPrice);


    //// TOKEN CONTRACT
    event RewardUnitsIssued(uint256 pcrId, address beneficiary, uint256 amount);

    event RewardBulkUnitsIssued(uint256 pcrId, address[] beneficiaries, uint256 amount);

    event RewardUnitsDeleted(uint256 pcrId, address beneficiary,  uint256 amount);
}
