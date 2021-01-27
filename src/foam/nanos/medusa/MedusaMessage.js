/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.medusa',
  name: 'MedusaMessage',
  extends: 'foam.box.Message',

  documentation: 'This model used for TCP request',

  properties: [
    {
      class: 'String',
      name: 'serviceName'
    }
  ]
});
