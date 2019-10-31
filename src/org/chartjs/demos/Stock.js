/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'org.chartjs.demos',
  name: 'Stock',
  requires: [
    'foam.dao.EasyDAO',
    'foam.graphics.CView',
    'foam.graphics.EasyPieGraph',
    'foam.graphics.PieGraph2',
    'foam.graphics.PieGraphLabels',
    'foam.u2.DetailView',
    'org.chartjs.Pie',
  ],
  implements: [
    'foam.mlang.Expressions',
  ],
  properties: [
    {
      class: 'Boolean',
      name: 'autoAddRandomOrder',
      postSet: function() { this.maybeAddRandomOrder() },
    },
    {
      class: 'Boolean',
      name: 'autoAddRandomSnapshots',
      postSet: function() { this.maybeAddRandomSnapshots() },
    },
    {
      name: 'plottedStockPrices',
      view: {
        class: 'org.chartjs.demos.ConfigurableChartView',
        view: 'org.chartjs.Line',
      },
      factory: function() {
        var sink = this.GROUP_BY(
          this.StockPriceSnapshot.SYMBOL,
          this.PLOT(
            this.StockPriceSnapshot.DATE,
            this.StockPriceSnapshot.PRICE));
        this.stockPriceSnapshotDAO.listen(sink);
        return sink;
      },
    },
    {
      name: 'stockPrices',
      view: {
        class: 'org.chartjs.demos.ConfigurableChartView',
        view: 'org.chartjs.Line',
      },
      factory: function() {
        var sink = this.GROUP_BY(
          this.StockPriceSnapshot.SYMBOL,
          this.GROUP_BY(
            this.StockPriceSnapshot.DATE,
            this.SUM(this.StockPriceSnapshot.PRICE)));
        this.stockPriceSnapshotDAO.listen(sink);
        return sink;
      },
    },
    {
      name: 'totalHoldings',
      view: {
        class: 'org.chartjs.demos.ConfigurableChartView',
        view: 'org.chartjs.Bar',
      },
      factory: function() {
        var sink = this.GROUP_BY(this.StockOrder.SYMBOL, this.SUM(this.StockOrder.SHARES));
        this.stockOrderDAO.listen(sink);
        return sink;
      },
    },
    {
      name: 'holdingsByPersonPie',
      view: {
        class: 'org.chartjs.demos.ConfigurableChartView',
        view: 'org.chartjs.Pie',
      },
      factory: function() {
        var sink = this.GROUP_BY(
          this.StockOrder.SYMBOL,
          this.GROUP_BY(
            this.StockOrder.PERSON,
            this.SUM(this.StockOrder.SHARES)));
        this.stockOrderDAO.listen(sink);
        return sink;
      },
    },
    {
      name: 'holdingsByPersonBar',
      view: {
        class: 'org.chartjs.demos.ConfigurableChartView',
        view: 'org.chartjs.Bar',
      },
      expression: function(holdingsByPersonPie) {
        return holdingsByPersonPie;
      },
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'stockOrderDAO',
      factory: function() {
        return this.EasyDAO.create({
          of: this.StockOrder,
          daoType: 'MDAO',
          seqNo: true,
        });
      },
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'stockPriceSnapshotDAO',
      factory: function() {
        return this.EasyDAO.create({
          of: this.StockPriceSnapshot,
          daoType: 'MDAO',
          seqNo: true,
        });
      },
    },
    {
      class: 'StringArray',
      name: 'personNames',
      factory: function() {
        return [
          'Adam',
          'Mike',
          'Kevin',
        ];
      },
    },
    {
      class: 'StringArray',
      name: 'stockSymbols',
      factory: function() {
        return [
          'AMZN',
          'GOOG',
          'JNUG',
          'NFLX',
          'TSLA',
        ];
      },
    },
    {
      class: 'Date',
      name: 'date',
      factory: function() { return new Date() },
    },
  ],
  classes: [
    {
      name: 'StockPriceSnapshot',
      properties: [
        { name: 'id' },
        { class: 'Date', name: 'date' },
        { class: 'String', name: 'symbol' },
        { class: 'UnitValue', name: 'price' },
      ]
    },
    {
      name: 'StockOrder',
      properties: [
        { name: 'id' },
        { class: 'String', name: 'symbol' },
        {
          class: 'String',
          name: 'person',
          chartJsFormatter: function(v) {
            return v + '!'
          },
        },
        { class: 'UnitValue', name: 'pricePerShare' },
        {
          class: 'Int',
          name: 'shares',
          chartJsFormatter: function(v) {
            return v + ' shares'
          },
        },
      ]
    },
  ],
  listeners: [
    {
      name: 'maybeAddRandomOrder',
      isMerged: true,
      mergeDelay: 500,
      code: function() {
        if ( ! this.autoAddRandomOrder ) return;
        this.addRandomOrder();
        this.maybeAddRandomOrder();
      },
    },
    {
      name: 'maybeAddRandomSnapshots',
      isMerged: true,
      mergeDelay: 1000,
      code: function() {
        if ( ! this.autoAddRandomSnapshots ) return;
        this.addRandomSnapshots();
        this.maybeAddRandomSnapshots();
      },
    },
  ],
  actions: [
    {
      name: 'addRandomOrder',
      code: function() {
        var symbols = this.stockSymbols;
        var names = this.personNames;
        this.stockOrderDAO.put(this.StockOrder.create({
          symbol: symbols[Math.floor(Math.random()*symbols.length)],
          person: names[Math.floor(Math.random()*names.length)],
          shares: Math.floor(Math.random()*100) - 50,
          pricePerShare: Math.random()*100000,
        }));
      },
    },
    {
      name: 'addRandomSnapshots',
      code: function() {
        var self = this;
        self.stockSymbols.forEach(function(n) {
          if ( Math.floor(Math.random()*2) ) return;
          self.stockPriceSnapshotDAO.put(self.StockPriceSnapshot.create({
            date: self.date,
            symbol: n,
            price: Math.random()*100000,
          }));
        })
        self.date = new Date(self.date.getTime() + 24*60*60*1000);
      },
    },
  ],
});
