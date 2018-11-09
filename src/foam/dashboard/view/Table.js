foam.CLASS({
  package: 'foam.dashboard.view',
  name: 'Table',
  extends: 'foam.u2.Element',
  imports: [ 'data' ],
  properties: [
    [ 'nodeName', 'table' ]
  ],
  css: `
^ {
  flex: 1 1 auto;
}
`,
  methods: [
    function initE() {
      this.
        addClass(this.myClass()).
        add(this.slot(function(data$data$arg1, data$data$arg2) {
          return this.
            E('thead').
            start('tr').
            start('td').
            add(data$data$arg1.label || data$data$arg1.cls_.name).
            end('td').
            start('td').
            add(data$data$arg2.label || data$data$arg2.cls_.name).
            end('td').
            end('tr');
        })).
        add(this.slot(function(data$data$groups, data$data) {
          return this.
            E('tbody').
            forEach(data$data.sortedKeys(), function(k) {
              this.
                start('tr').
                start('td').add('' + k).end('td').
                start('td').add('' + data$data$groups[k].value).end('td').
                end('tr');
            });
        }));
    }
  ]
});
