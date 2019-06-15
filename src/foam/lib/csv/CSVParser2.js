/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.lib.csv',
  name: 'CSVParser2',
  requires: [
    'foam.parse.StringPStream'
  ],
  grammars: [
    {
      name: 'csvRow',
      symbols: function() {
        return {
          START: seq1(0, repeat(sym('field'), ',')),
          field: alt(sym('quotedText'), sym('unquotedText'), ''),
          unquotedText: repeat(not(alt(',','\n', '\r'), anyChar()), '', 1),
          quotedText: seq1(1, '"', repeat(alt(sym('escapedQuote'), not('"', anyChar()))), '"'),
          escapedQuote: '""'
        };
      },
      actions: {
        unquotedText: function (a) {
          return a.join('');
        },
        quotedText: function (a) {
          return a.join('');
        },
        escapedQuote: function () { return '"'; }
      }
    }
  ],
  methods: [
    function fromCSV(cls, s, sink) {
      var propMap = cls.getAxiomsByClass(foam.core.Property)
        .reduce((map, p) => {
          p.fromCSVLabelMapping(map, p);
          return map;
        }, {});

      var ps = this.StringPStream.create();
      ps.setString(s);

      ps = ps.apply(this.csvRow.getSymbol('START'), this.csvRow);

      var headers = ps.value;
      headers.forEach(h => {
        if ( ! propMap[h] ) {
          console.warn('Unknown label', h, 'for class', cls.id);
        }
      });

      ps = ps.tail;
      while ( ps.valid ) {
        ps = ps.apply(this.csvRow.getSymbol('START'), this.csvRow);
        var obj = cls.create();
        ps.value.forEach((v, i) => {
          var prop = propMap[headers[i]];
          prop && prop.set(obj, v);
        });
        sink.put(obj);
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.lib.csv',
  name: 'PropertyFromCSV',
  refines: 'foam.core.Property',
  properties: [
    {
      class: 'Function',
      name: 'fromCSVLabelMapping',
      value: function(map, prop) {
        map[prop.name] = prop;
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.lib.csv',
  name: 'FObjectPropertyFromCSV',
  refines: 'foam.core.FObjectProperty',
  properties: [
    {
      class: 'Function',
      name: 'fromCSVLabelMapping',
      value: function(map, prop) {
        prop.of.getAxiomsByClass(foam.core.Property)
          .forEach(a => {
            var m = {};
            a.fromCSVLabelMapping(m, a);
            Object.keys(m).forEach(k => {
              map[prop.name + '.' + k] = {
                set: function(o, value) {
                  o[prop.name] = o[prop.name] || prop.of.create();
                  m[k].set(o[prop.name], value);
                }
              };
            });
          });
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.lib.csv',
  name: 'FObjectArrayFromCSV',
  refines: 'foam.core.FObjectArray',
  properties: [
    {
      class: 'Function',
      name: 'fromCSVLabelMapping',
      value: function(map, prop) {
        map[prop.name] = {
          set: function(o, value) {
            o[prop.name] = foam.json.parseString(value);
          }
        };
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.lib.csv',
  name: 'ArrayFromCSV',
  refines: 'foam.core.Array',
  properties: [
    {
      class: 'Function',
      name: 'fromCSVLabelMapping',
      value: function(map, prop) {
        map[prop.name] = {
          set: function(o, value) {
            o[prop.name] = foam.json.parseString(value);
          }
        };
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.lib.csv',
  name: 'StringArrayFromCSV',
  refines: 'foam.core.StringArray',
  properties: [
    {
      class: 'Function',
      name: 'fromCSVLabelMapping',
      value: function(map, prop) {
        map[prop.name] = {
          set: function(o, value) {
            o[prop.name] = foam.json.parseString(value);
          }
        };
      }
    }
  ]
});

foam.CLASS({
  package: 'foam.lib.csv',
  name: 'UploadDemo',
  requires: [
    'foam.dao.CSVSink',
    'foam.dao.DAOSink',
    'foam.dao.EasyDAO',
    'foam.lib.csv.CSVParser2'
  ],
  properties: [
    {
      class: 'String',
      name: 'cls',
      label: 'class',
      value: 'foam.nanos.auth.User',
      validateObj: function(cls) {
        return foam.lookup(cls, true) ? null : 'Invalid class';
      }
    },
    {
      class: 'String',
      name: 'csv',
      view: { class: 'foam.u2.tag.TextArea' },
      value: `
id,legalName,email,phone.number,address.city,address.postalCode,lastLogin,birthday,passwordLastModified,passwordExpiry,created,lastModified
1,Mike C,mike@c.com,416-123-1234,sauga,l4w2l2,0,1,2,3,4,5
      `
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'dao',
      view: { class: 'foam.comics.v2.DAOBrowserView' },
      expression: function(cls) {
        return this.EasyDAO.create({
          of: foam.lookup(cls, true) || foam.nanos.auth.User,
          daoType: 'MDAO'
        });
      }
    },
    {
      class: 'String',
      name: 'csvOut',
      view: {
        class: 'foam.u2.HTMLView',
        nodeName: 'pre'
      },
      visibiliy: 'RO'
    }
  ],
  actions: [
    {
      name: 'parse',
      code: function() {
        var a = this.CSVSink.create();
        var sinks = [
          a,
          this.DAOSink.create({ dao: this.dao })
        ];
        var sink = {
          put: function(o) {
            sinks.forEach(s => s.put(o));
          }
        };
        this.CSVParser2.create().fromCSV(this.dao.of, this.csv.trim(), sink);
        this.csvOut = a.csv;
      }
    },
    {
      name: 'useOutputAsInput',
      isEnabled: function(csvOut) {
        return !! csvOut;
      },
      code: function() {
        this.csv = this.csvOut;
        this.csvOut = undefined;
      }
    }
  ]
});