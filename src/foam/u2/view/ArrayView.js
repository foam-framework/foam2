/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'ArrayView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.DetailView'
  ],
  exports: [ 'updateData' ],
  actions: [
    {
      name: 'addRow',
      label: 'Add',
      code: function() {
        this.data[this.data.length] = '';
        this.updateData();
      }
    }
  ],
  classes: [
    {
      name: 'Row',
      imports: [ 'data', 'updateData' ],
      properties: [
        {
          class: 'Int',
          name: 'index',
          visibility: 'RO'
        },
        {
          name: 'value',
          view: { class: 'foam.u2.view.AnyView' },
          postSet: function(_, n) {
            this.data[this.index] = n;
          }
        }
      ],
      actions: [
        {
          name: 'remove',
          code: function() {
            this.data.splice(this.index, 1);
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
        this.data = [];
        this.data = d;
      }
    }
  ],
  methods: [
    function initE() {
      var self = this;
      this
        .add(this.slot(function(data) {
          return self.E().forEach(data, function(e, i) {
            var row = self.Row.create({ index: i, value: e });
            this.start(self.DetailView, { data: row, showActions: true }).end();
            row.onDetach(row.sub(self.updateData));
          });
        }))
        .startContext({ data: this }).add(this.ADD_ROW).endContext();
    }
  ]
});