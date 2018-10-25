foam.CLASS({
  package: 'foam.u2.mlang',
  name: 'Table',
  extends: 'foam.dao.AbstractSink',
  requires: [
    'foam.u2.view.TableView',
  ],
  properties: [
    {
      name: 'columns',
    },
    {
      class: 'Map',
      name: 'values_',
    },
  ],
  methods: [
    function put(o) {
      this.values_[o.id] = o;
      this.pub('propertyChange', 'values_');
    },
    function remove(o) {
      delete this.values_[o.id];
      this.pub('propertyChange', 'values_');
    },
    function toE(_, x) {
      var self = this;
      return x.E('table').
          add(self.slot(function(columns) {
            return x.E('thead').
              start('tr').
                forEach(columns, function(c) {
                  this.start('th').add(c).end()
                }).
              end().
              add(self.slot(function(values_) {
                return x.E('tbody').
                  forEach(Object.values(values_), function(v) {
                    this.
                      start('tr').
                        forEach(columns, function(c) {
                          this.start('td').add(v[c]).end()
                        }).
                      end()
                  })
              }))
          }))
    },
  ]
});
