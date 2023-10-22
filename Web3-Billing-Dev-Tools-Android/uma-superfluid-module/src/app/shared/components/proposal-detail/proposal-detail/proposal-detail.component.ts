import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { utils } from 'ethers';
import { calculateStep } from 'src/app/shared/helpers/helpers';
import { IPROPOSAL, REWARD_STEP } from 'src/app/shared/models/pcr';

@Component({
  selector: 'proposal-detail',
  templateUrl: './proposal-detail.component.html',
  styleUrls: ['./proposal-detail.component.scss']
})
export class ProposalDetailComponent implements OnChanges {

  stepItems: { label: string }[];
  activeStep = 0;
  display_step!: REWARD_STEP;
  startProposePeriod:any;
  startLivenessPeriod!: string;
  startExecutionPeriod!: string;
  priceProposed!: string;

  toProposeKpiAmountCtrl = new FormControl(0,Validators.required);

  constructor() { 
    this.stepItems = [
      {label: 'Qualifying'},
      {label: 'Propose Period'},
      {label: 'Liveness Period'},
      {label: 'Execution Period'},
  ];
  }

  @Input()  public proposal!: IPROPOSAL;
  @Output() private proposeValue = new EventEmitter<number>();
  @Output() private executeProposal = new EventEmitter();
  @Output() private disputeProposal = new EventEmitter();
  @Output() private refresh = new EventEmitter();

  ngOnChanges(changes: SimpleChanges): void {
     this.display_step = calculateStep(+this.proposal.step,this.proposal.earliestNextAction)
   

    if (this.display_step == 0) {
      this.startProposePeriod = new Date (this.proposal.earliestNextAction * 1000).toLocaleString();
    } else {
      //// DISPLAY PROPOSAL VALUES
      this.startProposePeriod = new Date ((+this.proposal.startQualifying + +this.proposal.interval ) * 1000).toLocaleString();
      
   

      if (this.proposal.priceType == 0){
        this.priceProposed = +this.proposal.priceProposed == (1*10**18) ? "Yes" :"No";
      } else {
        this.priceProposed = utils.formatEther(this.proposal.priceProposed);
      }
      


      this.startLivenessPeriod = new Date( + this.proposal.startLivenessPeriod! * 1000).toLocaleString();


      this.startExecutionPeriod = new Date( (+this.proposal.startLivenessPeriod + +this.proposal.optimisticOracleLivenessTime)*1000).toLocaleString()
    }

    this.activeStep = this.display_step;
 
  }

  doDispute() {
    this.disputeProposal.emit();
  }


  doProposeValue() {
    const value = this.toProposeKpiAmountCtrl.value;
    this.proposeValue.emit(value);
  }

  doProposeAnswer(value:number){
    this.proposeValue.emit(value);
  }

  doExecuteProposal(){
    this.executeProposal.emit();
  }

  doRefresh(){
    this.refresh.emit()
  }

}
