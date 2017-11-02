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
  refines: 'foam.core.Method',
  properties: [
    {
      name: 'swiftCode',
    },
    {
      name: 'swiftReturns',
    },
  ]
});
foam.CLASS({
  refines: 'foam.core.internal.InterfaceMethod',
  properties: [
    {
      name: 'swiftReturns',
    },
    {
      name: 'swiftThrows',
    },
    {
      name: 'swiftSupport',
    },
  ]
});
foam.CLASS({
  refines: 'foam.core.Property',
  properties: [
    {
      name: 'swiftType',
    },
    {
      name: 'swiftExpression',
    },
    {
      name: 'swiftExpressionArgs',
    },
    {
      name: 'swiftPostSet',
    },
    {
      name: 'swiftFactory',
    },
  ]
});
foam.CLASS({
  refines: 'foam.core.Argument',
  properties: [
    {
      name: 'swiftType',
    },
    {
      name: 'swiftDefaultValue',
    },
  ]
});
foam.CLASS({
  refines: 'foam.core.InterfaceModel',
  properties: [
    {
      name: 'swiftName',
    },
    {
      name: 'swiftImplements',
    },
  ]
});
foam.CLASS({
  refines: 'foam.core.Model',
  properties: [
    {
      name: 'swiftName',
    },
  ]
});
foam.CLASS({
  refines: 'foam.core.FObjectProperty',
  properties: [
    {
      name: 'swiftFactory',
    },
    {
      name: 'swiftPostSet',
    },
  ]
});
foam.CLASS({
  refines: 'foam.core.Requires',
  properties: [
    {
      name: 'swiftPath',
    },
  ]
});
foam.CLASS({
  refines: 'foam.core.String',
  properties: [
    {
      name: 'swiftFactory',
    },
  ]
});