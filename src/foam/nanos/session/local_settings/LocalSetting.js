foam.CLASS({
  package: 'foam.nanos.session.local_settings',
  name: 'LocalSetting',
  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'name',
      class: 'String'
    },
    {
      name: 'value',
      class: 'String'
    },
    {
      name: 'deviceId',
      class: 'Long'
    }
  ]
});