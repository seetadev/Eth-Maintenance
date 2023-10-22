import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DappBaseComponent, DappInjector, global_tokens, Web3Actions } from 'angular-web3';
import { utils } from 'ethers';
import { MessageService } from 'primeng/api';
import { takeUntil } from 'rxjs';
import { GraphQlService } from 'src/app/dapp-injector/services/graph-ql/graph-ql.service';
import { calculateStep } from 'src/app/shared/helpers/helpers';
import { IPCR_REWARD } from 'src/app/shared/models/pcr';

@Component({
  selector: 'upcoming-rewards',
  templateUrl: './upcoming-rewards.component.html',
  styleUrls: ['./upcoming-rewards.component.scss']
})
export class UpcomingRewardsComponent extends DappBaseComponent implements OnInit {
  pcrTokens: Array<IPCR_REWARD> = [];
  utils = utils
  constructor(
    private msg: MessageService,
    private router: Router, dapp: DappInjector, store: Store, private graphqlService: GraphQlService) {
    super(dapp,store)
   }


  transformRewardObject(reward: IPCR_REWARD) {


    reward.displayDate = new Date(+reward.earliestNextAction * 1000).toLocaleString()
    const displayReward = global_tokens.filter((fil) => fil.superToken == reward.rewardToken)[0];
    reward.fundToken = displayReward;
    reward.displayStep = calculateStep(+reward.rewardStep,+reward.earliestNextAction);
    return reward;
  }



  async getTokens() {

    this.pcrTokens = [];
   
   const val =  await this.graphqlService.queryUpcomingRewards()
  
      if (!!val && !!val.data && !!val.data.rewards) {
      
        const localTokens = val.data.rewards;;
        if (localTokens !== undefined) {
          localTokens.forEach((each: any) => {
            const availableTokenIndex = this.pcrTokens.map((fil) => fil.id).indexOf(each.id);
            if (availableTokenIndex == -1) {
              this.pcrTokens.push(this.transformRewardObject(each));
            } else {
              this.pcrTokens[availableTokenIndex] = { ...this.pcrTokens[availableTokenIndex], ...each, ...{ step: calculateStep(+each.rewardStep,+each.earliestNextAction) } };
            }
          });
        } else {
          this.pcrTokens = [];
        }

      }

    this.store.dispatch(Web3Actions.chainBusy({ status: false }));
  }

  goDetailsToken(reward:IPCR_REWARD){

    if (this.blockchain_status !== 'wallet-connected') {
      this.msg.add({ key: 'tst', severity: 'warn', summary: 'OOPS',detail: `Please Connect Your Wallet` });

      return
    }

    this.router.navigateByUrl(`details-pcr/${reward.id}`)
   }

  ngOnInit(): void {
    this.getTokens()
  }

}
