import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { utils } from 'ethers';
import { GraphQlService } from 'src/app/dapp-injector/services/graph-ql/graph-ql.service';

@Component({
  selector: 'charts-pcr',
  templateUrl: './charts.component.html',
  styleUrls: ['./charts.component.scss'],
})
export class ChartsComponent implements OnChanges {
  showDistributionChart = false;
  showIndexChart = false;
  chartData!: any;
  chartOptions: any;

  distributionsTargetChartOptions: any;
  distributionsYesNoChartOptions: any;
  distributionsChartData: any;

  constructor(private graphqlService: GraphQlService, private cd: ChangeDetectorRef) {
    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#ebedef',
          },
        },
      },
      scales: {
        x: {
          reverse: true,
          offset: true,
          ticks: {
            color: '#ebedef',
          },
          grid: {
            color: 'rgba(160, 167, 181, .3)',
          },
        },
        A: {
          id: 'A',
          type: 'linear',
          position: 'left',
          min: 0,
          ticks: {
            beginAtZero: true,
            color: '#ebedef',
            suggestedMin: 0,
            min: 0,
            callback: (label:number) => `$ ${(+label/10**18)}`,
          },
        },
        B: {
          type: 'linear',
          position: 'right',
          display: true,
          min: 0,
          ticks: {
            min: 0,
            beginAtZero: true,
            color: '#00bb7e',
            suggestedMin: 0,
            callback: (label:number) => `$ ${(+label/10**18)}`,
          },
        },

        // y: {
        //   ticks: {
        //     color: '#ebedef',
        //   },
        //   grid: {
        //     color: 'rgba(160, 167, 181, .3)',
        //   },
        // },
      },
    };

    this.distributionsYesNoChartOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#ebedef',
          },
        },
      },
      scales: {
        x: {
          reverse: true,
          offset: true,
          display: true,
          ticks: {
            color: '#ebedef',
          },
          grid: {
            color: 'rgba(160, 167, 181, .3)',
          },
        },
        y: {
          id: 'A',
          display: false,
          type: 'linear',
          position: 'left',
          min: 0,
          ticks: {
            beginAtZero: true,
            color: '#ebedef',
            suggestedMin: 0,
            min: 0,
          },
        },

        // y: {
        //   ticks: {
        //     color: '#ebedef',
        //   },
        //   grid: {
        //     color: 'rgba(160, 167, 181, .3)',
        //   },
        // },
      },
    };

    this.distributionsTargetChartOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#ebedef',
          },
        },
      },
      scales: {
        x: {
          reverse: true,
          offset: true,
          display: true,
          ticks: {
            color: '#ebedef',
          },
          grid: {
            color: 'rgba(160, 167, 181, .3)',
          },
        },
        y: {
          id: 'A',
          display: true,
          type: 'linear',
          position: 'left',
          min: 0,
          ticks: {
            beginAtZero: true,
            color: '#ebedef',
            suggestedMin: 0,
            min: 0,
            callback: (label:number) => `$ ${(+label/10**18)}`,
          },
        },

        // y: {
        //   ticks: {
        //     color: '#ebedef',
        //   },
        //   grid: {
        //     color: 'rgba(160, 167, 181, .3)',
        //   },
        // },
      },
    };
  }

  @Input() chartConfig!: { id: string; priceType: number; target: number };

  ngOnChanges(changes: SimpleChanges): void {
    this.prepareCharts();
  }

  async prepareCharts() {
    if (this.chartConfig!.priceType == 1) {
      this.distributionsChartData = {
        labels: [],
        datasets: [
          {
            label: 'KPI evaluation',
            data: [],
            fill: false,
            backgroundColor: '#2f4860',
            borderColor: '#2f4860',
            tension: 0.4,
          },
          {
            label: 'Target',
            data: [],
            fill: false,
            backgroundColor: 'green',
            borderColor: 'green',
            tension: 0.4,
          },
        ],
      };
    } else {
      this.distributionsChartData = {
        labels: [],
        datasets: [
          {
            label: 'Distribution Success',
            data: [],
            fill: '#00bb7e',
            backgroundColor: '#00bb7e',
            borderColor: '#00bb7e',
            tension: 0.4,
          },
        ],
      };
    }

    ///////// DISTRIBUTIONS SUMMARY
    const dataProposal = await this.graphqlService.queryProposals(this.chartConfig!.id);

    if (dataProposal && dataProposal.data) {
      const proposalChart = [];
      const targetChart = [];

      const localProposals = dataProposal.data['proposals'] as Array<any>;
      for (let item of localProposals.filter((fil) => fil.status !== 'Pending')) {
        this.distributionsChartData.labels.push(new Date(item.timeStamp * 1000).toLocaleDateString());
        if (this.chartConfig!.priceType == 0) {
          let value = item.status == 'Accepted' ? 1 : 0;
          proposalChart.push(value);
        } else if (this.chartConfig!.priceType == 1) {
          proposalChart.push(item.priceProposed);
          console.log(+this.chartConfig!.target);
          targetChart.push(+this.chartConfig!.target);
        }
      }

      if (proposalChart.length > 0) {
        this.showDistributionChart = true;
      }
      this.distributionsChartData.datasets[0].data = proposalChart;
      if (this.chartConfig!.priceType == 1) {
        this.distributionsChartData.datasets[1].data = targetChart;
      }

      this.distributionsChartData = Object.assign({}, this.distributionsChartData);
    }

    ///////// INDEX SUMMARY

    this.chartData = {
      labels: [],
      datasets: [
        {
          label: 'Index Evolution tokens/unit',
          data: [],
          fill: false,
          backgroundColor: '#2f4860',
          borderColor: '#2f4860',
          tension: 0.4,
          yAxisID: 'A',
        },
        {
          label: 'Reward Total Amount',
          data: [],
          fill: false,
          backgroundColor: '#00bb7e',
          borderColor: '#00bb7e',
          tension: 0.4,
          yAxisID: 'B',
        },
      ],
    };

    const data = await this.graphqlService.queryIndexes(this.chartConfig!.id);

    if (data) {
      const dataChart = [];
      const amountChart = [];
      const localIndexes = data.data['rewardIndexHistories'] as Array<any>;
      for (let item of localIndexes) {
        this.chartData.labels.push(new Date(item.timeStamp * 1000).toLocaleDateString());
        dataChart.push(+item.index);

        amountChart.push(+item.rewardAmount);
      }

      if (dataChart.length > 0) {
        this.showIndexChart = true;
      }
      this.chartData.datasets[0].data = dataChart;
      this.chartData.datasets[1].data = amountChart;
      this.chartData = Object.assign({}, this.chartData);
    }
    this.cd.detectChanges();
  }

  ngOnInit(): void {}
}
