/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.om',
  name: 'OMDashboard',
  extends: 'foam.u2.Element',

  implements: [
    'foam.mlang.Expressions'
  ],

  requires: [
    'foam.dao.DAOSink',
    'foam.dao.EasyDAO',
    'foam.dao.PromisedDAO',
    'foam.glang.EndOf1Minute',
    'foam.glang.EndOf5Minute',
    'foam.glang.EndOfDay',
    'foam.glang.EndOfWeek',
    'foam.mlang.IdentityExpr',
    'foam.mlang.predicate.IsClassOf',
    'foam.nanos.analytics.Candlestick',
    'foam.nanos.alarming.OMName',
    'foam.nanos.om.OMDashboardCountChart',
    'foam.nanos.om.OMFrequency',
    'foam.u2.detail.SectionedDetailPropertyView',
    'foam.u2.layout.Cols',
    'org.chartjs.CandlestickDAOChartView',
  ],

  imports: [
    'omNameDAO',
    'om1MinuteDAO',
    'om5MinuteDAO',
    'omHourlyDAO',
    'omDailyDAO'
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
    // {
    //   name: 'LABEL_HIGH_THRESHOLD',
    //   message: 'High Threshold'
    // },
    // {
    //   name: 'LABEL_LOW_THRESHOLD',
    //   message: 'Low Threshold'
    // },
    {
      name: 'CARD_HEADER',
      message: 'OM',
    // },
    // {
    //   name: 'LABEL_DISCLAIMER',
    //   message: 'A future date will not be reflected on the graph'
    }
  ],

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.alarming.OMName',
      name: 'omName',
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
      of: 'foam.nanos.om.OMFrequency',
      name: 'timeFrame',
      value: 'FiveMinute'
    },
    {
      class: 'Date',
      name: 'startDate',
      expression: function(endDate, timeFrame) {
        var startDate = endDate;
        for ( var i = 0; i < timeFrame.numBarGraphPoints; i++ ) {
          startDate = timeFrame.startExpr.f(new Date(startDate.getTime() - timeFrame.frequencyIncrement));
        }
        //var startDate = timeFrame.startExpr.f(endDate);
        return startDate;
      },
      preSet: function(o, n) {
        return n > new Date() ? o : n;
      },
      postSet: function(_, n) {
        var endDate = n || new Date();
        for ( var i = 0; i < this.timeFrame.numBarGraphPoints; i++ ) {
          endDate = this.timeFrame.endExpr.f(new Date(endDate.getTime() + timeFrame.frequencyIncrement));
        }
        //endDate = this.timeFrame.endExpr.f(n);
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
        var d = this.timeFrame.endExpr.f(n.getTime() > Date.now() ? new Date() : n);
        return d;
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
        };
      }
    },
    {
      class: 'Map',
      name: 'styling',
      value: {}
    }
  ],

  reactions: [
    ['', 'propertyChange.aggregatedDAO', 'updateStyling'],
    ['', 'propertyChange.startDate', 'updateAggregatedDAO'],
    ['', 'propertyChange.endDate', 'updateAggregatedDAO'],
    ['', 'propertyChange.omName', 'updateAggregatedDAO'],
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
              .add(this.OM_NAME)
              .add(this.TIME_FRAME)
            .endContext()
          .end()
        .end()
        .start()
          .style({ 'height': '550px' })
          .addClass(this.myClass('chart'))
          .add(this.OMDashboardCountChart.create({
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
        this.aggregatedDAO = ( this.omName && this.timeFrame ) ?
          this.PromisedDAO.create({
            of: this.Candlestick,
            promise: new Promise(async function(resolve) {

              var dao = this.EasyDAO.create({
                of: this.Candlestick,
                daoType: 'MDAO'
              });
              var sink = this.SEQ(this.COUNT(), this.DAOSink.create({ dao: dao }));

              sink = await this['om'+this.timeFrame.label+'DAO']
                .where(this.AND(
                  this.GTE(this.Candlestick.CLOSE_TIME, this.startDate),
                  this.LTE(this.Candlestick.CLOSE_TIME, this.endDate),
                  this.EQ(this.Candlestick.KEY, this.omName)
                ))
                .select(sink);

              let count = sink && sink.args[0];
              console.debug('count', count && count.value);
              resolve(dao);
            }.bind(this))
          }) : undefined;
      }
    },
    {
      name: 'updateStyling',
      isFramed: true,
      code: async function() {
        // var a = await this.omName$find;
        // if ( ! a ) return;

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

        var unit = '5Minute';
        switch ( this.timeFrame ) {
        case this.OMFrequency.OneMinute:
            unit = '1min';
            break;
        case this.OMFrequency.FiveMinute:
            unit = '5min';
            break;
          case this.OMFrequency.Hourly:
            unit = 'hourly';
            break;
          case this.OMFrequency.Daily:
            unit = 'daily';
            break;
          default:
            unit = '5min';
        }

        var xAxesMap = this.config.options.scales.xAxes[0];
        xAxesMap.time.unit = unit;
        xAxesMap.bounds = 'ticks';

        var style = {};
        // style[a.id] = {
        //   lineTension: 0,
        //   borderColor: ['#406dea'],
        //   backgroundColor: 'rgba(0, 0, 0, 0.0)',
        //   label: `[${a.denomination}] ${a.name}`
        // }
        this.styling = style;
      }
    }
  ]
});
