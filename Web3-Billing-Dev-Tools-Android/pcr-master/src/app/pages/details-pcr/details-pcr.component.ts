import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DappBaseComponent, DappInjector, global_tokens, Web3Actions } from 'angular-web3';
import { Contract, utils } from 'ethers';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { doSignerTransaction } from 'src/app/dapp-injector/classes/transactor';

import { GraphQlService } from 'src/app/dapp-injector/services/graph-ql/graph-ql.service';
import { calculateStep, createDisplayDescription, createERC20Instance, createSuperTokenInstance, isAddress, prepareDisplayProposal } from 'src/app/shared/helpers/helpers';
import { IPCR_REWARD, IPROPOSAL } from 'src/app/shared/models/pcr';

export enum REWARD_STEP {
  QUALIFYING,
  AWAITING_PROPOSAL,
  LIVENESS_PERIOD,
  AWAITING_EXECUTION,
}

@Component({
  selector: 'details-pcr',
  templateUrl: './details-pcr.component.html',
  styleUrls: ['./details-pcr.component.scss'],
})
export class DetailsPcrComponent extends DappBaseComponent {
  utils = utils;

  isAdmin = false;

  toUpdateReward: IPCR_REWARD | undefined = undefined;

  valSwitch = true;
  showFundingState = false;
  showIssuingState = false;
  showingUpdateAmount = false;
  showTransferState = false;
  showBulkIssuingState = false;

  //// FormControls
  toFundAmountCtrl = new FormControl(0, Validators.required);
  toUpdateAmountCtrl = new FormControl(0, Validators.required);
  toUpgradeAmountCtrl = new FormControl(0, Validators.required);
  toDowngradeAmountCtrl = new FormControl(0, Validators.required);
  adressesCtrl = new FormControl('', [Validators.required, Validators.minLength(42), Validators.maxLength(42)]);
  bulkAdressesCtrl = new FormControl('', [Validators.required]);
  routeItems: { label: string }[];
  activeStep = 0;
  rewardStatus!: boolean;

  currentProposal!: IPROPOSAL;

  chartConfig!: { id: string; priceType: number; target: number };


  public cancelQuerySubscrition: Subject<void> = new Subject();

  constructor( private cd:ChangeDetectorRef,
    private msg: MessageService, private router: Router, private route: ActivatedRoute, dapp: DappInjector, store: Store, private graphqlService: GraphQlService) {
    super(dapp, store);
    this.routeItems = [{ label: 'Qualifying' }, { label: 'Propose Period' }, { label: 'Liveness Period' }, { label: 'Execution Period' }];
  }


///// USER PUBLIC FUNCTIONS
  async changeStatus() {
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    const result = await doSignerTransaction(this.dapp.DAPP_STATE.contracts[+this.toUpdateReward!.id]?.pcrOptimisticOracle.instance.switchRewardStatus());
    if (result.success == true) {
      this.msg.add({ key: 'tst', severity: 'success', summary: 'Great!', detail: `PCR Status changed with txHash:${result.txHash}` });
    } else {
      this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      this.msg.add({ key: 'tst', severity: 'error', summary: 'OOPS', detail: `Error toggling PCR Status with txHash:${result.txHash}` });
    }
  }

  async refreshBalance() {
    
    const superToken = createSuperTokenInstance(this.toUpdateReward!.fundToken.superToken, this.dapp.signer!);
    
    const balanceSupertoken = await superToken.realtimeBalanceOfNow(this.dapp.signerAddress);

    this.toUpdateReward!.fundToken.superTokenBalance = (+utils.formatEther(balanceSupertoken[0])).toFixed(4);

    const rewardToken = createERC20Instance(this.toUpdateReward!.fundToken.rewardToken, this.dapp.signer!);
    
    const balanceRewardToken = await rewardToken.balanceOf(this.dapp.signerAddress);

    this.toUpdateReward!.fundToken.rewardTokenBalance = (+utils.formatEther(balanceRewardToken)).toFixed(4);
   
    //this.getRewardDetails(this.toUpdateReward!.id)

  }


  // #region DIALOGS STATE AND ACTIONS

  // show dialogs
  showTransfer() {
    this.showTransferState = true;
  }
  async showFunding() {
    this.showFundingState = true;
  }
  showAddMembers(reward: IPCR_REWARD) {
    this.showIssuingState = true;
  }

  showUpdateRewardAmount() {
    this.showingUpdateAmount = true;
  }

  showBulkAddMembers(reward: IPCR_REWARD) {
    this.showBulkIssuingState = true;
  }

