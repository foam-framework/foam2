describe('HTML Lib', function() {
  var lib;

  beforeAll(function() {
    lib = foam.parsers.html;
  });

  it('getHTMLEscapeChar should return unescaped character', function() {
    expect(lib.getHtmlEscapeChar('lt')).toBe('<');
    expect(lib.getHtmlEscapeChar('szlig')).toBe('ß');
    expect(lib.getHtmlEscapeChar('micro')).toBe('µ');
  });

  it('getHTMLEscapeSequence should return escape sequence', function() {
    expect(lib.getHtmlEscapeSequence('<')).toBe('lt');
    expect(lib.getHtmlEscapeSequence('ß')).toBe('szlig');
    expect(lib.getHtmlEscapeSequence('µ')).toBe('micro');
  });

  it('unescapeString should return string with unescaped HTML entities', function() {
    expect(lib.unescapeString('if (x &lt; 3) return true;')).
        toBe('if (x < 3) return true;');
    expect(lib.unescapeString('std::vector<code> Foo;')).
        toBe('std::vector<code> Foo;');
    expect(lib.unescapeString('std::vector&lt;code&gt; Foo;')).
        toBe('std::vector<code> Foo;');
  });

  it('unescapeString should not replace invalid HTML entities', function() {
    expect(lib.unescapeString('&Potato; Foo;')).toBe('&Potato; Foo;');
    expect(lib.unescapeString('&lt')).toBe('&lt');
    expect(lib.unescapeString('lt;')).toBe('lt;');
  });

  it('escapeString should return string with escaped HTML entities; unescapeString should invert escaping', function() {
    function checkEscapeAndSymmetry(unescaped, escaped) {
      var result = lib.escapeString(unescaped);
      expect(result).toBe(escaped);
      expect(lib.unescapeString(result)).toBe(unescaped);
    }
    checkEscapeAndSymmetry('if (x &lt; 3) return true;',
                           '&#105;&#102;&#32;&#40;&#120;&#32;&amp;&#108;&#116;&#59;&#32;&#51;&#41;&#32;&#114;&#101;&#116;&#117;&#114;&#110;&#32;&#116;&#114;&#117;&#101;&#59;');
    checkEscapeAndSymmetry('std::vector<code> Foo;',
                           '&#115;&#116;&#100;&#58;&#58;&#118;&#101;&#99;&#116;&#111;&#114;&lt;&#99;&#111;&#100;&#101;&gt;&#32;&#70;&#111;&#111;&#59;');
    checkEscapeAndSymmetry('std::vector<code> Foo;',
                           '&#115;&#116;&#100;&#58;&#58;&#118;&#101;&#99;&#116;&#111;&#114;&lt;&#99;&#111;&#100;&#101;&gt;&#32;&#70;&#111;&#111;&#59;');
    checkEscapeAndSymmetry('std::vector&lt;code&gt; Foo;',
                           '&#115;&#116;&#100;&#58;&#58;&#118;&#101;&#99;&#116;&#111;&#114;&amp;&#108;&#116;&#59;&#99;&#111;&#100;&#101;&amp;&#103;&#116;&#59;&#32;&#70;&#111;&#111;&#59;');
  });
});
