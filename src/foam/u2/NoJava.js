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
