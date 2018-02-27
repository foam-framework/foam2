foam.CLASS({
  package: 'foam.nanos.auth.twofactor',
  name: 'AbstractOTPAuthService',
  abstract: true,

  documentation: 'Abstract OTPAuthService implementation. Only used to add method to generate secret',

  implements: [
    'foam.nanos.auth.twofactor.OTPAuthService'
  ],

  methods: [
    {
      name: 'generateSecret',
      javaReturns: 'byte[]',
      args: [
        {
          name: 'size',
          javaType: 'int',
        }
      ],
      javaCode:
`final byte[] bytes = new byte[size];
java.util.concurrent.ThreadLocalRandom.current().nextBytes(bytes);
return bytes;`
    }
  ]
});