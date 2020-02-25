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
  package: 'foam.lib',
  name: 'PermissionPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],
  imports: [
    'auth',
  ],
  properties: [
    {
      name: 'args',
      class: 'StringArray'
    }
  ],
  javaImports: [
    'foam.nanos.auth.AuthService'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        AuthService auth = (AuthService) getX().get("auth");
        if ( args_ == null || args_.length <= 0 ) {
          return true;
        }

        for ( String permission : args_ ) {
          if ( auth.check(getX(), permission) )
            return true;
        }
        return false;
      `,
      code: async function() {
        if ( ! this.args || this.args.length <= 0 )
          return true;
        
        for ( var i = 0; i < this.args.length; i++) {
          var r = await this.auth.check(null, this.args[i]);
          if ( r )
           return true;
        }
        return false;
      }
    }
  ]
});