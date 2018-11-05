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
      name: 'stockPrices',
      view: {
        class: 'org.chartjs.Line',
        height: 200,
        width: 200,
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
      name: 'holdings',
      view: {
        class: 'org.chartjs.Bar',
        height: 200,
        width: 200,
      },
      factory: function() {
        var sink = this.GROUP_BY(this.StockOrder.SYMBOL, this.SUM(this.StockOrder.SHARES));
        this.stockOrderDAO.listen(sink);
        return sink;
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
      class: 'Int',
      name: 'date',
      //factory: function() { return new Date() },
    },
  ],
  classes: [
    {
      name: 'StockPriceSnapshot',
      properties: [
        { name: 'id' },
        { class: 'Int', name: 'date' },
        { class: 'String', name: 'symbol' },
        { class: 'Currency', name: 'price' },
      ]
    },
    {
      name: 'StockOrder',
      properties: [
        { name: 'id' },
        { class: 'String', name: 'symbol' },
        { class: 'Currency', name: 'pricePerShare' },
        { class: 'Int', name: 'shares' },
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
      mergeDelay: 500,
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
        var names = this.stockSymbols;
        this.stockOrderDAO.put(this.StockOrder.create({
          symbol: names[Math.floor(Math.random()*names.length)],
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
          self.stockPriceSnapshotDAO.put(self.StockPriceSnapshot.create({
            date: self.date,
            symbol: n,
            price: Math.random()*100000,
          }));
        })
        self.date++;
        //self.date = new Date(self.date.getTime() + 24*60*60*1000);
      },
    },
  ],
});
