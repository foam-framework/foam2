foam.CLASS({
  package: 'foam.u2.view',
  name: 'JSONView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.DetailView'
  ],
  exports: [ 'updateData' ],
  properties: [
    {
      class: 'FObjectProperty',
      name: 'newRow',
      factory: function() {
        return this.KeyValueRow.create();
      }
    }
  ],
  actions: [
    {
      name: 'addRow',
      label: 'add',
      code: function() {
        this.data[this.newRow.key] = this.newRow.value;
        this.updateData();
        this.clearProperty('newRow');
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
      this
        .add(this.slot(function(data) {
          if ( ! data ) return '';
          return self.E().forEach(Object.entries(data), function(e) {
            var row = self.KeyValueRow.create({ key: e[0], value: e[1] });
            this.start(self.DetailView, { data: row, showActions: true }).end();
            row.onDetach(row.sub(self.updateData));
          });
        }))
        .start(self.DetailView, { data$: self.newRow$ }).end()
        .startContext({ data: this }).add(this.ADD_ROW).endContext();
    }
  ]
});