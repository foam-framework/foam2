/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'DigSuccessMessage',
  extends: 'foam.nanos.dig.exception.DigErrorMessage',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public DigSuccessMessage(String message) {
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
      value: '200'
    },
    {
      class: 'Int',
      name: 'code',
      value: 1006
    },
    {
      class: 'String',
      name: 'message'
    },
    {
      class: 'String',
      name: 'type',
      value: 'Success'
    }
  ]
});
