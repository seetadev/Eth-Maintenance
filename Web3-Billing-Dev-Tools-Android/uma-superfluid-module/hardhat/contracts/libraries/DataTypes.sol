// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity ^0.8.0;

import "@uma/core/contracts/oracle/interfaces/FinderInterface.sol";

/**
 * @title DataTypes
 * @author donoso_eth
 *
 * @notice A standard library of data types used throughout.
 */
library DataTypes {
    // ============= =============  External Input ============= ============= //
    // #region External Input

    /**
     * @notice A struct containing information to launch create the Reward
     *
     * @dev This struct will be required with IDA_INPUT and OPTIMISTIC_ORACLE_INPUT that will be used to interacti with the two clone contracts
     * @param pcrTokenImpl PctToken Implementation contract address, required to be cloned
     * @param pcrOptimisticOracleImpl PcrOptimisticOracleImplementation contract address, required to be cloned
     * @param title Reward Title
     * @param url Reward Url Check
     */
    struct PCRHOST_CONFIG_INPUT {
        address pcrTokenImpl;
        address pcrOptimisticOracleImpl;
        bytes title;
        bytes description;
        bytes url;

    }

    /**
     * @notice A struct containing the necessary information to launch the InstandDistricution agreemens
     *
     * @dev This struct will be passed to the PcrToken Contract
     * @param host Superfluid Host address parameter.
     * @param ida Superfluid InstantDistribution address parameter.
     * @param rewardToken SuperFluid SuperToken parameter
     */
    struct IDA_INPUT {
        address host;
        address ida;
        address rewardToken;
    }

    /**
     * @notice A struct containing the necessary information to launch the Optimistic Oraclea
     *
     * @dev This struct will be passed to the PcrOptimisticOracle Contract
     * @param finder UMA Finder contract Address.
     * @param target target value for the kpi in BN
     * @param rewardAmount reward amount to be distributed
     * @param interval interval between reward distribution
     * @param optimisticOracleLivenessTime interval for price disputes if any
     * @param priceIdentifier Price identifier accordng to Uma UIMP
     * @param customAncillaryData Data to be passes with the Price
     */
    struct OPTIMISTIC_ORACLE_INPUT {
        FinderInterface finder;
        int256 target;
        TargetCondition targetCondition;
        uint256 rewardAmount;
        uint256 interval;
        uint256 optimisticOracleLivenessTime;
        bytes32 priceIdentifier;
        DataTypes.PriceType priceType;
        bytes customAncillaryData;
    }
    // #endregion Exteral Input

    // ============= =============  Initializers   ============= ============= //
    // #region Initilizers

    /**
     * @notice A struct containing the necessary information to initilize the Instant distribution cloned contract
     *
     * @param admin Reward owner
     * @param rewardId unique Id of the reward, will be stored in the pcrhost contrat
     * @param optimisticOracleContract Adresse of the paired opcimistic oracle contrat
     * @param name Token name
     * @param symbol Token symbol
     * @param ida Ida Input as passed  by the external call (see bove)
     */
    struct PCRTOKEN_INITIALIZER {
        address admin;
        uint256 rewardId;
        address optimisticOracleContract;
        string name;
        string symbol;
        IDA_INPUT ida;
    }

    /**
     * @notice A struct containing the necessary information to initilize the Optimistic Oracle cloned contract
     *
     * @param admin Reward owner
     * @param rewardId unique Id of the reward, will be stored in the pcrhost contrat
     * @param tokenContract Adresse of the paired token contrat
     * @param rewardToken Superfluid Supertoken to be distributed/rewarded
     * @param optimisticOracleInput Optimistic Oracle Input as passed  by the external call (see bove)
     */
    struct PCR_OPTIMISTIC_ORACLE_INITIALIZER {
        address admin;
        uint256 rewardId;
        address tokenContract;
        address rewardToken;
        OPTIMISTIC_ORACLE_INPUT optimisticOracleInput;
    }

    // #endregion Initializers

    // ============= =============  Main Objects  ============= ============= //
    // #region  Main Objects 

    /**
     * @notice A struct containing the necessary information to launch the Optimistic Oraclea
     *
     * @dev This struct will be passed to the PcrOptimisticOracle Contract
     * @param rewardStep Which Step is the reward (funding/proposed )
     * @param rewardStatus Reward Active/Paused or removed
     * @param admin Reward owner
     * @param target target value for the kpi in BN
     * @param targetCongition target condition for the pricecheck
     * @param rewardToken Superfluid Supertoken to be distributed/rewarded
     * @param rewardAmount reward amount to be distributed
     * @param interval interval between reward distribution
     * @param earliestNextAction earliest time when next action can be launched
     * @param optimisticOracleLivenessTime interval for price disputes if any
     * @param priceIdentifier Price identifier accordng to Uma UIMP
     * @param customAncillaryData Data to be passes with the Price
     */
    struct Reward {
        RewardStep rewardStep;
        RewardStatus rewardStatus;
        address admin;
        int256 target;
        TargetCondition targetCondition;
        DataTypes.PriceType priceType;
        address rewardToken;
        uint256 rewardAmount;
        uint256 interval;
        uint256 earliestNextAction;
        uint256 optimisticOracleLivenessTime;
        bytes32 priceIdentifier;
        bytes customAncillaryData;

    }

    // Represents proposed rewards distribution.
    struct Proposal {
        uint256 pcrId;
        uint256 proposalId;
        uint256 timestamp;
    }

    // endregion Main Objects 

    // ============= =============  Enums ============= ============= //
    // #region Enums

    enum RewardStep {
        Funding, // 
        Pending // 
    }

    enum RewardStatus {
        Active, // 
        Paused, // 
        Removed // .
    }

     enum TargetCondition{
        GT, // 
        GTE, // 
        E, // .
        LTE, //
        LT 
    }

    enum PriceType {
        BOOLEAN,
        NUMBER
    }


    // endregion  Enums


    // ============= =============  Events ============= ============= //
    // #region Events

    struct REWARD_EVENT {
        address admin;
        int256 target;

        DataTypes.TargetCondition targetCondition;

        address rewardToken;
        string token;
        uint256 pcrId;
        
        uint256 earliestNextAction;
        DataTypes.OPTIMISTIC_ORACLE_INPUT optimisticOracleInput;

        address tokenContract;  // Required for the subgraph template cereation
        address optimisticOracleContract; // Required for the subgraph template cereation
        
        bytes title;
        bytes description;
        bytes url;
    }

    // endregion  Events
}
