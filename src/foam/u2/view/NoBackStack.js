foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'NoBackStack',
  properties: [
    'delegate'
  ],
  methods: [
    function push(v, parent, opt_id) {
      this.delegate.push(v, parent, opt_id);
    },
    function back() {},
    function top() {
      
    }
  ]
});