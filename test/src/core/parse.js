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

// These tests are for the "interpretive", non-compiled parsers.

describe('basic parsers', function() {
  var parsers = foam.parse.Parsers.create();
  var seq = parsers.seq;
  var repeat0 = parsers.repeat0;
  var simpleAlt = parsers.simpleAlt;
  var alt = parsers.alt;
  var sym = parsers.sym;
  var seq1 = parsers.seq1;
  var repeat = parsers.repeat;
  var range = parsers.range;
  var notChars = parsers.notChars;
  var not = parsers.not;
  var optional = parsers.optional;
  var literal = parsers.literal;
  var literalIC = parsers.literalIC;
  var anyChar = parsers.anyChar;

  var mkStream = function(str) {
    var ps = foam.parse.StringPS.create();
    ps.setString(str);
    return ps;
  };

  describe('literal()', function() {
    it('should correctly match a matching string', function() {
      var ps = literal('foo').parse(mkStream('foo'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('foo');
    });

    it('should parse only as far as it matches', function() {
      var ps = literal('foo').parse(mkStream('foobar'));
      expect(ps).toBeDefined();
      expect(ps.head).toBe('b');
      expect(ps.value).toBe('foo');
    });

    it('should not consume anything when it fails', function() {
      expect(literal('foo').parse(mkStream('fobar'))).toBeUndefined();
    });

    it('should insist on correct case', function() {
      expect(literal('foo').parse(mkStream('FOO'))).toBeUndefined();
    });

    it('should fail on EOF', function() {
      expect(literal('foo').parse(mkStream('fo'))).toBeUndefined();
    });
  });

  describe('literalIC()', function() {
    it('should correctly match a matching string', function() {
      var ps = literalIC('foo').parse(mkStream('foo'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('foo');
    });

    it('should ignore case and return canonical spelling', function() {
      var ps = literalIC('foo').parse(mkStream('FOO'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('foo');
    });

    it('should parse only as far as it matches', function() {
      var ps = literalIC('foo').parse(mkStream('FOOBAR'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('foo');
      expect(ps.head).toBe('B');
    });

    it('should fail on a mismatch', function() {
      expect(literalIC('foo').parse(mkStream('FOBAR'))).toBeUndefined();
    });

    it('should fail on EOF', function() {
      expect(literalIC('foo').parse(mkStream('FO'))).toBeUndefined();
    });
  });

  describe('anyChar()', function() {
    it('should match any single character', function() {
      var ps = anyChar().parse(mkStream('a'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('a');
    });

    it('should match exactly one character', function() {
      var ps = anyChar().parse(mkStream('abc'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('a');
      expect(ps.head).toBe('b');
    });

    it('should fail on EOF', function() {
      expect(anyChar().parse(mkStream(''))).toBeUndefined();
    });
  });

  describe('not()', function() {
    it('should fail when the inner parser matches', function() {
      expect(not(literal('abc')).parse(mkStream('abc'))).toBeUndefined();
    });

    it('should succeed without consuming when the inner parser fails',
        function() {
      var ps = not(literal('abc')).parse(mkStream('abd'));
      expect(ps).toBeDefined();
      expect(ps.head).toBe('a');
      expect(ps.value).toBe('');
    });

    it('should accept an "else" parser, and run it when the LHS fails',
        function() {
      var parser = not(literal('abc'), literal('ab'));
      var ps = parser.parse(mkStream('abd'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('ab');
      expect(ps.head).toBe('d');
    });

    it('should not run the "else" parser when the LHS does parse',
        function() {
      var parser = not(literal('abc'), literal('ab'));
      var ps = parser.parse(mkStream('abcd'));
      expect(ps).toBeUndefined();
    });
  });

  describe('seq()', function() {
    var parser = seq(literal('abc'), literalIC('DEF'));

    it('should parse each argument in succession, returning an array',
        function() {
      var ps = parser.parse(mkStream('abcdefg'));
      expect(ps).toBeDefined();
      expect(ps.value).toEqual(['abc', 'DEF']);
      expect(ps.head).toBe('g');
    });

    it('should fail if any of the sub-parsers fails', function() {
      expect(parser.parse(mkStream('abcdegf'))).toBeUndefined();
      expect(parser.parse(mkStream('abdef'))).toBeUndefined();
    });
  });

  describe('seq1()', function() {
    var parser = seq1(1, literal('('), literalIC('DEF'), literal(')'));

    it('should succeed when all sub-parsers do, and return exactly 1 value',
        function() {
      var ps = parser.parse(mkStream('(def)g'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('DEF');
      expect(ps.head).toBe('g');
    });

    it('should fail if any sub-parser does', function() {
      expect(parser.parse(mkStream('(defg'))).toBeUndefined();
    });
  });

  describe('optional()', function() {
    var parser = seq(optional(literal('abc')), literalIC('DEF'));

    it('should parse its argument if possible', function() {
      var ps = parser.parse(mkStream('abcdefg'));
      expect(ps).toBeDefined();
      expect(ps.value).toEqual(['abc', 'DEF']);
      expect(ps.head).toBe('g');
    });

    it('should succeed (and return null) if its parser fails', function() {
      var ps = parser.parse(mkStream('defg'));
      expect(ps).toBeDefined();
      expect(ps.value).toEqual([null, 'DEF']);
      expect(ps.head).toBe('g');
    });
  });

  describe('notChars()', function() {
    it('should parse a single character not found in its argument', function() {
      var ps = notChars('abc').parse(mkStream('fg'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('f');
      expect(ps.head).toBe('g');
    });

    it('should fail to parse any character found in its argument', function() {
      expect(notChars('abc').parse(mkStream('a'))).toBeUndefined();
    });
  });

  describe('range()', function() {
    var parser = range('a', 'z');

    it('should parse a single character within the range', function() {
      var ps = parser.parse(mkStream('f!'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('f');
      expect(ps.head).toBe('!');
    });

    it('should be inclusive at the low end', function() {
      var ps = parser.parse(mkStream('a'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('a');
    });

    it('should be inclusive at the high end', function() {
      var ps = parser.parse(mkStream('z'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('z');
    });

    it('should fail on characters outside the range', function() {
      expect(parser.parse(mkStream('!'))).toBeUndefined();
    });
  });

  describe('sym()', function() {
    var grammar = foam.parse.ImperativeGrammar.create({
      symbols: function() {
        return {
          START: seq(sym('one'), sym('two')),
          one: literal('abc'),
          two: anyChar()
        };
      }
    }, foam.__context__);

    it('should include other rules in the grammar by name', function() {
      var res = grammar.parseString('abc!');
      expect(res).toEqual(['abc', '!']);
    });
  });

  describe('alt()', function() {
    var parser = alt(literal('abc'), literal('def'), literal('d'),
        literal('definitely'));

    it('should try each alternative in sequence, returning the first to match',
        function() {
      var ps = parser.parse(mkStream('abc'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('abc');

      ps = parser.parse(mkStream('def'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('def');

      ps = parser.parse(mkStream('de'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('d');
      expect(ps.head).toBe('e');

      // Note that alt() is greedy, and should match 'def', not 'definitely'.
      ps = parser.parse(mkStream('definitely'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('def');
      expect(ps.head).toBe('i');
    });

    it('should fail if all the alternatives do', function() {
      expect(parser.parse(mkStream('foam'))).toBeUndefined();
    });
  });

  describe('simpleAlt()', function() {
    var parser = simpleAlt(literal('abc'), literal('def'), literal('d'),
        literal('definitely'));

    it('should try each alternative in sequence, returning the first to match',
        function() {
      var ps = parser.parse(mkStream('abc'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('abc');

      ps = parser.parse(mkStream('def'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('def');

      ps = parser.parse(mkStream('de'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('d');
      expect(ps.head).toBe('e');

      // Note that alt() is greedy, and should match 'def', not 'definitely'.
      ps = parser.parse(mkStream('definitely'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('def');
      expect(ps.head).toBe('i');
    });

    it('should fail if all the alternatives do', function() {
      expect(parser.parse(mkStream('foam'))).toBeUndefined();
    });
  });

  describe('repeat()', function() {
    describe('without a separator', function() {
      it('should parse as many repetitions as possible', function() {
        var ps = repeat(notChars(';')).parse(mkStream('abc;'));
        expect(ps).toBeDefined();
        expect(ps.value).toEqual(['a', 'b', 'c']);
        expect(ps.head).toBe(';');
      });

      it('should succeed with an empty result for 0 repetitions', function() {
        var ps = repeat(notChars(';')).parse(mkStream(';'));
        expect(ps).toBeDefined();
        expect(ps.value).toEqual([]);
        expect(ps.head).toBe(';');
      });

      describe('with a minimum', function() {
        var parser = repeat(notChars(';'), undefined, 3);
        it('should succeed if there are least the minimum repetitions',
            function() {
          var ps = parser.parse(mkStream('abc;'));
          expect(ps).toBeDefined();
          expect(ps.value).toEqual(['a', 'b', 'c']);
          expect(ps.head).toBe(';');
        });

        it('should fail if there are less than the minimum repetitions',
            function() {
          expect(parser.parse(mkStream('ab;'))).toBeUndefined();
        });
      });
    });

    describe('with a separator', function() {
      it('should parse as many repetitions as possible', function() {
        var ps = repeat(notChars(',;'), literal(',')).parse(mkStream('a,b,c;'));
        expect(ps).toBeDefined();
        expect(ps.value).toEqual(['a', 'b', 'c']);
        expect(ps.head).toBe(';');
      });

      it('should succeed with an empty result for 0 repetitions', function() {
        var ps = repeat(notChars(',;'), literal(',')).parse(mkStream(';'));
        expect(ps).toBeDefined();
        expect(ps.value).toEqual([]);
        expect(ps.head).toBe(';');
      });

      describe('with a minimum', function() {
        var parser = repeat(notChars(',;'), literal(','), 3);

        it('should succeed if there are least the minimum repetitions',
            function() {
          var ps = parser.parse(mkStream('a,b,c;'));
          expect(ps).toBeDefined();
          expect(ps.value).toEqual(['a', 'b', 'c']);
          expect(ps.head).toBe(';');
        });

        it('should fail if there are less than the minimum repetitions',
            function() {
          expect(parser.parse(mkStream('ab;'))).toBeUndefined();
        });
      });
    });
  });

  describe('repeat0()', function() {
    var parser = repeat0(literal(' '));

    it('should parse many repetitions, and return ""', function() {
      var ps = parser.parse(mkStream('   !'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('');
      expect(ps.head).toBe('!');
    });

    it('should parse 0 repetitions correctly', function() {
      var ps = parser.parse(mkStream('!'));
      expect(ps).toBeDefined();
      expect(ps.value).toBe('');
      expect(ps.head).toBe('!');
    });
  });
});
