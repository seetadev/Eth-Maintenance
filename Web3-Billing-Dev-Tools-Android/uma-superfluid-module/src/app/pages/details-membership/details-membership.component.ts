import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { IWeb3Subscription } from '@superfluid-finance/sdk-core';
import { DappBaseComponent, DappInjector, global_tokens, Web3Actions } from 'angular-web3';
import { Contract, utils } from 'ethers';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { doSignerTransaction } from 'src/app/dapp-injector/classes/transactor';

import { GraphQlService } from 'src/app/dapp-injector/services/graph-ql/graph-ql.service';
import { SuperFluidServiceService } from 'src/app/dapp-injector/services/super-fluid/super-fluid-service.service';
import { calculateStep, createDisplayDescription, createERC20Instance, createSuperTokenInstance, prepareDisplayProposal } from 'src/app/shared/helpers/helpers';
import { IPCR_REWARD, IPROPOSAL } from 'src/app/shared/models/pcr';

export enum REWARD_STEP {
  QUALIFYING,
  AWAITING_PROPOSAL,
  LIVENESS_PERIOD,
  AWAITING_EXECUTION,
}

@Component({
  selector: 'details-membership',
  templateUrl: './details-membership.component.html',
  styleUrls: ['./details-membership.component.scss'],
})
export class DetailsMembershipComponent extends DappBaseComponent {
  utils = utils;

  toUpdateMembership: any | undefined = undefined;

  //// FormControls
  toFundAmountCtrl = new FormControl(0, Validators.required);
  adressesCtrl = new FormControl('', [Validators.required, Validators.minLength(32), Validators.maxLength(32)]);

  activeStep = 0;

  currentProposal!: IPROPOSAL;

  idaMembership!: IWeb3Subscription;

  chartConfig!: { id: string; priceType: number; target: number };

  public cancelQuerySubscrition: Subject<void> = new Subject();

  constructor(
    private msg: MessageService,
    private router: Router,
    private superFluidService: SuperFluidServiceService,
    private route: ActivatedRoute,
    dapp: DappInjector,
    store: Store,
    private graphqlService: GraphQlService
  ) {
    super(dapp, store);
  }

  async refreshBalance() {
    const superToken = createSuperTokenInstance(this.toUpdateMembership!.fundToken.superToken, this.dapp.signer!);
    const balanceSupertoken = await superToken.realtimeBalanceOfNow(this.dapp.signerAddress);

    this.toUpdateMembership!.fundToken.superTokenBalance = utils.formatEther(balanceSupertoken[0]).substring(0, 6);

    const rewardToken = createERC20Instance(this.toUpdateMembership!.fundToken.rewardToken, this.dapp.signer!);
    const balanceRewardToken = await rewardToken.balanceOf(this.dapp.signerAddress);

    this.toUpdateMembership!.fundToken.rewardTokenBalance = utils.formatEther(balanceRewardToken).substring(0, 6);
  }

