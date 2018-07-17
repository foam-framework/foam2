/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
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
  package: 'foam.dao',
  name: 'ContextualizingDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: function() {/*
    ContextualizingDAO recreates objects returned by find()/put(), giving them
    access to the exports that this ContextualizingDAO has access to.
    <p>
    If using a foam.dao.EasyDAO, set contextualize:true to automatically
    contextualize objects returned by find().
  */},

  methods: [
    /** Found objects are cloned into the same context as this DAO */
    {
      name: 'find_',
      code: function(x, id) {
        var self = this;
        return self.delegate.find_(x, id).then(function(obj) {
          return self.maybeContextualize_(x, obj);
        });
      },
      javaCode: 'return maybeContextualize_(x, super.find_(x, id));'
    },
    {
      name: 'put_',
      code: function(x, o) {
        var self = this;
        return self.delegate.put_(x, o).then(function(o) {
          return self.maybeContextualize_(x, o);
        });
      },
      javaCode: 'return maybeContextualize_(x, super.put_(x, obj));'
    },
    {
      name: 'maybeContextualize_',
      returns: 'foam.core.FObject',
      javaReturns: 'foam.core.FObject',
      args: [ { name: 'x', of: 'foam.core.X' },
              { name: 'obj', of: 'foam.core.FObject' } ],
      code: function(x, obj) {
        return obj && obj.clone(this);
      },
      javaCode: `if ( obj != null ) {
  obj = obj.fclone();
  obj.setX(x);
}
return obj;`
    }
  ]
});
