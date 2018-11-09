foam.CLASS({
  package: 'foam.nanos.dashboard',
  name: 'Demo',
  extends: 'foam.u2.Element',
  imports: [
    'nSpecDAO',
    'setInterval'
  ],
  exports: [
    'as dashboardController'
  ],
  requires: [
    'foam.dashboard.model.GroupBy',
    'foam.dashboard.model.Count'
  ],
  methods: [
    function initE() {
      var timeout = -1;
      //      var timeout = this.setInterval(this.onUpdate, 5000);
      var view = this;

      this.onDetach(function() {
        this.clearInterval(timeout);
      }.bind(this));

      this.
        start('table').
        start('tbody').
        start('tr').
        start('td').
        add(this.GroupBy.create({
          daoName: 'nSpecDAO',
          arg1: 'serve',
          label: 'Served/Unserved Services.'
        })).
        end('td').
        start('td').
        add(this.GroupBy.create({
          daoName: 'nSpecDAO',
          arg1: 'serve',
          label: 'Served/Unserved Services.'
        })).
        end('td').
        end('tr').
        start('tr').
        start('td').
        add(this.GroupBy.create({
          daoName: 'nSpecDAO',
          arg1: 'serve',
          label: 'Served/Unserved Services.'
        })).
        end('td').
        start('td').
        add(this.Count.create({
          daoName: 'nSpecDAO',
          label: 'Lazy Services',
          predicate: 'is:lazy'
        })).
        end('td').
        end('tr').
        end('tbody').
        end('table');
    }
  ],
  listeners: [
    function onUpdate() {
      this.pub('dashboard', 'update');
    }
  ]
});
