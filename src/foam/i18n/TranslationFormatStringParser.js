/**
 * @license
 * Copyright 2015 Google Inc. All Rights Reserved.
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
  name: 'TranslationFormatStringParser',
  requires: [
    'foam.parse.Parsers',
    'foam.parse.ImperativeGrammar',
  ],
  properties: [
    {
      name: 'value',
      value: 'Hello ${toName} from ${fromName}',
    },
    {
      name: 'parsedValue',
      expression: function(valueParserResults) {
        return valueParserResults.parsedValue;
      },
    },
    {
      name: 'translationHint',
      value: '${fromName} is who it was from. ${toName} is who it is to.',
    },
    {
      name: 'parsedTranslationHint',
      expression: function(translationHint, valueParserResults) {
        var matches = valueParserResults.matches;
        if (!translationHint || ! matches) return '';
        this.onMatchFn = function(a) {
          return matches[a[1]] || a.join('');
        };
        return this.grammar.parseString(translationHint);
      },
    },
    {
      name: 'stringSymbol',
      value: '@',
    },
    {
      name: 'onMatchFn',
      hidden: true,
    },
    {
      name: 'valueParserResults',
      hidden: true,
      expression: function(value, stringSymbol) {
        var matches = {};
        this.onMatchFn = function(a) {
          if (!matches[a[1]]) {
            matches[a[1]] = [
              '%',
              Object.keys(matches).length + 1,
              '$',
              stringSymbol
            ].join('');
          }
          return matches[a[1]];
        };
        var parsedValue = this.grammar.parseString(value);
        return {
          matches: matches,
          parsedValue: parsedValue,
        }
      },
    },
  ],
  grammars: [
    {
      name: 'grammar',
      language: 'foam.parse.json.Parsers',
      symbols: function() {
        return {
          START: sym('string'),
          string: repeat(
            alt(
              sym('parameter'),
              anyChar()
            )
          ),
          parameter: seq('${', sym('identifier'), '}'),
          identifier: repeat(not('}', anyChar())),
        }
      },
      actions: [
        function parameter(a) {
          return this.onMatchFn(a);
        },
        function identifier(a) {
          return a.join('');
        },
        function string(a) {
          return a.join('');
        }
      ],
    },
  ],
});
