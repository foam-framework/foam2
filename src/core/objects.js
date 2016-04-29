/*
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
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

  refines: 'foam.core.Property',
  properties: [
    {
      class: 'Boolean',
      name: 'transient'
    },
    {
      class: 'Boolean',
      name: 'networkTransient',
      expression: function(transient) {
        return transient;
      }
    },
    {
      class: 'Boolean',
      name: 'storageTransient',
      expression: function(transient) {
        return transient;
      }
    }
  ]
});


foam.CLASS({
  refines: 'foam.core.Property',

  documentation: 'Add cloning to Properties.',

  methods: [
    function cloneProperty(
      /* any // The value to clone */         value,
      /* object // Add values to this map to
         have them installed on the clone. */ cloneMap
    ) {
      /** Override to provide special deep cloning behavior. */
      cloneMap[this.name] = ( value && value.clone ) ? value.clone() : value;
    }
  ]
});
