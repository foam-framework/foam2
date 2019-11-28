///**
// * @license
// * Copyright 2019 The FOAM Authors. All Rights Reserved.
// *
// * Licensed under the Apache License, Version 2.0 (the "License");
// * you may not use this file except in compliance with the License.
// * You may obtain a copy of the License at
// *
// *     http://www.apache.org/licenses/LICENSE-2.0
// *
// * Unless required by applicable law or agreed to in writing, software
// * distributed under the License is distributed on an "AS IS" BASIS,
// * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// * See the License for the specific language governing permissions and
// * limitations under the License.
// */
//
//foam.CLASS({
//  package: 'foam.java',
//  name: 'MethodInfo',
//  extends: 'foam.java.Class',
//
//  properties: [
//    {
//      class: 'String',
//      name: 'methodName'
//    },
//    {
//      class: 'String',
//      name: 'type'
//    },
//    {
//      class: 'Array',
//      name: 'args'
//    },
//    {
//      class: 'String',
//      name: 'body'
//    },
//    {
//      class: 'Boolean',
//      name: 'permissionRequired'
//    },
//    {
//      name: 'methods',
//      factory: function() {
//        var m = [
//          {
//            name: 'getName',
//            visibility: 'public',
//            type: 'String',
//            body: 'return "' + this.methodName + '";'
//          },
//          {
//            name: 'getType',
//            visibility: 'public',
//            type: 'String',
//            body: this.type ?
//              'return "' + this.type + '"' :
//              'return null'
//          },
//          {
//            name: 'getArgs',
//            visibility: 'public',
//            type: 'String[]',
//            body: 'return ' + this.getArgs
//          },
//          {
//            name: 'getBody',
//            visibility: 'public',
//            type: 'String',
//            body: this.type ?
//              'return "' + this.body + '"' :
//              'return null'
//          },
//          {
//            name: 'get',
//            visibility: 'public',
//            type: 'Object',
//            args: [{ name: 'o', type: 'Object' }],
//            body: '// TRYING TO GET MethodInfo;'
//          },
//          {
//            name: 'get_',
//            type: this.propType,
//            visibility: 'public',
//            args: [{ name: 'o', type: 'Object' }],
//            body: '// TRYING TO get_ MethodInfo;'
//          },
//          {
//            name: 'set',
//            type: 'void',
//            visibility: 'public',
//            args: [{ name: 'o', type: 'Object' }, { name: 'value', type: 'Object' }],
//            body: '// TRYING to set MethodInfo ;'
//          },
//          {
//            name: 'getPermissionRequired',
//            type: 'boolean',
//            visibility: 'public',
//            body: 'return ' + this.permissionRequired + ';'
//          }
//        ];
//
//        return m;
//      }
//    }
//  ]
//});
