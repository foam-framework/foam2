/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.java',
  name: 'Grammar',

  javaImports: [
    'foam.lib.parse.Parser',
    'foam.lib.parse.StringPStream',
    'java.util.Map'
  ],

  requires: [
    'foam.parse.ParserWithAction'
  ],

  properties: [
    {
      class: 'Map',
      name: 'symbols',
      javaFactory: 'return new java.util.HashMap<String, foam.lib.parse.Parser>();'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.lib.parse.Parser',
      name: 'lastStart'
    }
  ],

  methods: [
    {
      name: 'parseString',
      type: 'foam.lib.parse.PStream',
      args: [
        { name: 'str', type: 'String' },
        { name: 'optName', type: 'String' },
        { name: 'x',  javaType: 'foam.lib.parse.ParserContext' }
      ],
      javaCode: `
Map symbols = getSymbols();
if ( optName.equals("") ) optName = "START";
ps.setString(str);
GrammarParser start = (GrammarParser) symbols.get(optName);
setLastStart(start);
return ps.apply(start, x);
      `
    },
    {
      name:'addActions',
      args: [
        { name: 'name', type: 'String'},
        { name: 'action', type: 'foam.java.GrammarAction' }
      ],
      javaCode: `

      `
    },
    {
      name:'addAction',
      args: [
        { name: 'name', type: 'String'},
        { name: 'action', type: 'foam.java.GrammarAction' }
      ],
      javaCode: `
Map symbols = getSymbols();
GrammarParser grParser = new GrammarParser();
grParser.setAction(action);
grParser.setParser((Parser) symbols.get(name));
symbols.put(name, grParser);
      `
    }
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
        public StringPStream ps = new StringPStream();
        `);
      }
    }
  ]
});

foam.INTERFACE({
  package: 'foam.java',
  name: 'GrammarAction',
  documentation: '',
  methods: [
    {
      name: 'execute',
      args: [ { name: 'value', type: 'String' }]
    }
  ]
});

foam.CLASS({
  package: 'foam.java',
  name: 'GrammarParser',
  implements: [ 'foam.lib.parse.Parser' ],
  documentation: '',
  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.lib.parse.Parser',
      name: 'parser'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.java.GrammarAction',
      name: 'action'
    }
  ],

  methods: [
    {
      name: 'parse',
      type: 'foam.lib.parse.PStream',
      args: [
        {
          name: 'ps',
          type: 'foam.lib.parse.PStream'
        },
        {
          name: 'x',
          // ParserContext is not modelled to refer to java type directly
          javaType: 'foam.lib.parse.ParserContext'
        },
      ],
      javaCode: `return getParser().parse(ps, x);`
    }
  ]
});