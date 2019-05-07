/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.view',
  name: 'MapView',
  extends: 'foam.u2.View',
  requires: [
    'foam.u2.DetailView'
  ],
  exports: [ 'updateData' ],
  properties: [
    {
      class: 'Map',
      name: 'data'
    }
  ],
  actions: [
    {
      name: 'addRow',
      label: 'Add',
      code: function() {
        this.data[Date.now()] = '';
        this.updateData();
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
          return self.E().forEach(Object.entries(data || {}), function(e) {
            var row = self.KeyValueRow.create({ key: e[0], value: e[1] });
            this.start(self.DetailView, { data: row, showActions: true }).end();
            row.onDetach(row.sub(self.updateData));
          });
        }))
        .startContext({ data: this }).add(this.ADD_ROW).endContext();
    }
  ]
});