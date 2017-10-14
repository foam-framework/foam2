foam.CLASS({
  refines: 'foam.core.Method',
  properties: [
    {
      name: 'javaCode',
    },
  ]
});
foam.CLASS({
  refines: 'foam.core.String',
  properties: [
    {
      name: 'javaGetter',
    },
  ]
});
foam.CLASS({
  refines: 'foam.core.Listener',
  properties: [
    {
      name: 'javaCode',
    },
  ]
});
foam.CLASS({
  refines: 'foam.core.Property',
  properties: [
    {
      name: 'javaType',
    },
    {
      name: 'generateJava',
    },
    {
      name: 'javaFactory'
    },
  ]
});
foam.CLASS({
  refines: 'foam.core.Argument',
  properties: [
    {
      name: 'javaType',
    },
  ]
});
foam.CLASS({
  refines: 'foam.core.Import',
  properties: [
    {
      name: 'javaType',
    },
  ]
});
foam.CLASS({
  refines: 'foam.core.InnerClass',
  properties: [
    {
      name: 'generateJava',
    },
  ]
});
foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      name: 'javaImports',
    }, 
    {
      name: 'generateJava',
    },
  ]
});
foam.CLASS({
  refines: 'foam.core.AbstractMethod',
  properties: [
    {
      name: 'javaCode'
    },
    {
      name: 'javaReturns'
    },
    {
      name: 'javaThrows'
    },
  ]
});
