foam.CLASS({
  refines: 'foam.core.Argument',
  properties: [
  {
    name: 'swiftType',
    name: 'swiftDefaultValue'
  }
],
});
foam.CLASS({
  refines: 'foam.core.Method',
  properties: [
  {
    name: 'swiftCode',
    name: 'swiftReturns',
    name: 'swiftSynchronized'
  }
],
});
foam.CLASS({
  refines: 'foam.core.Requires',
  properties: [
  {
    name: 'swiftPath',
  }
 ],
});
foam.CLASS({
  refines: 'foam.core.FObjectProperty',
  properties: [
  {
    name: 'swiftType',
    name: 'swiftFactory',
    name: 'swiftPostSet'
  }
],
});
foam.CLASS({
  refines: 'foam.core.Property',
  properties: [
  {
    name: 'swiftType',
    name: 'swiftFactory',
    name: 'swiftExpression',
    name: 'swiftExpressionArgs',
    
  }
],
});
foam.CLASS({
  refines: 'foam.core.internal.InterfaceMethod',
  properties: [
  {
    name: 'swiftThrows',
    name: 'swiftSupport'
  }
],
});
foam.CLASS({
  refines: 'foam.core.String',
  properties: [
  {
    name: 'swiftThrows',
    name: 'swiftSupport',
    name: 'swiftExpression',
    name: 'swiftFactory'
  }
],
});
