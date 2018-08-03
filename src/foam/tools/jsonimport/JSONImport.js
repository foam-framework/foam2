/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.tools.jsonimport',
  name: 'JSONImport',

  documentation: 'Translate JSON schemas to FOAM models.',

  properties: [
    {
      class: 'String',
      name: 'package',
      value: 'foam.nanos'
    },
    {
      class: 'String',
      name: 'name',
      value: 'Test'
    },
    {
      class: 'StringArray',
      name: 'dateFormats',
      hidden: true,
      factory: function () {
        return [
          'YYYY-MM-DD',
          'YYYY-MM-DD HH:mm:ss'
        ];
      }
    },
    {
      class: 'String',
      name: 'input',
      view: { class: 'foam.u2.tag.TextArea', rows: 24 }
    },
    {
      class: 'String',
      name: 'output',
      view: { class: 'foam.u2.tag.TextArea', rows: 24 }
    }
  ],

  methods: [
    function strToSchema(str) {
      return eval('(' + str + ')');
    },

    function schemaToModel(schema) {
      var m = {
        package: this.package,
        name: this.name,
        properties: []
      };

      for ( var key in schema ) {
        var s = schema[key];
        var p = {};

        if ( foam.Null.isInstance(s) ) {
          // ignore null values
          continue;
        }

        if ( foam.String.isInstance(s) ) {
          // check if date
          var date = moment(s, this.dateFormats);
          if ( date.isValid() ) {
            s = date.toDate();
          }
        }

        if ( foam.String.isInstance(s) ) {
          p.class = 'String'
        } else if ( foam.Date.isInstance(s) ) {
          p.class = 'Date'
        } else if ( foam.Number.isInstance(s) ) {
          p.class = 'Int'
        } else if ( foam.Boolean.isInstance(s) ) {
          p.class = 'Boolean'
        } else if ( foam.Object.isInstance(s) ) {
          // TODO: handle nested objects
          p.class = 'FObjectProperty';
        } else if ( foam.Array.isInstance(s) ) {
          p.class = 'FObjectArray';
        }

        p.name = key;
        m.properties.push(p);
      }

      return m;
    },

    function modelToStr(m) {
      return foam.json.Pretty.stringify(m).toString().replace(/"/g, "'").replace(/:/g, ': ');
    }
  ],

  actions: [
    function clear() {
      this.input = this.output = undefined;
    },

    function translate() {
      this.output = 'foam.CLASS(' + this.modelToStr(this.schemaToModel(this.strToSchema(this.input))) + ');';
    }
  ]
});