   // do actions from dialogs
  async doFunding() {
    if (this.toFundAmountCtrl.value <= 0) {
      this.msg.add({ key: 'tst', severity: 'warn', summary: 'OOPS',detail: `Please Input Amount` });
      return;
    }
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    
    this.showFundingState = false;
    const value = utils.parseEther(this.toFundAmountCtrl.value.toString());


    //// APPROVE AMOUNT
    const resultApprove = await doSignerTransaction(
      createERC20Instance(this.toUpdateReward!.fundToken.superToken, this.dapp.signer!).approve(
        this.dapp.DAPP_STATE.contracts[+this.toUpdateReward!.id]?.pcrOptimisticOracle.address,
        value
      )
    );
    if (resultApprove.success == true) {} 
    else {
      this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      this.msg.add({ key: 'tst', severity: 'error', summary: 'OOPS', detail: `Error Approving Amount with txHash:${resultApprove.txHash}` });
      return
    }

  //// SEND DEPOSIT
    const result = await doSignerTransaction(this.dapp.DAPP_STATE.contracts[+this.toUpdateReward!.id]?.pcrOptimisticOracle.instance.depositReward(value)!);

   
    if (result.success == true) {
      await this.refreshBalance();
      this.msg.add({ key: 'tst', severity: 'success', summary: 'Great!', detail: `Deposit succesful with txHash:${result.txHash}` });
    } else {
      this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      this.msg.add({ key: 'tst', severity: 'error', summary: 'OOPS', detail: `Error Depositing with txHash:${result.txHash}` });
    }
  }

  async doUpdateRewardAmount() {
    if (this.toUpdateAmountCtrl.value <= 0) {
      this.msg.add({ key: 'tst', severity: 'warn', summary: 'OOPS',detail: `Please Input a positive value`});

      return;
    }

    const newAmount = utils.parseEther(this.toUpdateAmountCtrl.value.toString());
    this.showingUpdateAmount = false;
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    const result = await doSignerTransaction(this.dapp.DAPP_STATE.contracts[+this.toUpdateReward!.id]?.pcrOptimisticOracle.instance.updateRewardAmount(newAmount));
   
    if (result.success == true) {

      this.msg.add({ key: 'tst', severity: 'success', summary: 'Great!', detail: `Reward Amount changed with txHash:${result.txHash}` });
    } else {
      this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      this.msg.add({ key: 'tst', severity: 'error', summary: 'OOPS', detail: `Error Changing Reward Amount with txHash:${result.txHash}` });
    }
     //// APPROVE AMOUNT

  }

  async doAddMember() {
    if (this.adressesCtrl.invalid) {
        this.msg.add({ key: 'tst', severity: 'warn', summary: 'OOPS',detail: `Please add Address` });

      return;
    }

    if (isAddress(this.adressesCtrl.value) == false) {
      alert('addresse is not valid');
      return;
    }
    this.showIssuingState = true;
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    await doSignerTransaction(this.dapp.DAPP_STATE.contracts[+this.toUpdateReward!.id]?.pcrToken?.instance.issue(this.adressesCtrl.value, 1)!);
  
  }

  async doBulkAddMembers() {
    if (this.bulkAdressesCtrl.invalid) {
      this.msg.add({ key: 'tst', severity: 'warn', summary: 'Missing info', detail: `Please add at least one address` });
      return
    }

    let addresses: Array<string> = this.bulkAdressesCtrl.value.split(',');

    for (const checkAddress of addresses) {
      if (isAddress(checkAddress) == false) {
 
        this.msg.add({ key: 'tst', severity: 'warn', summary: 'OOPS',detail: `Address ${checkAddress} is not valid` });

        return;
      }
    }
    this.showBulkIssuingState = false;
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    const result =  await doSignerTransaction(this.dapp.DAPP_STATE.contracts[+this.toUpdateReward!.id]?.pcrToken?.instance.bulkIssue(addresses, 1)!);
  
    if (result.success == true) {
      this.msg.add({ key: 'tst', severity: 'success', summary: 'Great!', detail: `Members Added with txHash:${result.txHash}` });
    } else {
      this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      this.msg.add({ key: 'tst', severity: 'error', summary: 'OOPS', detail: `Error Adding Members with txHash:${result.txHash}` });
    }
    

  }

  // #endregion dialogs


