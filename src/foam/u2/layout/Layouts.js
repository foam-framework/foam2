foam.CLASS({
  package: 'foam.u2.layout',
  name: 'RowLayout',
  extends: 'foam.u2.Element',
  methods: [
    function add() {
      console.log('Adding row!');
      return this.SUPER.apply(this, arguments);
    }
  ]
});

foam.CLASS({
  package: 'foam.u2.layout',
  name: 'ColumnLayout',
  extends: 'foam.u2.Element',
  methods: [
    function add() {
      console.log('Adding column!');
      return this.SUPER.apply(this, arguments);
    }
  ]
});