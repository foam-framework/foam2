describe('HTML Lib', function() {
  var lib;

  beforeAll(function() {
    foam.CLASS({
      package: 'foam.parsers.html',
      name: 'HTTPLibTest',
      properties: [
        {
          name: 'lib',
          factory: function() { return foam.parsers.html; }
        }
      ]
    });
    lib = foam.parsers.html.HTTPLibTest.create().lib;
  });

  it('getHTMLEscapeChar should return unescaped character', function() {
    expect(lib.getHtmlEscapeChar('lt')).toBe('<');
    expect(lib.getHtmlEscapeChar('szlig')).toBe('ß');
    expect(lib.getHtmlEscapeChar('micro')).toBe('µ');
  });

  it('unescapeString should return string with unescaped HTML entities', function() {
    expect(lib.unescapeString('if (x &lt; 3) return true;')).toBe('if (x < 3) return true;');
    expect(lib.unescapeString('std::vector<code> Foo;')).toBe('std::vector<code> Foo;');
    expect(lib.unescapeString('std::vector&lt;code&gt; Foo;')).toBe('std::vector<code> Foo;');
  });

  it('unescapeString should not replace invalid HTML entities', function() {
    expect(lib.unescapeString('&Potato; Foo;')).toBe('&Potato; Foo;');
    expect(lib.unescapeString('&lt')).toBe('&lt');
    expect(lib.unescapeString('lt;')).toBe('lt;');
  });
});
