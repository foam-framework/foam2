foam.CLASS({
  package: 'foam.u2.view',
  name: 'JSONView',
  extends: 'foam.u2.View',
  exports: [ 'updateData' ],
  // properties: [
  //   {
  //     name: 'data_',
  //     expression: function(data) {
  //       return data;
  //     },
  //     postSet: function(_, n) {
  //       this.data = foam.json.parseString(n);
  //       // this.clearProperty('data_'); 
  //     }
  //   }
  properties: [
    {
      name: 'newKey',
      class: 'String'
    },
    {
      name: 'newValue',
      view: { class: 'foam.u2.view.AnyView' }
    }
  ],

  actions: [
    {
      name: 'addRow',
      label: 'add',
      code: function() {
        this.data[this.newKey] = this.newValue;
        this.updateData();
        this.clearProperty('newKey');
        this.clearProperty('newValue');
      }
    }
  ],

  classes: [
    {
      name: 'KeyValueRow',
      imports: [ 'data', 'updateData' ],
      properties: [
        {
          class: 'String',
          name: 'key',
          postSet: function(o, n) {
            delete this.data[o];
            this.data[n] = this.value;
          }
        },
        {
          name: 'value',
          view: { class: 'foam.u2.view.AnyView' },
          postSet: function(o, n) {
            this.data[this.key] = n;
          }
        }
      ],
      actions: [
        {
          name: 'remove',
          label: 'X',
          code: function() {
            delete this.data[this.key];
            this.updateData();
          }
        }
      ]
    }
  ],

  listeners: [
    {
      name: 'updateData',
      isFramed: true,
      code: function() {
        var d = this.data;
        this.data = {};
        this.data = d;
      }
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this.add(this.slot(function(data) {
        if ( ! data ) return '';
        return self.E().forEach(Object.entries(data), function(e) {
          var row = self.KeyValueRow.create({ key: e[0], value: e[1] })
          this.startContext({ data: row })
            .start('div')
              .add(self.KeyValueRow.KEY)
              .start('div').add(self.KeyValueRow.VALUE).end()
              .add(self.KeyValueRow.REMOVE)
            .end()
          .endContext()

          row.onDetach(row.sub(self.updateData));

          // self.onDetach(row.key$.sub(function(_, _, _, event) {
          //   delete data[event.oldValue];
          //   data[row.key] = row.value;
          //   console.log(foam.json.Pretty.stringify(self.data));
          // }));

          // self.onDetach(row.value$.sub(function() {
          //   data[row.key] = row.value;
          //   console.log(foam.json.Pretty.stringify(self.data));
          // }));
        }) 
      }));

      this.startContext({ data: this })
        .start('div')
          .add(this.NEW_KEY, this.NEW_VALUE, this.ADD_ROW)
        .end()
      .endContext();
    }
  ]
});