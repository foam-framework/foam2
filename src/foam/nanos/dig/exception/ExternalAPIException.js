/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'ExternalAPIException',
  extends: 'foam.nanos.dig.exception.DigErrorMessage',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public ExternalAPIException(String message) {
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
      value: '500'
    },
    {
      class: 'Int',
      name: 'code',
      value: 1010
    },
    {
      class: 'String',
      name: 'type',
      value: 'External API Failure'
    },
    {
      class: 'String',
      name: 'message',
      value: 'External API Failure'
    }
  ]
});
