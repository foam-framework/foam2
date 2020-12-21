/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 */

foam.CLASS({
  package: 'foam.nanos.dig.exception',
  name: 'DigErrorMessage',
  implements: ['foam.core.Exception'],
  extends: 'foam.core.FOAMException',
  javaGenerateConvenienceConstructor: false,

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public DigErrorMessage(String message) {
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
      name: 'status'
    },
    {
      class: 'Int',
      name: 'code'
    },
    {
      class: 'String',
      name: 'message'
    },
    {
     class: 'String',
     name: 'type'
    },
    {
      class: 'String',
      name: 'developerMessage'
    },
    {
      class: 'String',
      name: 'moreInfo'
    }
  ],

  methods:  [
    {
        name: 'getClientRethrowException',
        type: 'RuntimeException',
        visibility: 'public',
        javaCode: `return this;`
    }
  ]
});
