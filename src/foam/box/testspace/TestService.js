foam.INTERFACE({
  name: 'TestService',
  package: 'foam.box.testspace',

  methods: [
    {
      name: 'testMethod',
      args: [
        {
          name: 'whatdo',
          type: 'String'
        }
      ],
      type: 'Boolean'
    }
  ]
});

foam.CLASS({
  name: 'TestServiceServer',
  package: 'foam.box.testspace',
  implements: ['foam.box.testspace.TestService'],

  methods: [
    {
      name: 'testMethod',
      type: 'Boolean',
      args: [
        {
          name: 'whatdo',
          type: 'String'
        }
      ],
      javaCode: `
        if ( whatdo.equals("auth-error") ) {
          throw new foam.nanos.auth.AuthorizationException(
            new foam.box.CapabilityRequiredRemoteException.Builder(getX())
              .setCapabilityOptions(new String[]{
                "TestServiceCapabilityA",
                "TestServiceCapabilityC",
                "TestServiceCapabilityD"
              })
              .build()
          );
        }
        return true;
      `
    }
  ]
});

foam.CLASS({
  name: 'TestServiceClient',
  package: 'foam.box.testspace',

  requires: [
    'foam.box.SessionClientBox',
    'foam.box.HTTPBox'
  ],

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    },
    {
      class: 'Stub',
      of: 'foam.box.testspace.TestService',
      name: 'delegate',
      factory: function() {
        return this.SessionClientBox.create({ delegate: this.HTTPBox.create({
          method: 'POST',
          url: this.serviceName
        })
      });
      },
      swiftFactory: `
return SessionClientBox_create(["delegate": HTTPBox_create([
  "method": "POST",
  "url": serviceName
])])
      `
    }
  ]
});