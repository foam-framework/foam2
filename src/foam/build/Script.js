foam.CLASS({
  package: 'foam.build',
  name: 'Script',
  properties: [
    {
      name: 'id',
      expression: function(package, name) {
        return package ? package + '.' + name :
          name;
      }
    },
    {
      name: 'name'
    },
    {
      name: 'requires'
    },
    {
      name: 'package'
    },
    {
      name: 'flags'
    },
    {
      name: 'code'
    }
  ]
});
