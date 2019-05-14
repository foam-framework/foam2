foam.CLASS({
  package: 'foam.nanos.auth',
  name: 'ActionPermissionConfiguration',

  documentation: 'Used to configure which permissions are required to access Actions.',

  properties: [
    {
      class: 'StringArray',
      name: 'enabled'
    },
    {
      class: 'StringArray',
      name: 'available'
    }
  ]
});
