/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

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
