foam.CLASS({
  package: 'foam.nanos.auth.twofactor',
  name: 'OTPKey',
  documentation: `An model that contains key and QR code of two-factor authentication`,

  properties: [
    {
      class: 'String',
      name: 'key',
    },
    {
      class: 'String',
      name: 'qrCode',
    }
  ]
});
