/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
foam.CLASS({
  package: 'foam.u2',
  name: 'ArgumentNoSwiftRefine',
  refines: 'foam.core.Argument',
  properties: [ 'swiftType', 'swiftDefaultValue' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'ConstantNoSwiftRefine',
  refines: 'foam.core.Constant',
  properties: [ 'type', 'swiftValue', 'swiftType' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'ContextMethodNoSwiftRefine',
  refines: 'foam.core.ContextMethod',
  properties: [ 'swiftThrows' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'FObjectPropertyNoSwiftRefine',
  refines: 'foam.core.FObjectProperty',
  properties: [ 'swiftFactory', 'swiftPostSet' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'InterfaceModelNoSwiftRefine',
  refines: 'foam.core.InterfaceModel',
  properties: [ 'swiftName', 'swiftImplements' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'InterfaceMethodNoSwiftRefine',
  refines: 'foam.core.internal.InterfaceMethod',
  properties: [ 'swiftReturns', 'swiftThrows', 'swiftSupport' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'ListenerNoSwiftRefine',
  refines: 'foam.core.Listener',
  properties: [ 'swiftCode' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'MethodNoSwiftRefine',
  refines: 'foam.core.Method',
  properties: [ 'swiftReturns', 'swiftCode', 'swiftSynchronized' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'ModelNoSwiftRefine',
  refines: 'foam.core.Model',
  properties: [ 'swiftName', 'generateSwift', 'swiftImplements' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'PropertyNoSwiftRefine',
  refines: 'foam.core.Property',
  properties: [ 'swiftType', 'swiftExpression', 'swiftExpressionArgs', 'swiftPostSet', 'swiftFactory', 'swiftRequiresEscaping', 'swiftGetter', 'swiftSupport' ]
});
foam.CLASS({
  package: 'foam.u2',
  name: 'StringNoSwiftRefine',
  refines: 'foam.core.String',
  properties: [ 'swiftFactory', 'swiftName']
});
