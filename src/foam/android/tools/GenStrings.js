/**
 * @license
 * Copyright 2017 Google Inc. All Rights Reserved.
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
  package: 'foam.android.tools',
  name: 'GenStrings',
  extends: 'foam.android.tools.GenResources',

  requires: [
    'foam.i18n.TranslationFormatStringParser',
  ],

  properties: [
    {
      name: 'locale',
      postSet: function(_, n) {
        foam.i18n = n;
      }
    },
    {
      name: 'parser',
      factory: function() {
        return this.TranslationFormatStringParser.create({
          stringSymbol: 's',
        });
      }
    }
  ],

  methods: [
    function classToResources(cls) {
      var resources = cls.model_.toAndroidStringResources();
      var p = this.parser;
      for (var i = 0, r; r = resources[i]; i++) {
        p.copyFrom({value: r.message, translationHint: r.description})
        r.copyFrom({
          name: cls.model_.id.replace(/\./g, '_') + '_' + r.name,
          message: p.parsedValue,
          description: p.parsedTranslationHint,
        });
      }
      return resources;
    }
  ],

  templates: [
    {
      name: 'genResource',
      args: ['resources'],
      template: function(resources) {/*
<?xml version="1.0" encoding="utf-8"?>
<resources>
<% for (var i = 0, r; r = resources[i]; i++) { %>
  <string name="<%= r.name %>" description="<%= r.description %>">
    <%= r.message %>
  </string>
<% } %>
</resources>
      */}
    }
  ]
});


foam.CLASS({
  package: 'foam.android.tools',
  name: 'StringResource',

  properties: [
    {
      class: 'String',
      name: 'name'
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'String',
      name: 'message'
    }
  ]
});


foam.CLASS({
  package: 'foam.android.tools',
  name: 'ModelStringExtension',
  refines: 'foam.core.Model',
  flags: ['android'],
  methods: [
    function toAndroidStringResources(opt_resources) {
      var resources = opt_resources || [];
      for (var i = 0, a; a = this.axioms_[i]; i++) {
        if ( a.toAndroidStringResources ) a.toAndroidStringResources(resources);
      }
      return resources;
    }
  ]
});


foam.CLASS({
  package: 'foam.android.tools',
  name: 'PropertyStringExtension',
  refines: 'foam.core.Property',
  flags: ['android'],

  requires: [
    'foam.android.tools.StringResource',
  ],

  methods: [
    function toAndroidStringResources(opt_resources) {
      var resources = opt_resources || [];
      resources.push(this.StringResource.create({
        name: this.name + '_label',
        description: this.help || '',
        message: this.label,
      }));
      return resources;
    }
  ]
});


foam.CLASS({
  package: 'foam.android.tools',
  name: 'ActionStringExtension',
  refines: 'foam.core.Action',
  flags: ['android'],

  requires: [
    'foam.android.tools.StringResource',
  ],

  methods: [
    function toAndroidStringResources(opt_resources) {
      var resources = opt_resources || [];
      resources.push(this.StringResource.create({
        name: this.name + '_label',
        description: this.help || '',
        message: this.label,
      }));
      return resources;
    }
  ]
});


foam.CLASS({
  package: 'foam.android.tools',
  name: 'MessageStringExtension',
  refines: 'foam.i18n.MessageAxiom',
  flags: ['android'],

  requires: [
    'foam.android.tools.StringResource',
  ],

  methods: [
    function toAndroidStringResources(opt_resources) {
      var resources = opt_resources || [];
      resources.push(this.StringResource.create({
        name: this.name,
        description: this.description,
        message: this.message,
      }));
      return resources;
    }
  ]
});
