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
  refines: 'foam.core.AbstractMethod',
  properties: [ 'javaCode', 'javaReturns', 'javaThrows' ]
});
foam.CLASS({
  refines: 'foam.core.Argument',
  properties: [ 'javaType' ]
});
foam.CLASS({
  refines: 'foam.core.Currency',
  properties: [ 'javaGetter' , 'precision' ]
});
foam.CLASS({
  refines: 'foam.core.EMail',
  properties: [ 'javaSetter' ]
});
foam.CLASS({
  refines: 'foam.core.Implements',
  properties: [ 'java' ]
});
foam.CLASS({
  refines: 'foam.core.Import',
  properties: [ 'javaType' ]
});
foam.CLASS({
  refines: 'foam.core.InnerClass',
  properties: [ 'generateJava' ]
});
foam.CLASS({
  refines: 'foam.core.Listener',
  properties: [ 'javaCode' ]
});
foam.CLASS({
  refines: 'foam.core.Long',
  properties: [ 'javaGetter' ]
});
foam.CLASS({
  refines: 'foam.core.Method',
  properties: [ 'javaCode' ]
});
foam.CLASS({
  refines: 'foam.core.Model',
  properties: [ 'javaImports', 'generateJava', 'arequire', 'import', 'description' ]
});
foam.CLASS({
  refines: 'foam.core.Property',
  properties: [ 'javaType', 'generateJava', 'javaFactory','javaInfoType' ]
});
foam.CLASS({
  refines: 'foam.core.String',
  properties: [ 'javaGetter', 'javaSetter', 'description' ]
});
foam.CLASS({
  refines: 'foam.u2.ViewSpec',
  properties: [ 'javaInfoType', 'javaJSONParser' ]
});
