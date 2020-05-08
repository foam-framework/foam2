/**
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
  package: 'foam.u2.view',
  name: 'ReferenceView',
  extends: 'foam.u2.view.ChoiceView',

  documentation: `
    View for editing ReferenceProperty-ies.
    Note: that if the property's value is undefined this view will set it to
    to first choice unless you provide a 'placeholder' (inherited from ChoiceView).
  `,

  properties: [
    {
      name: 'placeholder',
      factory: function() { return '--'; }
    },
    {
      name: 'objToChoice',
      value: function(obj) {
        return [ obj.id, obj.toSummary() ];
      }
    }
  ],

  methods: [
    function fromProperty(prop) {
      this.SUPER(prop);
      if ( ! this.dao ) {
        var dao = this.__context__[prop.targetDAOKey];
        this.dao = dao;
      }
    }
  ]
});
