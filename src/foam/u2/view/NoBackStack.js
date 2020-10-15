foam.CLASS({
  package: 'foam.nanos.approval',
  name: 'NoBackStack',
  properties: [
    'delegate',
    {
      name: 'top',
      expression: function(delegate) {
        return delegate.top;
      }
    },
    {
      class: 'Function',
      name: 'back'
    }
  ]
});