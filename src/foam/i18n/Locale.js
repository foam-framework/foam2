/**
 * @license
 * Copyright 2020 Google Inc. All Rights Reserved.
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
  package: 'foam.i18n',
  name: 'Locale',

  properties: [
    {
      class: 'String',
      name: 'locale',
      documentation: 'Determines locale type (en, fr, es …etc)',
      factory: function() {
        foam.locale = foam.locale || 'en';
      }  
    },
    {
      class: 'String',
      name: 'variant',
      documentation: 'Locale variation (CA for en-CA, CA for fr-CA, AT for de_AT …etc)',
      value: 'CA'
    },
    {
      class: 'String',
      name: 'locale_variant',
      documentation: 'complete culture code, return locale and variant. (`en-CA`, ‘fr-CA’, ‘de_AT’ …etc)',
      //factory: function() { return this.locale + '-' + this.variant ; },
      //value: 'en-CA'
      value: foam.language
    },
    {
      class: 'Map',
      name: 'translationValues',
      documentation: ` Contains references to models, views, and the
        associated translations. String will reference the
        package and name of model or view to be translated. Ex.
        'foam.nanos.auth.User’.'complete culture code, return
        locale and variant. ('en-CA', 'fr-CA', 'de_AT' …etc)`,
      //factory: function() { return this.locale + '-' + this.variant ; }
      //translationValues (Map)<String, XLIFFTranslationValue>
    }
  ]
});