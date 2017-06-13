foam.CLASS({
  package: 'foam.u2.history',
  name: 'HistoryView',
  extends: 'foam.u2.View',
  requires: [ 'foam.u2.history.HistoryItemView' ],

  documentation: 'View displaying invoice history',

  axioms: [
    foam.u2.CSS.create({
      code: `
        ^{
          width: 925px;
          min-height: 200px;
          background: white;
          position: relative;
          vertical-align: top;
          margin-right: 6px;
          border-radius: 3px;
          overflow: hidden;
          font-size: 12px;
          padding-left: 20px;
          margin-bottom: 20px;
          z-index: 0;
        }

        /** 
         * TODO: Dynamic height of vertical timeline bar 
        */
        ^verticalBar {
          width: 2px;
          height: 70%;
          background-color: rgba(164, 179, 184, 0.3);
          position: absolute;
          left: 43px;
          top: 90px;
          z-index: -1;
          margin-bottom: 20px;
        }`
    })
  ],

  properties: [
    'data',
    'historyItemView'
  ],
  
  messages: [
    { name: 'title', message: 'History' }
  ],

  methods: [
    function initE() {
      var view = this;

      this
        .addClass(this.myClass())
        .start('h2').add(this.title).end()
        .call(function outputItems() {
          // Gets records from DAO
          view.data.select().then(function(records) {
            // Reverses records array for chronological output
            view.forEach(records.array.reverse(), function(record) {
              view.call(function() {
                return this.historyItemView.outputItem(view, record)
              })
            })
          })
        })
        .start('div').addClass(this.myClass('verticalBar')).end();
    }
  ]
});
