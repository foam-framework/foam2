/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.app',
  name: 'AppConfig',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'version'
    },
    {
      class: 'String',
      name: 'copyright'
    },
    {
      class: 'String',
      name: 'url',
      value: 'http://localhost:8080/'
    }
  ]
});
