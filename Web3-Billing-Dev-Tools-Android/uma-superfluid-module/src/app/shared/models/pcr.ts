
export enum REWARD_STEP {
  QUALIFYING,
  AWAITING_PROPOSAL,
  LIVENESS_PERIOD,
  AWAITING_EXECUTION,
}

export interface IPCR_REWARD {
  id: string;
  admin: string;
  tokenImpl:string;
  optimisticOracleImpl:string;
  currentdeposit: string;
  customAncillaryData: string;
  earliestNextAction: number;
  interval: string;
  optimisticOracleLivenessTime:string;
  rewardAmount: string;
  rewardStatus: string;
  rewardStep: string;
  target:string;
  targetCondition:string;
  rewardToken: string;
  title: string;
  description: string;
  url: string | null;
  token: string;
  
  priceType: number;

  totalDistributed: string;
  currentIndex: string;
  unitsIssued:string;


  currentProposal: {
    id:string;
    startQualifying: number
    priceProposed:number,
    startProposePeriod: number
    startLivenessPeriod: number
    startExecutionPeriod: number
    status:string
  };


  fundToken: IFUND_TOKEN
  
  displayStep: number;
  displayDescription: string;
  displayTime: { started:number, finish:number, percentage:number}
  displayDate: string;
  displayTarget:string;
  displayTargetCondition:string;
 
}

export interface IFUND_TOKEN {

    name: string; 
    id: number; 
    image: string; 
    rewardToken: string;
    rewardTokenBalance?:string; 
    superToken: string;
    superTokenBalance?:string };



export interface IPROPOSAL {
  id: string
  startQualifying: number
  startLivenessPeriod: number
  startExecutionPeriod: number
  earliestNextAction: number
  priceType:number
  priceProposed:number,
  interval:number;
  optimisticOracleLivenessTime:number;
  title:string,
  step:string,
  rewardId:string,
  rewardStatus:string,
  status: string

}
