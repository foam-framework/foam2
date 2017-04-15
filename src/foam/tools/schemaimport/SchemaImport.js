foam.CLASS({
  package: 'foam.tools.schemaimport',
  name: 'SchemaImport',

  documentation: 'Translate Mongoose schemas to FOAM models.',

  properties: [
    {
      class: 'String',
      name: 'package',
      value: 'com.acme'
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
      var mongoose = {
        Schema: {
          Types: {
            ObjectId: 'ObjectId'
          }
        }
      };
      with ( { mongoose: mongoose }) {
        return eval('(' + str + ')');
      }
    },

    function schemaToModel(schema) {
      var m = {
        package: this.package,
        name: 'Name'
      };
      m.properties = [];

      for ( var key in schema ) {
        var s = schema[key];
        var p = {};

        var isArray = Array.isArray(s);
        if ( isArray ) s.type = Array.prototype.constructor;

        switch ( s.type ) {
          case String:  p.class = 'String';  break;
          case Boolean: p.class = 'Boolean'; break;
          case Date:    p.class = 'Date';    break;
          case Number:  p.class = 'Double';  break;
          case Array:
            s = s[0];
            p.class = 'Array';
            switch ( s ) {
              case String:  p.of = 'String';  break;
              case Boolean: p.of = 'Boolean'; break;
              case Date:    p.of = 'Date';    break;
              case Number:  p.of = 'Double';  break;
            }
            break;
        }

        if ( s.ref ) {
          if ( ! isArray ) p.class = 'Reference';
          p.of = this.package ? this.package + '.' + s.ref : s.ref;
        }
        p.name = key;

        if ( s.required ) p.required = true;

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
