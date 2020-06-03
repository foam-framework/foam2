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
  name: 'XLIFFTranslationValue',

  properties: [
    'id',
    {
      class: 'String',
      name: 'model_property',
      documentation: `Reference to model or view property to be translated. 
        Ex. (‘FIRST_NAME’, ‘LAST_NAME’, ‘ORGANIZATION’ …etc)`,
      value: 'en'  
    },
    {
      class: 'String',
      name: 'translated_value',
      documentation: 'Contains translated string after translation.',
      value: 'CA'
    },
    {
      class: 'String',
      name: 'hint',
      documentation: 'Provided hint to translators. Ex. ( if label is `rad` hint: calculator radian.)',
      //factory: function() { return this.locale + '-' + this.variant ; }
      //value: 'en-CA'
    }
  ]
});