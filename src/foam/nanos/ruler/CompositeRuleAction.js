/**
 * @license
 * Copyright 2019 Google Inc. All Rights Reserved.
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
  package: 'foam.nanos.ruler',
  name: 'CompositeRuleAction',

  documentation: 'Runs multiple rule actions from one action. Completes actions sequentially in array, and actions stack.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.nanos.ruler.RuleAction',
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.nanos.ruler.RuleAction',
      name: 'ruleActions'
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( getRuleActions() != null )
          for ( RuleAction action : getRuleActions() ) {
            if ( action != null )
              action.applyAction(x,obj,oldObj,ruler,agency);
          }
      `
    }
  ]
});
