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
    'foam.u2.layout.Cols',
    'foam.u2.layout.Rows'
  ],

  exports: [
    'as view',
    'mode'
  ],

  actions: [
    {
      name: 'addRow',
      label: 'Add',
      isAvailable: function(mode) {
        return mode === foam.u2.DisplayMode.RW;
      },
      code: function() {
        var d2 = foam.Object.shallowClone(this.data);
        d2[Date.now()] = '';
        this.data = d2;
      }
    }
  ],

  classes: [
    {
      name: 'KeyValueRow',
      imports: [
        'mode',
        'view'
      ],
      properties: [
        {
          class: 'String',
          name: 'key'
        },
        {
          name: 'value',
          view: { class: 'foam.u2.view.AnyView' }
        }
      ],
      actions: [
        {
          name: 'remove',
          isAvailable: function(mode) {
            return mode === foam.u2.DisplayMode.RW;
          },
          code: function() {
            var d2 = foam.Object.shallowClone(this.view.data);
            delete d2[this.key];
            this.view.data = d2;
          }
        }
      ]
    }
  ],

  methods: [
    function initE() {
      var self = this;
      this
        .add(this.slot(function(data) {
          return self.Rows.create()
            .forEach(Object.entries(data || {}), function(e) {
              let oldKey = e[0];
              let row    = self.KeyValueRow.create({key: e[0], value: e[1]});
              row.onDetach(row.sub('propertyChange', function() {
                delete self.data[oldKey];
                self.data[row.key] = row.value;
                oldKey = row.key;
              }));
              this
                .startContext({ data: row })
                  .start(self.Cols)
                    .start()
                      .style({'flex-grow': 1 })
                      .add(self.KeyValueRow.KEY)
                    .end()
                    .start()
                      .style({ 'flex-grow': 1 })
                      .add(self.KeyValueRow.VALUE)
                    .end()
                    .tag(self.KeyValueRow.REMOVE, {
                      isDestructive: true
                    })
                  .end()
                .endContext();
            });
        }))
        .startContext({data: this}).add(this.ADD_ROW).endContext();
    }
  ]
});
