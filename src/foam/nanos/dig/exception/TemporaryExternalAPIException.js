/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'TemporaryExternalAPIException',
  extends: 'foam.nanos.dig.exception.DigErrorMessage',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public TemporaryExternalAPIException(String message) {
            super(message);
            setMessage(message);
          } 
        `
        );
      }
    }
  ],

  properties: [
    {
      class: 'String',
      name: 'status',
      value: '400'
    },
    {
      class: 'Int',
      name: 'code',
      value: 1011
    },
    {
      class: 'String',
      name: 'type',
      value: 'Temporary External API Failure'
    },
    {
      class: 'String',
      name: 'message',
      value: 'Temporary External API Failure'
    }
  ]
});
