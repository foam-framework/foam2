/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'EmptyParameterException',
  extends: 'foam.nanos.dig.exception.DigErrorMessage',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public EmptyParameterException(String message) {
            super(message);
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
      value: 1007
    },
    {
      class: 'String',
      name: 'type',
      value: 'Empty Parameter'
    },
    {
      class: 'String',
      name: 'message',
      value: 'Empty Parameter Exception'
    }
  ]
});
