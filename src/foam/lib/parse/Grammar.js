/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.lib.parse',
  name: 'Grammar',

  javaImports: [
    'foam.lib.parse.Parser',
    'foam.lib.parse.StringPStream',
    'foam.lib.parse.SymbolParser',
    'java.util.Map'
  ],

  properties: [
    {
      class: 'Map',
      name: 'symbols',
      javaFactory: 'return new java.util.HashMap<String, foam.lib.parse.Parser>();'
    }
  ],

  methods: [
    {
      name: 'addSymbol',
      args: [
        { name: 'symName', type: 'String' },
        { name: 'symParser', type: 'Parser' }
      ],
      javaCode: `
      getSymbols().put(symName, symParser);
      `
    },
    {
      name: 'parseString',
      type: 'foam.lib.parse.PStream',
      args: [
        { name: 'str', type: 'String' },
        { name: 'optName', type: 'String' }
      ],
      javaCode: `
if ( optName == null || "".equals(optName) ) optName = "START";
StringPStream ps = new StringPStream();
ps.setString(str);
ParserContext parserX = new ParserContextImpl();
PStream temp = ps.apply((Parser)getSymbols().get(optName), parserX);
return temp;
      `
    },
    {
      name: 'sym',
      args: [ { name: 'name', type: 'String' } ],
      type: 'foam.lib.parse.Parser',
      javaCode: `
      SymbolParser symParser = new SymbolParser();
      symParser.setSymbolName(name);
      symParser.setSymbols(getSymbols());
      return symParser;
      `
    },
    {
      name:'addAction',
      args: [
        { name: 'name', type: 'String'},
        { name: 'action', type: 'foam.lib.parse.Action' }
      ],
      javaCode: `
Map symbols = getSymbols();
ActionParser grParser = new ActionParser();
grParser.setAction(action);
grParser.setParser((Parser) symbols.get(name));
symbols.put(name, grParser);
      `
    }
  ],

});

foam.INTERFACE({
  package: 'foam.lib.parse',
  name: 'Action',

  methods: [
    {
      name: 'execute',
      args: [
        { name: 'val', type: 'Object' },
        { name: 'x', type: 'foam.lib.parse.ParserContext' }
      ],
      type: 'Object'
    }
  ]
});

foam.CLASS({
  package: 'foam.lib.parse',
  name: 'ActionParser',
  implements: [ 'foam.lib.parse.Parser' ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.lib.parse.Parser',
      name: 'parser'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.lib.parse.Action',
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
          javaType: 'foam.lib.parse.ParserContext'
        },
      ],
      javaCode: `
ps = getParser().parse(ps, x);
if ( ps != null ) ps.setValue(getAction().execute(ps.value(), x));
return ps;
      `
    }
  ]
});
