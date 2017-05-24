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

jasmine.DEFAULT_TIMEOUT_INTERVAL = 1000000;

describe('HTMLLexer', function() {
  var parser;

  beforeAll(function() {
    parser = foam.parsers.HTMLLexer.create();
  });

  function gist(str) {
    if ( str.length <= 20 ) return str;
    return str.substr(0, 10) + ' [...] ' + str.substr(-10);
  }

  function testParse(production, str) {
    var res = parser.parseString(str, production);
    if ( ! res ) {
      fail(`Failed to parse ${production} "${gist(str)}"`);
      return undefined;
    }
    if ( res.pos !== str.length ) {
      fail(`Failed to parse ${production} "${gist(str)}"`);
      return undefined;
    }
    expect(res.value).toBeDefined();
    return res.value;
  }

  it('should parse DOCTYPEs', function() {
    [
      '<!DOCTYPE html>',
      '<!doctype html>',
      '<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">',
      '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
      `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"
            "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">`,

    ].forEach(testParse.bind(this, 'doctype'));
  });

  it('should parse language declaration', function() {
    [
      '<?xml version="1.0" encoding="UTF-8"?>'
    ].forEach(testParse.bind(this, 'langTag'));
  });

  it('should parse unescaped <pre>/<code>', function() {
    [
      '<pre>if ( x < 3 ) return true</pre>',
      '<code>if ( x < 3 ) return true</code>',
    ].forEach(function(str) {
      var value = testParse('maybeEmbed', str);
      if ( ! value ) return;

      expect(foam.parsers.html.Embed.isInstance(value)).toBe(true);
      expect(Array.isArray(value.content)).toBe(true);
      expect(value.content.length).toBe(1);
      expect(value.content[0]).toBe('if ( x < 3 ) return true');
    });
  });

  it('should parse markup inside escaped <pre>/<code>', function() {
    [
      '<pre><div>text</div></pre>',
      '<code><div>text</div></code>',
    ].forEach(function(str) {
      var value = testParse('maybeEmbed', str);
      if ( ! value ) return;

      expect(foam.parsers.html.Embed.isInstance(value)).toBe(true);
      expect(Array.isArray(value.content)).toBe(true);
      expect(value.content.length).toBe(3);
      expect(value.content[1]).toBe('text');
    });
  });

  it('should parse escaped <pre>/<code>', function() {
    [
      '<pre>if ( x &lt; 3 ) return true</pre>',
      '<code>if ( x &lt; 3 ) return true</code>',
    ].forEach(function(str) {
      var value = testParse('maybeEmbed', str);
      if ( ! value ) return;

      expect(foam.parsers.html.Embed.isInstance(value)).toBe(true);
      expect(Array.isArray(value.content)).toBe(true);
      expect(value.content.length).toBe(1);
      expect(value.content[0]).toBe('if ( x < 3 ) return true');
    });
  });

  it('should parse <script>/<style>/<xmp> as embedded content', function() {
    [
      '<script type="text/javascript">sc < ri ? p &gt; t : en</script>',
      '<style type="text/css">sc < ri ? p &gt; t : en</style>',
      '<xmp class="noescape">sc < ri ? p &gt; t : en</xmp>',
    ].forEach(function(str) {
      var value = testParse('embed', str);
      if ( ! value ) return;

      expect(foam.parsers.html.Embed.isInstance(value)).toBe(true);
      expect(Array.isArray(value.content)).toBe(true);
      expect(value.content.length).toBe(1);
      expect(value.content[0]).toBe('sc < ri ? p &gt; t : en');
    });
  });

  it('should parse attribute values', function() {
    [
      'foo-bar-baz',
      '"baz-bar-foo"',
      "'baz-bar-foo'",
      'https://user:password@example.com?query=value&skip=2#hash'
    ].forEach(testParse.bind(this, 'value'));
  });

  it('should parse attribute names', function() {
    [
      'foo-bar-baz',
      'baz_bar_foo',
      'some+thing'
    ].forEach(testParse.bind(this, 'label'));
  });

  it('should parse tags with one attribute', function() {
    [
        '<div name="TestDiv1" />',
        '<label id=3 />',
        '<pre class="idl">Some stuff here</pre>'
    ].forEach(function(str) {
      var value = testParse('htmlPart', str);
      if ( ! value ) return;

      expect(Array.isArray(value.attributes)).toBe(true);
      expect(value.attributes.length).toBe(1);
      expect(value.attributes[0]).toBeDefined();
    });
  });

  it('should parse tags with multiple attributes (Part 1)', function() {
    [
        '<div id=1 name="TestDiv2" visible=true />',
        '<label name="TestLabel" id=2 visible />',
        '<pre class="idl" visible=false id=3><div>Some more content</div></pre>'
    ].forEach(function(str, index) {
      var value = testParse('htmlPart', str);
      if ( ! value ) return;

      expect(Array.isArray(value.attributes)).toBe(true);
      expect(value.attributes).toBeDefined();
      expect(value.attributes.length).toBeGreaterThan(2);
      expect(value.attributes[index].name).toBe('id');
      expect(value.attributes[index].value).toBe((index + 1).toString());
    });
  });

  it('should parse tags with multiple attributes (Part 2)', function() {
    var value = testParse('htmlPart',
        '<div id=3 name=multiAttributeTest visible disabled=false />');
    var attributes = [
      { name: 'id', value: '3' },
      { name: 'name', value: 'multiAttributeTest' },
      { name: 'visible', value: '' },
      { name: 'disabled', value: 'false' }
    ];
    expect(value).toBeDefined();
    expect(value.attributes).toBeDefined();
    expect(value.attributes.length).toBe(4);

    for (var i = 0; i < attributes.length; i++) {
      expect(value.attributes[i].name).toBe(attributes[i].name);
      expect(value.attributes[i].value).toBe(attributes[i].value);
    }
  });

  it('should parse attributes without value', function() {
    var value = testParse('htmlPart', '<pre visible />');
    expect(value.attributes).toBeDefined();
    expect(value.attributes[0].name).toBe('visible');
    expect(value.attributes[0].value).toBe('');
  });

  it('should parse attributes without quotes', function() {
    var value = testParse('htmlPart', '<pre name=someUniqueName />');
    expect(value.attributes).toBeDefined();
    expect(value.attributes[0].name).toBe('name');
    expect(value.attributes[0].value).toBe('someUniqueName');
  });

  it('should parse attributes in single quotes', function() {
    var value = testParse('htmlPart', '<div type=\'Potato\' />');
    expect(value.attributes).toBeDefined();
    expect(value.attributes[0].name).toBe('type');
    expect(value.attributes[0].value).toBe('Potato');
  });

  it('should parse attributes with escaped characters', function() {
    var value = testParse('htmlPart', '<option value="&amp;Potato" />');
    expect(value.attributes).toBeDefined();
    expect(value.attributes[0].name).toBe('value');
    expect(value.attributes[0].value).toBe('&Potato');
  });

  it('should parse attributes with illegitmate', function() {
  });

  it('should parse attributes containing whitespace', function() {
    var value = testParse('htmlPart', '<label value="Fish\nPotato" />');
    expect(value.attributes).toBeDefined();
    expect(value.attributes[0].name).toBe('value');
    expect(value.attributes[0].value).toBe('Fish\nPotato');
  });

  it('should parse comments', function() {
    [
      '<!-- -- > <\n<\t<\r->-->'
    ].forEach(testParse.bind(this, 'comment'));
  });

  it('should parse the W3C Web IDL spec', function() {
    testParse(
      'START',
      require('fs').readFileSync(`${__dirname}/webidl-spec.html`).toString());
  });

  xit('should parse the WHATWG HTML spec', function() {
    testParse(
      'START',
      require('fs').readFileSync(`${__dirname}/html-spec.html`).toString());
  }).pend('This test is thorough, but slow');
});
