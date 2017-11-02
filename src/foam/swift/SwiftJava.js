foam.CLASS({
  refines: 'foam.core.Argument',
  properties: [ 'swiftType', 'swiftDefaultValue' ]  
});
foam.CLASS({
  refines: 'foam.core.Method',
  properties: [ 'swiftCode', 'swiftReturns', 'swiftSynchronized' ]
});
foam.CLASS({
  refines: 'foam.core.Requires',
  properties: [ 'swiftPath' ]
});
foam.CLASS({
  refines: 'foam.core.FObjectProperty',
  properties: [ 'swiftType', 'swiftFactory', 'swiftPostSet' ]
});
foam.CLASS({
  refines: 'foam.core.Property',
  properties: [ 'swiftType', 'swiftFactory', 'swiftExpression', 'swiftExpressionArgs' ]
});
foam.CLASS({
  refines: 'foam.core.internal.InterfaceMethod',
  properties: [ 'swiftThrows', 'swiftSupport' ]
});
foam.CLASS({
  refines: 'foam.core.InterfaceModel',
  properties: [ 'swiftName', 'swiftImplements' ]
});
foam.CLASS({
  refines: 'foam.core.String',
  properties: [ 'swiftThrows', 'swiftSupport', 'swiftExpression', 'swiftFactory' ]
});
