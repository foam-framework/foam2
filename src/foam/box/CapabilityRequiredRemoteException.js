// TODO: Once modelled exceptions are merged this can be removed in
//       favour of an exception modelled in foam.nanos.cron
foam.CLASS({
  package: 'foam.box',
  name: 'CapabilityRequiredRemoteException',
  extends: 'foam.box.RemoteException',
  properties: [
    {
      class: 'String',
      name: 'id',
      value: 'foam.box.CapabilityRequiredRemoteException'
    },
    {
      class: 'StringArray',
      name: 'capabilityOptions',
      documentation: `
        List of capabilities which can be used to satisfy the permission that
        caused this error. A capability will only intercept a permission if
        itself and all of its implied capabilities or permissions can grant the
        requested action.
      `
    }
  ]
});
