/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'org.chartjs.demos',
  name: 'Benchmark',

  requires: [
    'foam.dao.MDAO',
    'foam.nanos.analytics.Candlestick'
  ],

  properties :[
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      factory: function() {
        return this.MDAO.create({ of: this.Candlestick });
      },
      view: {
        class: 'foam.u2.MultiView',
        views: [
          {
            class: 'foam.u2.TableView'
          },
          {
            class: 'org.chartjs.ChartCView'
          }
        ]
      }
    }
  ],

  actions: [
    {
      name: 'generateData',
      code: function() {
        this.dao.put(this.Candlestick.create({
          key: 'String',
          openTime: new Date(),
          total: 200,
          count: 20
        }));
      }
    }
  ]
});
