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
          width: 905px;
          height: 370px;
          background: white;
          position: relative;
          vertical-align: top;
          margin-right: 6px;
          border-radius: 3px;
          overflow: auto;
          font-size: 12px;
          padding-left: 40px;
          padding-top: 20px;
          padding-bottom: 20px;
          margin-bottom: 20px;
          z-index: 0;
        }

        ^timelineRecord {
          position: relative;
        }

        ^timelineRecord:last-child ^timeline {
          display: none;
        }

        ^timeline {
          width: 2px;
          height: 100%;
          background: rgba(164, 179, 184, 0.3);
          position: absolute;
          left: 23px;
          top: 5px;
          z-index: -1;
          margin-bottom: 20px;
          content: '';
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
              view.start('div')
                .addClass(view.myClass('timelineRecord'))
                .start('div').addClass(view.myClass('timeline')).end()
                .call(function() {
                  view.historyItemView.outputItem(this, record)
                })
              .end();
            })
          })
        });
    }
  ]
});
