/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'UnknownIdException',
  extends: 'foam.nanos.dig.exception.DigErrorMessage',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public UnknownIdException(String message) {
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
      value: 1005
    },
    {
      class: 'String',
      name: 'type',
      value: 'NotFound'
    },
    {
      class: 'String',
      name: 'message',
      value: 'Unknown ID'
    }
  ]
});
