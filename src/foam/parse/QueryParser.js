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
  package: 'foam.parse',
  name: 'QueryParser',

  documentation:
      'Create a query strings to MLangs parser for a particular class.',

  axioms: [
    // Reuse parsers if created for same 'of' class.
    foam.pattern.Multiton.create({property: 'of'})
  ],

  // TODO(braden): Support KEYWORD predicates and queries on them.

  requires: [
    'foam.mlang.Constant',
    'foam.mlang.predicate.And',
    'foam.mlang.predicate.ContainsIC',
    'foam.mlang.predicate.DotF',
    'foam.mlang.predicate.Eq',
    'foam.mlang.predicate.Gt',
    'foam.mlang.predicate.Gte',
    'foam.mlang.predicate.Has',
    'foam.mlang.predicate.In',
    'foam.mlang.predicate.InIC',
    'foam.mlang.predicate.Lt',
    'foam.mlang.predicate.Lte',
    'foam.mlang.predicate.MQLExpr',
    'foam.mlang.predicate.Not',
    'foam.mlang.predicate.Or',
    'foam.mlang.predicate.True',
    'foam.parse.Alternate',
    'foam.parse.ImperativeGrammar',
    'foam.parse.LiteralIC',
    'foam.parse.Parsers',
    'foam.parse.StringPStream'
  ],

  properties: [
    {
      class: 'Class',
      name: 'of'
    },
    /** An optional input. If this is defined, 'me' is a keyword in the search
     * and can be used for queries like <tt>owner:me</tt>. Note that since
     * there is exactly one parser instance per 'of' value, the value of 'me' is
     * also shared.
     */
    {
      class: 'String',
      name: 'me'
    },
    {
      // The core query parser. Needs a fieldname symbol added to function
      // properly.
      name: 'baseGrammar_',
      value: function(alt, anyChar, eof, join, literal, literalIC, not, notChars, optional, range,
        repeat, repeat0, seq, seq1, str, sym, until) {
        return {
          START: seq1(0, sym('query'), repeat0(' '), eof()),

          query: sym('or'),

          or: repeat(sym('and'), alt(literalIC(' OR '), literal(' | ')), 1),

          and: repeat(
            sym('expr'),
            alt(literalIC(' AND '), literal(' ')), 1),

          expr: alt(
            sym('paren'),
            sym('negate'),
            sym('has'),
            sym('is'),
            sym('dot'),
            sym('equals'),
            sym('before'),
            sym('after'),
            sym('id')
          ),

          paren: seq1(1, '(', sym('query'), ')'),

          negate: alt(
            seq(literal('-'), sym('expr')),
            seq(literalIC('NOT '), sym('expr'))
          ),

          id: sym('number'),

          has: seq(literalIC('has:'), sym('fieldname')),

          is: seq(literalIC('is:'), sym('fieldname')),

          dot: seq(sym('fieldname'), sym('subQuery')),

          subQuery: alt(sym('compoundSubQuery'), sym('simpleSubQuery')),

          compoundSubQuery: seq1(1, '(', sym('compoundSubQueryBody'), ')'),

          compoundSubQueryBody: repeat(alt(
            seq('(', sym('compoundSubQueryBody'), ')'),
            // like 'quoted string', except retains the quotes
            join(seq('"',
              join(repeat(alt(literal('\\"', '"'), notChars('"')))),
              '"')),
            notChars(')')
          )),

          simpleSubQuery: seq1(1, '.', repeat(not(alt(' ', eof()), anyChar()))),

          equals: seq(sym('fieldname'), alt(':', '='), sym('valueList')),

          // TODO(kgr): Merge with 'equals'.
          before: seq(sym('fieldname'), alt('<=', '<', literalIC('-before:')),
            sym('value')),
          after: seq(sym('fieldname'), alt('>=', '>', literalIC('-after:')),
            sym('value')),

          value: alt(
            sym('me'),
            sym('date'),
            sym('string'),
            sym('number')
          ),

          compoundValue: alt(
            sym('negateValue'),
            sym('orValue'),
            sym('andValue')
          ),

          negateValue: seq(
            '(',
            alt('-', literalIC('not ')),
            sym('value'),
            ')'
          ),

          orValue: seq(
            '(',
            repeat(sym('value'), alt('|', literalIC(' or '), ' | '), 1),
            ')'
          ),

          andValue: seq(
            '(',
            repeat(sym('value'), alt(literalIC(' and '), ' '), 1),
            ')'
          ),

          valueList: alt(sym('compoundValue'), repeat(sym('value'), ',', 1)),

          me: seq(literalIC('me'), not(sym('char'))),

          date: alt(
            sym('range date'),
            sym('literal date'),
            sym('relative date')
          ),

          'range date': seq(
            alt(sym('literal date'), sym('number')),
            '..',
            alt(sym('literal date'), sym('number'))),

          'literal date': alt(
            // YYYY-MM-DDTHH:MM
            seq(sym('number'), '-', sym('number'), '-', sym('number'), 'T',
                sym('number'), ':', sym('number')),
            // YYYY-MM-DDTHH
            seq(sym('number'), '-', sym('number'), '-', sym('number'), 'T',
                sym('number')),
            // YYYY-MM-DD
            seq(sym('number'), '-', sym('number'), '-', sym('number')),
            // YYYY-MM
            seq(sym('number'), '-', sym('number')),
            // YY/MM/DD
            seq(sym('number'), '/', sym('number'), '/', sym('number'))
          ),

          'relative date': seq(literalIC('today'), optional(seq('-', sym('number')))),

          string: alt(sym('word'), sym('quoted string')),

          'quoted string': seq1(1, '"',
            repeat(alt(literal('\\"', '"'), notChars('"'))),
            '"'),

          word: repeat(sym('char'), null, 1),

          char: alt(range('a', 'z'), range('A', 'Z'), range('0', '9'), '-', '^',
            '_', '@', '%', '.'),
          number: repeat(range('0', '9'), null, 1)
        };
      }
    },
    {
      name: 'grammar_',
      factory: function() {
        var cls = this.of;
        var fields = [];
        var properties = cls.getAxiomsByClass(foam.core.Property);
        for ( var i = 0 ; i < properties.length ; i++ ) {
          var prop = properties[i];
          fields.push(this.LiteralIC.create({
            s: prop.name,
            value: prop
          }));
          if ( prop.shortName ) {
            fields.push(this.LiteralIC.create({
              s: prop.shortName,
              value: prop
            }));
          }
          if ( prop.aliases ) {
            for ( var j = 0 ; j < prop.aliases.length ; j++ ) {
              fields.push(this.LiteralIC.create({
                s: prop.aliases[j],
                value: prop
              }));
            }
          }
        }
        fields.sort(function(a, b) {
          var d = b.lower.length - a.lower.length;
          if ( d !== 0 ) return d;
          if ( a.lower === b.lower ) return 0;
          return a.lower < b.lower ? 1 : -1;
        });

        var base = foam.Function.withArgs(this.baseGrammar_,
          this.Parsers.create(), this);
        var grammar = {
          __proto__: base,
          fieldname: this.Alternate.create({ args: fields })
        };

        // This is a closure that's used by some of the actions that follow.
        // If a Date-valued field is set to a single number, it expands into a
        // range spanning that whole year.
        var maybeConvertYearToDateRange = function(prop, num) {
          var isDateField = foam.core.Date.isInstance(prop) ||
            foam.core.Date.isInstance(prop);
          var isDateRange = Array.isArray(num) && num[0] instanceof Date;

          if ( isDateField && ! isDateRange ) {
            // Convert the number, a single year, into a date.
            var start = new Date(0); // Jan 1 1970, midnight UTC.
            var end   = new Date(0);
            start.setUTCFullYear(+num);
            end.setUTCFullYear(+num + 1);
            return [ start, end ];
          }
          return num;
        };

        var compactToString = function(v) {
          return v.join('');
        };

        var self = this;

        // TODO: Fix me to just build the object directly.
        var actions = {
          id: function(v) {
            return self.Eq.create({
              arg1: cls.ID,
              arg2: v
            });
          },

          or: function(v) {
            return self.Or.create({ args: v });
          },

          and: function(v) {
            return self.And.create({ args: v });
          },

          negate: function(v) {
            return self.Not.create({ arg1: v[1] });
          },

          number: function(v) {
            return parseInt(compactToString(v));
          },

          me: function() {
            return self.me || '';
          },

          has: function(v) {
            return self.Has.create({ arg1: v[1] });
          },

          is: function(v) {
            return self.Eq.create({
              arg1: v[1],
              arg2: true
            });
          },

          dot: function(v) {
            return self.DotF.create({
              arg1: self.Constant.create({value: v[1]}),
              arg2: v[0]
            });
          },

          simpleSubQuery: function(v) {
            return self.MQLExpr.create({query: v.join('')});
          },

          compoundSubQuery: function(v) {
            return self.MQLExpr.create({query: v});
          },

          compoundSubQueryBody: function(v) {
            return v.map(s => foam.String.isInstance(s) ? s : s.join('')).join('');
          },

          before: function(v) {
            // If the property (v[0]) is a Date(Time)Property, and the value
            // (v[2]) is a single number, expand it into a Date range for that
            // whole year.
            v[2] = maybeConvertYearToDateRange(v[0], v[2]);

            // If the value (v[2]) is a Date range, use the appropriate end point.
            if ( Array.isArray(v[2]) && v[2][0] instanceof Date ) {
              v[2] = v[1] === '<=' ? v[2][1] : v[2][0];
            }
            return (v[1] === '<=' ? self.Lte : self.Lt).create({
              arg1: v[0],
              arg2: v[2]
            });
          },

          after: function(v) {
            // If the property (v[0]) is a Date(Time)Property, and the value
            // (v[2]) is a single number, expand it into a Date range for that
            // whole year.
            v[2] = maybeConvertYearToDateRange(v[0], v[2]);

            // If the value (v[2]) is a Date range, use the appropriate end point.
            if ( Array.isArray(v[2]) && v[2][0] instanceof Date ) {
              v[2] = v[1] === '>=' ? v[2][0] : v[2][1];
            }
            return (v[1] === '>=' ? self.Gte : self.Gt).create({
              arg1: v[0],
              arg2: v[2]
            });
          },

          equals: function(v) {
            // TODO: Refactor so that properties provide a way to adapt the
            // values rather than putting all of the value adaptation logic
            // here.

            // v[2], the values, is an array, which might have an 'and', 'or' or
            // 'negated' property on it. The default is 'or'. The partial
            // evaluator for expressions can simplify the resulting Mlang further.
            var prop = v[0];
            var values = v[2];
            // Int is actually the parent of Float and Long, so this captures all
            // numeric properties.
            var isNum = foam.core.Int.isInstance(prop) ||
              foam.core.Reference.isInstance(prop) &&
              foam.core.Int.isInstance(prop.of.ID);

            var isFloat = foam.core.Float.isInstance(prop);

            var isDateField = foam.core.Date.isInstance(prop) ||
                foam.core.DateTime.isInstance(prop);
            var isDateRange = Array.isArray(values[0]) &&
                values[0][0] instanceof Date;

            if ( isDateField || isDateRange ) {
              if ( ! isDateRange ) {
                // Convert the single number, representing a year, into a
                // date.
                var start = new Date(0); // Jan 1 1970 at midnight UTC
                var end = new Date(0);
                start.setUTCFullYear(values[0]);
                end.setUTCFullYear(+values[0] + 1);
                values = [ [ start, end ] ];
              }
              return self.And.create({
                args: [
                  self.Gte.create({ arg1: prop, arg2: values[0][0] }),
                  self.Lt.create({ arg1: prop, arg2: values[0][1] })
                ]
              });
            }

            var expr;

            if ( isNum ) {
              for ( var i = 0 ; i < values.length ; i++ ) {
                values[i] = isFloat ? parseFloat(values[i]) :
                    parseInt(values[i]);
              }

              expr = self.In.create({ arg1: prop, arg2: values });
            } else if ( foam.core.Enum.isInstance(prop) ) {
              // Convert string values into enum values, checking if either the
              // enum name or label starts with the supplied value.
              var newValues = [];
              var e = prop.of;
              for ( var i = 0 ; i < values.length ; i++ ) {
                var value = values[i]
                for ( var j = 0 ; j < e.VALUES.length ; j++ ) {
                  var eValue = e.VALUES[j];
                  if ( foam.String.startsWithIC(eValue.name, value) || foam.String.startsWithIC(eValue.label, value) )
                    newValues.push(eValue);
                }
              }
              expr = self.In.create({ arg1: prop, arg2: newValues });
            } else {
              expr = (v[1] === '=') ?
                  self.Eq.create({ arg1: prop, arg2: values[0] }) :
                  self.Or.create({
                    args: values.map(function(v) {
                      return self.ContainsIC.create({ arg1: prop, arg2: v });
                    })
                  });
            }

            if ( values.negated ) return self.Not.create({ arg1: expr });

            if ( values.and ) {
              return self.And.create({
                args: values.map(function(x) {
                  expr.class_.create({ arg1: expr.arg1, arg2: [ x ] });
                })
              });
            }

            return expr;
          },

          negateValue: function(v) {
            v.negated = true;
            return v;
          },

          orValue: function(v) {
            v = v[1];
            v.or = true;
            return v;
          },

          andValue: function(v) {
            v = v[1];
            v.and = true;
            return v;
          },

          // All dates are actually treated as ranges. These are arrays of Date
          // objects: [start, end]. The start is inclusive and the end exclusive.
          // Using these objects, both ranges (date:2014, date:2014-05..2014-06)
          // and open-ended ranges (date > 2014-01-01) can be computed higher up.
          // Date formats:
          // YYYY-MM-DDTHH:MM, YYYY-MM-DDTHH, YYYY-MM-DD, YYYY-MM, YY/MM/DD, YYYY
          'literal date': function(v) {
            var start;
            var end;

            // Previously we used just new Date() (ie. right now). That breaks
            // when the current date is eg. 31 but the parsed date wants to be a
            // shorter month (eg. April with 30 days). We would set the month to
            // April, but "April 31" gets corrected to "May 1" and then our
            // parsed dates are wrong.
            //
            // We fix that by using a fixed starting date that won't get
            // adjusted like that.
            start = new Date(2000, 0, 1);
            end   = new Date(2000, 0, 1);
            var ops = [ 'FullYear', 'Month', 'Date', 'Hours', 'Minutes', 'Seconds' ];
            var defaults = [ 0, 1, 1, 0, 0, 0 ];
            for ( var i = 0 ; i < ops.length ; i++ ) {
              var x = i * 2 > v.length ? defaults[i] : v[i * 2];
              // Adjust for months being 0-based.
              var val = x - (i === 1 ? 1 : 0);
              start['setUTC' + ops[i]](val);
              end['setUTC' + ops[i]](val);
            }

            start.setUTCMilliseconds(0);
            end.setUTCMilliseconds(0);

            // start and end are currently clones of each other. We bump the last
            // portion of the date and set it in end.
            var last = Math.floor(v.length / 2);
            var op = 'UTC' + ops[last];
            end['set' + op](end['get' + op]() + 1);

            return [ start, end ];
          },

          'relative date': function(v) {
            // We turn this into a Date range for the current day, or a day a few
            // weeks before.
            var d = new Date();
            var year  = d.getFullYear();
            var month = d.getMonth();
            var date  = d.getDate();
            if ( v[1] ) date -= v[1][1];

            return actions['literal date']([ year, '-', month + 1, '-', date ]);
          },

          'range date': function(v) {
            // This gives two dates, but each has already been converted to a
            // range. So we take the start of the first and the end of the second.
            var start = Array.isArray(v[0]) ? v[0][0] :
                typeof v[0] === 'number' ? new Date(v[0], 0, 1) : v[0];
            var end = Array.isArray(v[2]) ? v[2][1] :
                typeof v[2] === 'number' ? new Date(+v[2] + 1, 0, 1) : v[2];
            return [ start, end ];
          },

          'quoted string': compactToString,
          word: compactToString
        };

        var g = this.ImperativeGrammar.create({
          symbols: grammar
        });

        g.addActions(actions);
        return g;
      }
    }
  ],

  methods: [
    function parseString(str, opt_name) {
      var query = this.grammar_.parseString(str, opt_name);
      query = query && query.partialEval ? query.partialEval() : query;
      return query;
    }
  ]
});


foam.CLASS({
  package: 'foam.parse',
  name: 'PropertyAliasesRefinement',
  refines: 'foam.core.Property',

  properties: [
    {
      class: 'StringArray',
      name: 'aliases'
    }
  ]
});
