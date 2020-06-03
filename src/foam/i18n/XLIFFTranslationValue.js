/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.i18n',
  name: 'XLIFFTranslationValue',

  properties: [
    'id',
    {
      class: 'String',
      name: 'model_property',
      documentation: `Reference to model or view property to be translated. 
        Ex. (‘FIRST_NAME’, ‘LAST_NAME’, ‘ORGANIZATION’ …etc)`,
      value: 'en'  
    },
    {
      class: 'String',
      name: 'translated_value',
      documentation: 'Contains translated string after translation.',
      value: 'CA'
    },
    {
      class: 'String',
      name: 'hint',
      documentation: 'Provided hint to translators. Ex. ( if label is `rad` hint: calculator radian.)',
      //factory: function() { return this.locale + '-' + this.variant ; }
      //value: 'en-CA'
    }
  ]
});