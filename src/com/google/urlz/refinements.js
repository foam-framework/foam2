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
  refines: 'foam.core.FObject',
  
  properties: [
    {
      /** The source path of this object, where changes should be commited. */
      name: 'src_',
      hidden: true,
      
    }
  ]
  
})

foam.CLASS({
  refines: 'foam.core.Property',
  
  properties: [
    {
      name: 'owner',
      expression: function(factory) {
        return factory ? true : false;
      }
    },
    {
      /** Default preSet wipes out the old object's src_ and sets the new object's. */
      name: 'preSet',
      value: function(old, nu, prop) {
        if (prop.owner) {
          //old && (old.src_ = ''); // TODO: wipe old obj's src_ or not?
          nu && (nu.src_ = this.src_ + '/' + prop.name);
        }
      }
    }
  ]
})