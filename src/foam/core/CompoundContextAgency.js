/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 *     http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.core',
  name: 'CompoundContextAgency',
  javaImplements: [
    'foam.core.Agency',
    'foam.core.ContextAgent'
  ],

  javaImports: [
    'foam.nanos.logger.Logger',
    'java.util.ArrayList'
  ],

  properties: [
    {
      name: 'agents',
      class: 'List',
      javaType: 'ArrayList<Runnable>',
      javaFactory: `return new ArrayList();`
    }
  ],

  methods: [
    {
      name: 'execute',
      args: [
        { name: 'x', type: 'X' }
      ],
      javaCode: `CompoundException e = new CompoundException();
Logger logger = (Logger) x.get("logger");
for ( Runnable agent : getAgents() ) {
  try {
    agent.run();
  } catch (Throwable t) {
    logger.error(t.getMessage(), t);
    e.add(t);
  }
}
e.maybeThrow();`
    },
    {
      name: 'submit',
      args: [
        { name: 'x', type: 'X' },
        { name: 'agent', type: 'ContextAgent' },
        { name: 'description', type: 'String' }
      ],
      javaCode: `getAgents().add(new ContextAgentRunnable(x, agent, description));`
    },
    {
      name: 'toString',
      type: 'String',
      javaCode: `StringBuilder sb = new StringBuilder();
boolean first = true;
for ( Runnable agent : getAgents() ) {
  if ( first ) {
    first = false;
  } else {
    sb.append(System.lineSeparator());
  }
  sb.append(agent.toString());
}
return sb.toString();`
    },
    {
      name: 'describeAgents',
      type: 'String[]',
      javaCode: `String[] desc = new String[getAgents().size()];
for ( int i = 0 ; i < getAgents().size() ; i++ ) {
  desc[i] = getAgents().get(i).toString();
}
return desc;`
    }
  ],
  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`public void submit(foam.core.X x, foam.core.ContextAgent agent) {
          submit(x, agent, "");
        }`);
      }
    }
  ]
});

