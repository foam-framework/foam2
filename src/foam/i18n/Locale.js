/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.i18n',
  name: 'Locale',

  properties: [
    {
      class: 'String',
      name: 'id',
    },
    {
      class: 'String',
      name: 'locale',
      documentation: 'Determines locale type (en, fr, es …etc)',
      factory: function() {
        foam.locale = foam.locale || 'en';
      }  
    },
    {
      class: 'String',
      name: 'variant',
      documentation: 'Locale variation (CA for en-CA, CA for fr-CA, AT for de_AT …etc)',
      value: 'CA'
    },
    {
      class: 'String',
      name: 'locale_variant',
      documentation: 'complete culture code, return locale and variant. (`en-CA`, ‘fr-CA’, ‘de_AT’ …etc)',
      //factory: function() { return this.locale + '-' + this.variant ; },
      //value: 'en-CA'
      value: foam.language
    },
//     {
//       class: 'Map',
//       name: 'translationValues',
//       documentation: ` Contains references to models, views, and the
//         associated translations. String will reference the
//         package and name of model or view to be translated. Ex.
//         'foam.nanos.auth.User’.'complete culture code, return
//         locale and variant. ('en-CA', 'fr-CA', 'de_AT' …etc)`,
//       //factory: function() { return this.locale + '-' + this.variant ; }
//       //translationValues (Map)<String, XLIFFTranslationValue>
//     }
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