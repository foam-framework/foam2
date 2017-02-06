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

foam.locale = foam.locale || 'en';

foam.CLASS({
  package: 'foam.i18n',
  name: 'MessageAxiom',

  properties: [
    {
      name: 'name',
      class: 'String'
    },
    {
      name: 'description',
      class: 'String'
    },
    {
      name: 'messageMap',
      help: 'Map of language codes to the message in that language.',
      class: 'Object',
    },
    {
      name: 'message',
      class: 'String',
      getter: function() {
        return this.message_ || this.messageMap[foam.locale];
      },
      setter: function(m) { this.message_ = m; },
    },
    {
      name: 'message_',
      class: 'Simple',
    },
  ],
  methods: [
    function installInClass(cls) {
      Object.defineProperty(
        cls,
        this.name,
        {
          value: this.message,
          configurable: false
        });
    },
    function installInProto(proto) {
      this.installInClass(proto);
    },
  ],
});

foam.CLASS({
  package: 'foam.i18n',
  name: 'MessagesExtension',
  refines: 'foam.core.Model',

  properties: [
    {
      name: 'messages',
      class: 'AxiomArray',
      of: 'foam.i18n.MessageAxiom',
      adaptArrayElement: function(o, prop) {
        return foam.lookup(prop.of).create(o);
      }
    }
  ]
});

