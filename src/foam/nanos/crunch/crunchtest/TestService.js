foam.INTERFACE({
  name: 'TestService',
  package: 'foam.nanos.crunch.crunchtest',

  documentation: `
    The CRUNCH TestService allows manual invocation of capability intercepts.
  `,

  methods: [
    {
      name: 'testAuthorizationException',
      args: [
        {
          name: 'permission',
          type: 'String'
        }
      ],
      type: 'Boolean'
    }
  ]
});

foam.CLASS({
  name: 'TestServiceServer',
  package: 'foam.nanos.crunch.crunchtest',
  implements: ['foam.nanos.crunch.crunchtest.TestService'],

  methods: [
    {
      name: 'testAuthorizationException',
      type: 'Boolean',
      args: [
        {
          name: 'permission',
          type: 'String'
        }
      ],
      javaCode: `
        throw new foam.nanos.auth.AuthorizationException(
          "Test authorization failure", permission
        );
      `
    }
  ]
});

foam.CLASS({
  name: 'TestServiceClient',
  package: 'foam.nanos.crunch.crunchtest',

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
      of: 'foam.nanos.crunch.crunchtest.TestService',
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
