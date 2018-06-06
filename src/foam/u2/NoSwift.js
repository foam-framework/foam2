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
  refines: 'foam.core.Argument',
  properties: [ 'swiftType', 'swiftDefaultValue' ]
});
foam.CLASS({
  refines: 'foam.core.Constant',
  properties: [ 'type', 'swiftValue', 'swiftType' ]
});
foam.CLASS({
  refines: 'foam.core.ContextMethod',
  properties: [ 'swiftThrows' ]
});
foam.CLASS({
  refines: 'foam.core.FObjectProperty',
  properties: [ 'swiftFactory', 'swiftPostSet' ]
});
foam.CLASS({
  refines: 'foam.core.InterfaceModel',
  properties: [ 'swiftName', 'swiftImplements' ]
});
foam.CLASS({
  refines: 'foam.core.internal.InterfaceMethod',
  properties: [ 'swiftReturns', 'swiftThrows', 'swiftSupport' ]
});
foam.CLASS({
  refines: 'foam.core.Listener',
  properties: [ 'swiftCode' ]
});
foam.CLASS({
  refines: 'foam.core.Method',
  properties: [ 'swiftReturns', 'swiftCode', 'swiftSynchronized' ]
});
foam.CLASS({
  refines: 'foam.core.Model',
  properties: [ 'swiftName', 'generateSwift', 'swiftImplements' ]
});
foam.CLASS({
  refines: 'foam.core.Property',
  properties: [ 'swiftType', 'swiftExpression', 'swiftExpressionArgs', 'swiftPostSet', 'swiftFactory', 'swiftRequiresEscaping', 'swiftGetter', 'swiftSupport' ]
});
foam.CLASS({
  refines: 'foam.core.String',
  properties: [ 'swiftFactory', 'swiftName']
});
