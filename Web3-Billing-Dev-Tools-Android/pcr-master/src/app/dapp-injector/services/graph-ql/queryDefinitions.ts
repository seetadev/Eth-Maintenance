
export const GET_UPCOMING_REWARDS = 
`
    {
      rewards(first: 5, where: {rewardStatus:"0"}, orderBy: earliestNextAction, orderDirection: asc) {
        id
        title
        rewardStep 
        earliestNextAction
        rewardToken
        rewardAmount
        rewardStatus
      }
    }
  `;


export const GET_USER = `
query($address: String!){
    user(id:$address) {
      id
      rewardsCreated {  
      id
      title
      rewardStep 
      earliestNextAction
      rewardToken
      rewardAmount
      rewardStatus
      }
      rewardsMembership {
      id
      units
      reward  {  
        id
        title
        rewardStep 
        earliestNextAction
        rewardToken
        currentIndex
        rewardAmount
        rewardStatus
        }
      }
      proposaslsSubmitted
    }
  }
`;

export const GET_INDEXES = `
query($id: String!){
    rewardIndexHistories(first: 5, where: {rewardId:$id}, orderBy: timeStamp, orderDirection: desc) {
      index
      rewardAmount
      timeStamp
      rewardId 
    }
  }
`;

export const GET_PROPOSALS = `
query($id: String!){
    proposals(first: 5, where: {rewardId:$id}, orderBy: timeStamp, orderDirection: desc ) {
      id
      rewardId
      proposalId
      status
      timeStamp
      priceProposed
      priceResolved
    }
  }
`;



export const GET_REWARD = `
query($id: String!)
  {
    reward(id:$id) {
      id
      admin {
        id
      }
      rewardAmount
      rewardToken
      currentdeposit
      customAncillaryData
      token
      title
      url
      description
      tokenImpl
      optimisticOracleImpl
      earliestNextAction
      interval
      priceType
      target
      targetCondition
      optimisticOracleLivenessTime
      rewardStep
      rewardStatus
      totalDistributed
      currentIndex
      unitsIssued
      currentProposal {
        id
        startQualifying
        startLivenessPeriod
        status
        priceProposed
      }
    }
  }
`;

export const GET_MEMBERSHIP = `
query($id: String!)
  {
    userMembership(id:$id) {
      units
      reward {
      id
      admin {
        id
      }
      rewardAmount
      rewardToken
      currentdeposit
      customAncillaryData
      token
      title
      description
      url
      tokenImpl
      optimisticOracleImpl
      earliestNextAction
      priceType
      optimisticOracleLivenessTime
      interval
      rewardStep
      rewardStatus
      totalDistributed
      currentIndex
      unitsIssued
      currentProposal {
        id
        startQualifying
        startLivenessPeriod
        status
        priceProposed
      }
      }
    }
  }
`;
