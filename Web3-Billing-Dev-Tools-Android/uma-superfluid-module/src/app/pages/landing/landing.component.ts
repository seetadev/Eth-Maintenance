import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AngularContract, DappBaseComponent, DappInjector } from 'angular-web3';
import { GraphQlService } from 'src/app/dapp-injector/services/graph-ql/graph-ql.service';

import { PcrOptimisticOracle } from 'src/assets/contracts/interfaces/PcrOptimisticOracle';


@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
})
export class LandingComponent extends DappBaseComponent {
  pcrOptimisticOracleContract!: AngularContract<PcrOptimisticOracle>
  constructor(private router: Router, store: Store, dapp: DappInjector, private graphqlService:GraphQlService) {
    super(dapp, store);

   
  }







  override async hookContractConnected(): Promise<void> {
    // this.pcrOptimisticOracleContract = this.dapp.DAPP_STATE.pcrOptimisticOracleContract!;
  
    // console.log(this.pcrOptimisticOracleContract)

    // this.pcrOptimisticOracleContract.instance.on('RewardDeposit',(args1,args2)=> {
    //     console.log(args1, args2)
    // })
   // this.router.navigate(['home'])

  }
}