  //#region  SUBSCRIPTION ACTIONS //////
  async approveMembership() {
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));

    try {
      await this.superFluidService.approveSubscription(this.toUpdateMembership.fundToken.superToken, +this.toUpdateMembership!.id);

      await this.refresh();
      this.msg.add({ key: 'tst', severity: 'success', summary: 'Done!', detail: `Subscription Approved` });
    } catch (error) {
      this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      this.msg.add({ key: 'tst', severity: 'error', summary: 'OOPS', detail: `Error Approving the subscription` });
    }
  }

  async cancelMembership() {
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    try {
      await this.superFluidService.cancelSubscription(this.toUpdateMembership.fundToken.superToken, +this.toUpdateMembership!.id);

      await this.refresh();
      this.msg.add({ key: 'tst', severity: 'success', summary: 'Done!', detail: `Subscription Cancelled` });
    } catch (error) {
      this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      this.msg.add({ key: 'tst', severity: 'error', summary: 'OOPS', detail: `Error Cancelling the subscription` });
    }
  }

  async claim() {
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    try {
      await this.superFluidService.claimSubscription(this.toUpdateMembership.fundToken.superToken, +this.toUpdateMembership!.id);

      await this.refresh();
      this.msg.add({ key: 'tst', severity: 'success', summary: 'Done!', detail: `Subscription Claimed` });
    } catch (error) {
      this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      this.msg.add({ key: 'tst', severity: 'error', summary: 'OOPS', detail: `Error Claiming the subscription` });
    }
  }
  //#endregion

  //#region  HOOKS PROPOSALS INTERACTION
  async proposeValue(value: number) {
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));

    const answer = utils.parseEther(value.toString());

    const result = await doSignerTransaction(this.dapp.DAPP_STATE.contracts[+this.toUpdateMembership!.id]?.pcrOptimisticOracle.instance.proposeDistribution(answer)!);

    if (result.success == true) {
      this.msg.add({ key: 'tst', severity: 'success', summary: 'Great!', detail: `Proposal successful sent with txHash:${result.txHash}` });
    } else {
      this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      this.msg.add({ key: 'tst', severity: 'error', summary: 'OOPS', detail: `Error Proposing value with txHash:${result.txHash}` });
    }
  }

  async disputeProposal() {
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    const result = await doSignerTransaction(this.dapp.DAPP_STATE.contracts[+this.toUpdateMembership!.id]?.pcrOptimisticOracle.instance.disputeDistribution()!);
    if (result.success == true) {
      this.msg.add({ key: 'tst', severity: 'success', summary: 'Great!', detail: `Proposal Disputed with txHash:${result.txHash}` });
    } else {
      this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      this.msg.add({ key: 'tst', severity: 'error', summary: 'OOPS', detail: `Error Disputing Price with txHash:${result.txHash}` });
    }
  }

  async executeProposal() {
    /// TO dO CHAEK IF CURRENT DEPOSIT and ISSUER MEMBERs
    if (+this.toUpdateMembership!.rewardAmount > +this.toUpdateMembership!.currentdeposit) {
      this.msg.add({ key: 'tst', severity: 'warn', summary: 'OOPS', detail: `Please fund the contract with a deposit` });

      return;
    }

    if (+this.toUpdateMembership!.unitsIssued <= 0) {
      this.msg.add({ key: 'tst', severity: 'warn', summary: 'OOPS', detail: `You have not yet add members` });

      return;
    }
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));

    this.dapp.DAPP_STATE.contracts[+this.toUpdateMembership!.id]?.pcrOptimisticOracle.instance.on('ProposalRejected', (pcrId, proposalId, newProposalId) => {
      if (proposalId.toString() == this.currentProposal.id && pcrId.toString() == this.currentProposal.rewardId) {
        this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      }
    });

    this.dapp.DAPP_STATE.contracts[+this.toUpdateMembership!.id]?.pcrOptimisticOracle.instance.on('ProposalAcceptedAndDistribuition', (pcrId, proposalId, newProposalId) => {
      if (proposalId.toString() == this.currentProposal.id && pcrId.toString() == this.currentProposal.rewardId) {
        this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      }
    });

    const result = await doSignerTransaction(this.dapp.DAPP_STATE.contracts[+this.toUpdateMembership!.id]?.pcrOptimisticOracle.instance.executeDistribution());

    if (result.success == true) {
      await this.refreshBalance();
      this.msg.add({ key: 'tst', severity: 'success', summary: 'Great!', detail: `Proposal Executed Successfully  with txHash:${result.txHash}` });
    } else {
      this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      this.msg.add({ key: 'tst', severity: 'error', summary: 'OOPS', detail: `Error Executing Proposal value with txHash:${result.txHash}` });
    }
  }

  refresh() {
  
    this.getMembershipDetails(this.dapp.signerAddress!.toLowerCase() +  this.toUpdateMembership!.id);
  }

  //#endregion

  /// navigation
  back() {
    this.router.navigateByUrl('home');
  }

  //#region GET AND PREPARE DATA
  async getMembershipDetails(id: string) {

    this.cancelQuerySubscrition.next();
    this.graphqlService
      .watchMemberships(id)
      .pipe(takeUntil(this.destroyHooks), takeUntil(this.cancelQuerySubscrition))
      .subscribe(async (data: any) => {
      
        if (data) {
          let localmembership = data.data['userMembership'];

          if (localmembership !== undefined) {
            let membership = { ...localmembership.reward, ...{ units: localmembership.units } };

            if (this.toUpdateMembership == undefined) {
              this.toUpdateMembership = this.transformRewardObject(membership);
            } else {
              this.toUpdateMembership = {
                ...this.toUpdateMembership,
                ...membership,
                ...{
                  displayDescription: createDisplayDescription(membership),
                  step: calculateStep(membership.rewardStep, membership.earliestNextAction),
                },
              };
            }
          } else {
            this.toUpdateMembership = undefined;
          }
          await this.refreshBalance();

          this.currentProposal = prepareDisplayProposal(this.toUpdateMembership!);
        }

        await this.dapp.launchClones(this.toUpdateMembership!.tokenImpl, this.toUpdateMembership!.optimisticOracleImpl, +this.toUpdateMembership!.id);

        this.idaMembership = await this.superFluidService.getSubscription(this.toUpdateMembership.fundToken.superToken, +this.toUpdateMembership!.id);

       

        this.chartConfig = { id: this.toUpdateMembership?.id!, priceType: +this.toUpdateMembership?.priceType, target: +this.toUpdateMembership?.target! };

        this.store.dispatch(Web3Actions.chainBusy({ status: false }));
      });

    this.store.dispatch(Web3Actions.chainBusy({ status: false }));
  }

  transformRewardObject(reward: IPCR_REWARD) {
    reward.displayDescription = createDisplayDescription(reward);

    const displayReward = global_tokens.filter((fil) => fil.superToken == reward.rewardToken)[0];
    reward.fundToken = displayReward;
    reward.displayStep = calculateStep(+reward.rewardStep, reward.earliestNextAction);

    return reward;
  }
  //#endregion

  override async hookContractConnected(): Promise<void> {
    //this.getTokens();
    this.store.dispatch(Web3Actions.chainBusy({ status: true }));
    const params = this.route.snapshot.params;

    if (params['id'] !== undefined) {
      this.getMembershipDetails(params['id']);
    }
  }
}
