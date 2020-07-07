/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.i18n',
  name: 'XLIFFTranslationValue',

  properties: [
    {
      class: 'String',
      name: 'id',//id+source
    },
    {
      class: 'String',
      name: 'source',//path+property+propertyproperty
      documentation: `Reference to model or view property to be translated. 
        Ex. (‘FIRST_NAME’, ‘LAST_NAME’, ‘ORGANIZATION’ …etc)`
    },
    {
      class: 'String',
      name: 'target',
      documentation: 'Contains translated string after translation.'
    },
    {
      class: 'String',
      name: 'note',
      documentation: 'Provided hint to translators. Ex. ( if label is `rad` hint: calculator radian.)'
    }
  ]
});