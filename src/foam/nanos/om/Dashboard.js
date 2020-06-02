foam.CLASS({
  package: 'foam.nanos.om',
  name: 'Dashboard',
  extends: 'foam.u2.Element',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.DAOSink',
    'foam.dao.EasyDAO',
    'foam.dao.PromisedDAO',
    'foam.glang.EndOfMinute',
    'foam.glang.EndOfHour',
    'foam.glang.EndOfDay',
    'foam.glang.EndOfWeek',
    'foam.mlang.IdentityExpr',
    'foam.mlang.predicate.IsClassOf',
    'foam.nanos.analytics.Candlestick',
    'foam.u2.detail.SectionedDetailPropertyView',
    'foam.u2.layout.Cols',
    'org.chartjs.CandlestickDAOChartView',
  ],

  imports: [
    'om1minDAO',
    'omHourlyDAO',
    'omDailyDAO',
    'omNameDAO',
  ],

  css: `
    ^ {
      padding: 32px 16px;
    }

    ^ .property-account {
      display: inline-block;
      min-width: 240px;
    }

    ^ .property-timeFrame {
      display: inline-block;
    }

    ^ .property-endDate {
      padding: 0;
    }

    ^card-header-title {
      font-size: 12px;
      font-weight: 600;
      line-height: 1.5;
    }

    ^ .foam-u2-tag-Select {
      margin-left: 16px;
    }

    ^chart {
      margin-top: 32px;
    }
  `,

  messages: [
    {
      name: 'CARD_HEADER',
      message: 'OM',
    }
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.alarming.OMName',
      name: 'om',
      view: function(_, X) {
        return {
          class: 'foam.u2.view.RichChoiceView',
          sections: [
            {
              heading: 'OMs',
              dao: X.data.omNameDAO
            },
          ],
          search: true,
          searchPlaceholder: 'Search...'
        };
      }
    },
    {
      class: 'Enum',
      of: 'net.nanopay.liquidity.ui.dashboard.DateFrequency',
      name: 'timeFrame',
      value: '1min'
    },
    {
      class: 'Date',
      name: 'startDate',
      expression: function(endDate, timeFrame) {
        var startDate = endDate;
        for ( var i = 0 ; i < timeFrame.numLineGraphPoints ; i++ ) {
          startDate = timeFrame.startExpr.f(new Date(startDate.getTime() - 1));
        }
        return startDate;
      },
      preSet: function(o, n) {
        return n > new Date() ? o : n;
      },
      postSet: function(_, n) {
        var endDate = n || new Date();
        for ( var i = 0 ; i < this.timeFrame.numBarGraphPoints ; i++ ) {
          endDate = this.timeFrame.endExpr.f(new Date(endDate.getTime() + 1));
        }
        this.endDate = endDate;
      }
    },
    {
      class: 'Date',
      name: 'endDate',
      visibility: 'RO',
      view: { class: 'foam.u2.DateView' }, // Override ModeAltView
      factory: function() { return new Date(); },
      preSet: function(o, n) {
        n = n || new Date();
        if ( n > new Date() ) return o;
        return this.timeFrame.endExpr.f(n.getTime() > Date.now() ? new Date() : n);
      }
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'aggregatedDAO',
      factory: function() {
        return foam.dao.NullDAO.create({ of: this.Candlestick });
      }
    },
    {
      class: 'Map',
      name: 'config',
      factory: function() {
        // WIP
        return {
          type: 'line',
          options: {
            scales: {
              xAxes: [{
                type: 'time',
                bounds: 'ticks',
                time: {
                  round: true,
                  displayFormats: {
                    millisecond: 'll',
                    second: 'll',
                    minute: 'll',
                    hour: 'll',
                    day: 'll',
                    week: 'll',
                    month: 'll',
                    quarter: 'll',
                    year: 'll'
                  }
                },
                distribution: 'linear'
              }]
            }
          }
        }
      }
    },
    {
      class: 'Map',
      name: 'styling',
      value: {}
    }
  ],

  reactions: [
    ['', 'propertyChange.startDate', 'updateAggregatedDAO'],
    ['', 'propertyChange.endDate', 'updateAggregatedDAO'],
    ['', 'propertyChange.om', 'updateAggregatedDAO'],
    ['', 'propertyChange.timeFrame', 'updateAggregatedDAO'],
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start(this.Cols)
          .style({ 'align-items': 'center' })
          .start()
            .add(this.CARD_HEADER)
            .addClass(this.myClass('card-header-title'))
           .end()
          .start(this.Cols)
            .startContext({ data: this })
              .add(this.OMNAME)
              .add(this.TIME_FRAME)
            .endContext()
          .end()
        .end()
        .start()
          .style({ 'height': '550px' })
          .addClass(this.myClass('chart'))
          .add(this.DashboardChart.create({
            data: this.aggregatedDAO$proxy,
            config$: this.config$,
            customDatasetStyling$: this.styling$,
            startDate$: this.startDate$,
            endDate$: this.endDate$
          }))
        .end()
        .start(this.Cols)
          .tag(this.SectionedDetailPropertyView, {
            data: this,
            prop: this.START_DATE
          })
          .tag(this.SectionedDetailPropertyView, {
            data: this,
            prop: this.END_DATE
          })
        .end();
    }
  ],

  listeners: [
    {
      name: 'updateAggregatedDAO',
      isFramed: true,
      code: function() {
        this.aggregatedDAO = ( this.account && this.timeFrame ) ?
          this.PromisedDAO.create({
            of: this.Candlestick,
            promise: new Promise(async function(resolve) {

              var dao = this.EasyDAO.create({
                of: this.Candlestick,
                daoType: 'MDAO'
              });
              var sink = this.DAOSink.create({ dao: dao });

              await this['om' + this.timeFrame.label + 'CandlestickDAO']
                .where(this.AND(
                  this.GTE(this.Candlestick.CLOSE_TIME, this.startDate),
                  this.LTE(this.Candlestick.CLOE_TIME, this.endDate),
                  this.EQ(this.Candlestick.KEY, om.name)
                ))
                .select(sink);

              resolve(dao);
              return;
            }.bind(this))
          }) : undefined;
      }
    },
    {
      name: 'updateStyling',
      isFramed: true,
      code: async function() {
        var a = await this.om$find;
        if ( ! a ) return;

        // var c = await this.currencyDAO.find(a.denomination)

        // this.config.options.scales.yAxes = [{
        //     ticks: {
        //       callback: function(v) {
        //         return `${c.format(v)}`;
        //       }
        //     }
        // }];
        // this.config.options.tooltips = {
        //   displayColors: false,
        //   callbacks: {
        //     label: function(v) {
        //       return `${c.format(v.yLabel)}`;
        //     }
        //   }
        // };

        var unit = 'minute';
        switch ( this.timeFrame ) {
          case this.DateFrequency.ONE_MINUTE:
            unit = 'minute';
            break;
          case this.DateFrequency.HOURLY:
            unit = 'hour';
            break;
          case this.DateFrequency.DAILY:
            unit = 'daily';
            break;
          default:
            unit = 'hour';
        }

        var xAxesMap = this.config.options.scales.xAxes[0];
        xAxesMap.time.unit = unit;
        xAxesMap.bounds = 'ticks';

        var style = {};
        style[a.name] = {
          lineTension: 0,
          borderColor: ['#406dea'],
          backgroundColor: 'rgba(0, 0, 0, 0.0)',
          label: `${a.name}`
        };
        this.styling = style;
      }
    }
  ]
});