  //#region  HOOKS PROPOSALS INTERACTION
  async proposeValue(value: number) {
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));

    const answer = utils.parseEther(value.toString());

    const result = await doSignerTransaction(this.dapp.DAPP_STATE.contracts[+this.toUpdateReward!.id]?.pcrOptimisticOracle.instance.proposeDistribution(answer)!);
 
    if (result.success == true) {
      this.msg.add({ key: 'tst', severity: 'success', summary: 'Great!', detail: `Proposal successful sent with txHash:${result.txHash}` });
    } else {
      this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      this.msg.add({ key: 'tst', severity: 'error', summary: 'OOPS', detail: `Error Proposing value with txHash:${result.txHash}` });
    }
  }

  async disputeProposal() {
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    const result = await doSignerTransaction(this.dapp.DAPP_STATE.contracts[+this.toUpdateReward!.id]?.pcrOptimisticOracle.instance.disputeDistribution()!);
    if (result.success == true) {
      this.msg.add({ key: 'tst', severity: 'success', summary: 'Great!', detail: `Proposal Disputed with txHash:${result.txHash}` });
    } else {
      this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      this.msg.add({ key: 'tst', severity: 'error', summary: 'OOPS', detail: `Error Disputing Price with txHash:${result.txHash}` });
    }
  }

  async executeProposal() {
    /// TO dO CHAEK IF CURRENT DEPOSIT and ISSUER MEMBERs
    if (+this.toUpdateReward!.rewardAmount > +this.toUpdateReward!.currentdeposit) {
 
      this.msg.add({ key: 'tst', severity: 'warn', summary: 'OOPS',detail: `Please fund the contract with a deposit` });

      return;
    }

    if (+this.toUpdateReward!.unitsIssued <= 0) {
      this.msg.add({ key: 'tst', severity: 'warn', summary: 'OOPS',detail: `You have not yet add members` });

      return;
    }
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));

    this.dapp.DAPP_STATE.contracts[+this.toUpdateReward!.id]?.pcrOptimisticOracle.instance.on('ProposalRejected', (pcrId, proposalId, newProposalId) => {
      if (proposalId.toString() == this.currentProposal.id && pcrId.toString() == this.currentProposal.rewardId) {
        this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      }
    });

    this.dapp.DAPP_STATE.contracts[+this.toUpdateReward!.id]?.pcrOptimisticOracle.instance.on('ProposalAcceptedAndDistribuition', (pcrId, proposalId, newProposalId) => {
      if (proposalId.toString() == this.currentProposal.id && pcrId.toString() == this.currentProposal.rewardId) {
        this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      }
    });

  
     const result = await doSignerTransaction(this.dapp.DAPP_STATE.contracts[+this.toUpdateReward!.id]?.pcrOptimisticOracle.instance.executeDistribution());
 
     if (result.success == true) {
      await this.refreshBalance();
      this.msg.add({ key: 'tst', severity: 'success', summary: 'Great!', detail: `Proposal Executed Successfully  with txHash:${result.txHash}` });
    } else {
      this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      this.msg.add({ key: 'tst', severity: 'error', summary: 'OOPS', detail: `Error Executing Proposal value with txHash:${result.txHash}` });
    }


  }

  refresh() {
    this.getRewardDetails(this.toUpdateReward!.id);
  }

  //#endregion


  //#region GET AND PREPARE DATA
  async getRewardDetails(id: string) {

    this.cancelQuerySubscrition.next();

    this.graphqlService
      .watchTokens(id)
      .pipe(takeUntil(this.destroyHooks), takeUntil(this.cancelQuerySubscrition))
      .subscribe(async (data: any) => {
      
        if (data) {
          const localReward = data.data['reward'];
      
          if (localReward.admin.id == this.dapp.signerAddress!.toLocaleLowerCase()){
            this.isAdmin = true;
          } else {
            this.isAdmin = false;
          }

          if (localReward !== undefined) {
            if (this.toUpdateReward == undefined) {
              this.toUpdateReward = this.transformRewardObject(localReward);
            } else {
              this.toUpdateReward = {
                ...this.toUpdateReward,
                ...localReward,
                ...{
                  displayTargetCondition: utils.formatEther(localReward.target),
                  step: calculateStep(localReward.rewardStep, localReward.earliestNextAction),
                  displayDescription: createDisplayDescription(localReward)
                },
              };
            }
          } else {
            this.toUpdateReward = undefined;
          }
          await this.refreshBalance();

          this.currentProposal = prepareDisplayProposal(this.toUpdateReward!);
        }

        this.rewardStatus = this.toUpdateReward?.rewardStatus == '0' ? true : false;

        this.chartConfig = { id: this.toUpdateReward?.id!, priceType: +this.toUpdateReward?.priceType!, target: +this.toUpdateReward?.target! };

        await this.dapp.launchClones(this.toUpdateReward!.tokenImpl, this.toUpdateReward!.optimisticOracleImpl, +this.toUpdateReward!.id);

        this.store.dispatch(Web3Actions.chainBusy({ status: false }));
     
      });

  
  }
  transformRewardObject(reward: IPCR_REWARD) {
    reward.displayDescription = createDisplayDescription(reward);

    const displayReward = global_tokens.filter((fil) => fil.superToken == reward.rewardToken)[0];
    reward.fundToken = displayReward;
    reward.displayStep = calculateStep(+reward.rewardStep, reward.earliestNextAction);
    reward.displayTargetCondition = utils.formatEther(reward.target);
    return reward;
  }
  //#endregion

  // NAVIGATION

  createPcr() {
    this.router.navigateByUrl('create-pcr');
  }

  back() {
    this.router.navigateByUrl('home');
  }


  /// INITIALIZATION

  override async hookContractConnected(): Promise<void> {

    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    const params = this.route.snapshot.params;

    if (params['id'] !== undefined) {
      this.getRewardDetails(params['id']);
    }
  }
}
