/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.i18n',
  name: 'Locale',

  ids: ['locale', 'variant', 'sourceId', 'sourcePath'],

  implements: [
    'foam.nanos.auth.LastModifiedAware',
    'foam.nanos.auth.LastModifiedByAware'
  ],

  properties: [
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
      documentation: 'Locale variation (CA for en-CA, CA for fr-CA, AT for de_AT …etc)'
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
      name: 'sourceId',
      documentation: 'Id of property which needs to be translated'
    },
    {
      class: 'String',
      name: 'sourcePath',
      documentation: 'path to property which needs to be translated'
    },
    {
      class: 'String',
      name: 'source',//path+property+propertyproperty
      documentation: `Reference to model or view property to be translated.
        Ex. (‘FIRST_NAME’, ‘LAST_NAME’, ‘ORGANIZATION’ …etc)
        Use it to set sourceId and sourcePath with one string`,
      storageTransient: true,
      javaSetter:`
        int idPosition = 0;
        if ( val != null && ! val.trim().isEmpty() ) {
          String[] arr = val.split("[.]");
          StringBuilder sb = new StringBuilder();
          boolean b;
          while ( idPosition != arr.length && ! this.isUpperCase(arr[idPosition]) )
            idPosition++;
          for (int i = idPosition; i < arr.length; i++ ){
            sb.append(arr[i]);
            if ( i != arr.length - 1)
              sb.append('.');
          }
          this.setSourceId(sb.toString());
          this.setSourcePath(val.substring(0, val.indexOf("."+ this.getSourceId())));
        }
      `
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
    },
    {
      class: 'DateTime',
      name: 'lastModified',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'lastModifiedBy',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      tableCellFormatter: function(value, obj) {
        this.__subSubContext__.userDAO.find(value).then(function(user) {
          if ( user ) {
            this.add(user.legalName);
          }
        }.bind(this));
      }
    }
  ],

  methods: [
    {
      name: 'isUpperCase',
      type: 'Boolean',
      args: [
        {
          name: 'str',
          type: 'String'
        }
      ],
      javaCode:`
        for ( int i=0; i<str.length(); i++ ) {
          if ( ! Character.isUpperCase(str.charAt(i)) && ! ( str.charAt(i) == '_' || Character.isDigit(str.charAt(i)) ) )
          {
            return false;
          }
        }
        return true;
      `
    }
  ]
});
