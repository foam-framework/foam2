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

foam.SCRIPT({
  package: 'foam.i18n',
  name: 'LocaleScript',
  code: function() {
    foam.locale = foam.locale || 'en';
  }
});


foam.LIB({
  name: 'foam.i18n.Lib',
  methods: [
    function createText(source, text, defaultText) {
      if ( ! foam.xmsg ) return text;
      return {
        __proto__: text,
//        asJavaValue: function() { return foam.java.AsJavaValue(text); },
        toString: function() { return defaultText || text; },
        toE: function(_, X) {
          return foam.i18n.InlineLocaleEditor.create({
            source:      source,
            defaultText: defaultText || text,
            data:        text},
            X);
        }
      };
      /*
      return {
        asJavaValue: function() {
          return foam.java.asJavaValue(text);
        },
        toE: (_, X) => {
          return foam.i18n.InlineLocaleEditor.create({
            source:      source,
            defaultText: defaultText,
            data:        text}, X);
        },
        toString: function() {
          return text;
        }
      };
      */
    }
  ]
});


foam.CLASS({
  package: 'foam.i18n',
  name: 'MessageAxiom',

  properties: [
    {
      class: 'String',
      name: 'name',
      preSet: function(o, n) { return foam.String.constantize(n); }
    },
    {
      class: 'String',
      name: 'description'
    },
    {
      class: 'Object',
      name: 'messageMap',
      help: 'Map of language codes to the message in that language.',
      factory: function() { return {}; }
    },
    {
      class: 'String',
      name: 'message',
      getter: function() {
        var msg = this.message_;
        if ( foam.Undefined.isInstance(msg) ) {
          if ( foam.locale )
            msg = this.messageMap[foam.locale] || this.messageMap[foam.lang];

          msg = msg || this.messageMap.en;

          // While booting, foam.i18n may not have loaded yet
          msg = this.message_ = foam.i18n && foam.xmsg ?
            foam.i18n.Lib.createText(this.sourceCls_.id + '.' + this.name, msg, msg) :
            msg ;
        }

        return msg;
      },
      setter: function(m) {
        this.messageMap[foam.locale] = m;
        this.message_ = undefined;
      }
    },
    {
      class: 'Simple',
      name: 'message_'
    }
  ],

  methods: [
    function installInClass(cls) {
      var self = this;
      Object.defineProperty(
        cls,
        this.name,
        {
          get: function() { return self.message; },
          set: function(v) { self.messageMap[foam.locale] = v; self.message_ = undefined; },
          configurable: false
        });
    },

    function installInProto(proto) {
      var name = this.name;
      Object.defineProperty(
        proto,
        this.name,
        {
          get: function() { return this.cls_[name] },
          configurable: false
        });
    }
  ]
});


foam.CLASS({
  package: 'foam.i18n',
  name: 'MessagesExtension',
  refines: 'foam.core.Model',

  properties: [
    {
      name: 'messages',
      class: 'AxiomArray',
      of: 'foam.i18n.MessageAxiom'
    }
  ]
});
