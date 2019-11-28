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
//  name: 'SimpleMethodInfo',
//  extends: 'foam.java.MethodInfo',
//
//
//  methods: [
//    {
//        name: 'authorize',
//        args: [
//          { name: 'x', type: 'Context' }
//        ],
//        javaThrows: ['AuthorizationException'],
//        javaCode: `
//          if ( this.getPermissionRequired() ) {
//                AuthService auth = (AuthService) x.get("auth");
//                String simpleName = this.getClassInfo().getObjClass().getSimpleName();
//                String permission =
//                  simpleName.toLowerCase() +
//                    ".%s." +
//                    this.getName().toLowerCase();
//
//                if ( ! auth.check(x, String.format(permission, "exec")) )
//                  throw new AuthorizationException(String.format("Access denied. User lacks permission to execute command '%s' on model '%s'.", this.getName(), simpleName));
//              }
//        `
//      },
//
//  ]
//});
