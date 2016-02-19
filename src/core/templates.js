foam.CLASS({
  package: 'foam.templates',
  name: 'TemplateOutput',
  properties: [
    {
      name: 'buf',
      factory: function() { return []; }
    }
  ],
  methods: [
    function output() {
      for ( var i = 0 ; i < arguments.length ; i++ ) {
        var o = arguments[i];

        if ( typeof o === 'object' ) {
          this.buf.push(o.toString());
        } else {
          this.buf.push(o);
        }
      }
    },
    function toString() {
      return this.buf.length == 0 ? '' :
        this.buf.length == 1 ? this.buf[0] :
        this.buf.join('');
    }
  ]
});

foam.CLASS({
  package: 'foam.templates',
  name: 'TemplateUtil',
  axioms: ['foam.patterns.Singleton'],

  grammar: function(repeat0, simpleAlt, sym, seq1, seq, repeat, notChars, anyChar, not, optional, literal) {
    return {
      markup: repeat0(simpleAlt(
        sym('comment'),
        sym('create child'),
        sym('simple value'),
        sym('live value tag'),
        sym('raw values tag'),
        sym('values tag'),
        sym('code tag'),
        sym('ignored newline'),
        sym('newline'),
        sym('single quote'),
        sym('text')
      )),

      'comment': seq1(1, '<!--', repeat0(not('-->', anyChar)), '-->'),


      'create child': seq(
        '$$',
        repeat(notChars(' $\r\n<{,.'))),

      'simple value': seq('%%', repeat(notChars(' ()-"\r\n><:;,')), optional('()')),

      'live value tag': seq('<%#', repeat(not('%>', anyChar)), '%>'),

      'raw values tag': simpleAlt(
        seq('<%=', repeat(not('%>', anyChar)), '%>'),
        seq('{{{', repeat(not('}}}', anyChar)), '}}}')
      ),

      'values tag': seq('{{', repeat(not('}}', anyChar)), '}}'),

      'code tag': seq('<%', repeat(not('%>', anyChar)), '%>'),
      'ignored newline': simpleAlt(
        literal('\\\r\\\n'),
        literal('\\\n')
      ),
      newline: simpleAlt(
        literal('\r\n'),
        literal('\n')
      ),
      'single quote': literal("'"),
      text: anyChar
    };
  },

  properties: [
    {
      name: 'out',
      factory: function() {
        return [];
      }
    },
    {
      name: 'simple',
      defaultValue: true
    },
    {
      name: 'ps',
      factory: function() {
        return foam.parsers.StringPS.create();
      }
    }
  ],

  constants: {
    HEADER: 'var self = this, X = this.X, Y = this.Y;\n' +
      'var output = opt_outputter ? opt_outputter : TOC(this);\n' +
      'var out = output.output.bind(output);\n' +
      "out('",
    FOOTER: "');\nreturn opt_outputter ? output : output.toString();\n"
  },

  methods: [
    function push() {
      this.simple = false;
      this.pushSimple.apply(this, arguments);
    },
    function pushSimple() {
      this.out.push.apply(this.out, arguments);
    },
    function compile(t, name, args) {
      this.ps.setString(t);
      var result = this.markup(this.ps);
      if ( ! result ) {
        throw "Error parsing template " + name;
      }
      result = result.value;

      var code = this.HEADER + result[1] + this.FOOTER;

      var args = ['opt_outputter'].concat(args);
      var f = eval(
        '(function() { ' +
          'var TOC = function(o) { return foam.templates.TemplateOutput.create(); };' +
          'var f = function(' + args.join(',') + '){' + code + '};' +
          'return function() { '+
          'if ( arguments.length && arguments[0] && ! arguments[0].output ) return f.apply(this, [undefined].concat(foam.array.argsToArray(arguments)));' +
          'return f.apply(this, arguments);};})()');

      return f;
    },
    function lazyCompile(t, name, args) {
      return (function(util) {
        var delegate;
        return function() {
          if ( ! delegate ) {
            delegate = util.compile(t, name, args)
          }
          return delegate.apply(this, arguments);
        };
      })(this);
    }
  ],

  grammarActions: [
    function markup (v) {
      var wasSimple = this.simple;
      var ret = wasSimple ? null : this.out.join('');
      this.out = [];
      this.simple = true;
      return [wasSimple, ret];
    },
    {
      name: 'create child',
      code: function(v) {
        var name = v[1].join('');
        this.push(
          "', self.createTemplateView('", name, "'",
          v[2] ? ', ' + v[2] : '',
          "),\n'");
      }
    },
    {
      name: 'simple value',
      code: function(v) {
        this.push("',\n self.",
                  v[1].join(''),
                  v[2],
                  ",\n'");
      },
    },
    {
      name: 'raw values tag',
      code: function (v) {
        this.push("',\n",
                  v[1].join(''),
                  ",\n'");
      },
    },
    {
      name: 'values tag',
      code:     function (v) {
        this.push("',\nescapeHTML(",
                  v[1].join(''),
                  "),\n'");
      },
    },
    {
      name: 'live value tag',
      code: function (v) {
        this.push("',\nself.dynamicTag('span', function() { return ",
                  v[1].join(''),
                  "; }.bind(this)),\n'");
      },
    },
    {
      name: 'code tag',
      code: function (v) {
        this.push("');\n",
                  v[1].join(''),
                  ";out('");
      },
    },
    {
      name: 'single quote',
      code: function () {
        this.pushSimple("\\'");
      },
    },
    function newline() {
      this.pushSimple('\\n');
    },
    function text(v) {
      this.pushSimple(v);
    }
  ]
});


foam.CLASS({
  name: 'TemplateBenchmark',
  constants: {
    JAVA_SOURCE: '// Generated by FOAM, do not modify.\n' +
'// Version <%= this.version %><%\n' +
'  var className       = this.javaClassName;\n' +
"'  var parentClassName = 'AbstractFObject';\n" +
"  var parentModel = '';\n" +
"  if (this.extends) {\n" +
"    parentClassName = this.extends;\n" +
"    parentModel = this.extends + '.MODEL(), ';\n" +
"  }\n" +
"  if ( GLOBAL[parentClassName] && GLOBAL[parentClassName].abstract )\n" +
"    parentClassName = 'Abstract' + parentClassName;\n" +
"%><% if ( this.package ) { %>\n" +
"package <%= this.package %>;\n" +
"<% } %>\n" +
"import foam.core.*;\n" +
"import foam.dao.*;\n" +
"import java.util.Arrays;\n" +
"import java.util.List;\n" +
"\n" +
"public<%= this.abstract ? ' abstract' : '' %> class <%= className %>\n" +
"    extends <%= parentClassName %> {\n" +
"<% for ( var key in this.properties ) {\n" +
"  var prop = this.properties[key];\n" +
"  if ( prop.labels && prop.labels.indexOf('compiletime') != -1  )\n" +
"    continue;\n" +
"  javaSource.propertySource.call(this, out, prop);\n" +
"}\n" +
"if (this.relationships && this.relationships.length) {\n" +
"  for ( var i = 0; i < this.relationships.length; i++) {\n" +
"    var rel = this.relationships[i];\n" +
"    javaSource.relationshipSource.call(this, out, rel);\n" +
"  }\n" +
"}\n" +
"\n" +
"var allProps = this.getRuntimeProperties();\n" +
"allProps = allProps.filter(function(m) {\n" +
"  if ( m.labels &&\n" +
"        ( m.labels.indexOf('java') == -1 ||\n" +
"          m.labels.indexOf(\"compiletime\") != -1 ) ) {\n" +
"    return false;\n" +
"  }\n" +
"  return true;\n" +
"});\n" +
"\n" +
" %>\n" +
"final static Model model__ = new AbstractModel(<%= parentModel %>new Property[] {<% for (var i = 0; i < allProps.length; i++) { var prop = allProps[i]; %> <%= constantize(prop.name) %>,<% } %>} , new Relationship[] {<% if (this.relationships && this.relationships.length) { for (var i = 0; i < this.relationships.length; i++) { %> <%= constantize(this.relationships[i].name) %>, <% } } %> }) {\n" +
"    public String getName() { return \"<%= this.id %>\"; }\n" +
"    public String getShortName() { return \"<%= this.name %>\"; }\n" +
"    public String getLabel() { return \"<%= this.label %>\"; }\n" +
"    public Property getID() { return <%= this.ids.length ? constantize(this.ids[0]) : 'null' %>; }\n" +
"    public FObject newInstance() { return new <%= className %>(); }\n" +
"  };\n" +
"\n" +
"  public Model model() {\n" +
"    return model__;\n" +
"  }\n" +
"  public static Model MODEL() {\n" +
"    return model__;\n" +
"  }\n" +
"\n" +
"  public int hashCode() {\n" +
"    int hash = 1;\n" +
"<% for (var i = 0; i < allProps.length; i++) { var prop = allProps[i]; %>\n" +
"    hash = hash * 31 + hash(<%= prop.name %>_);<% } %>\n" +
"\n" +
"    return hash;\n" +
"  }\n" +
"\n" +
"  public int compareTo(Object obj) {\n" +
"    if ( obj == this ) return 0;\n" +
"    if ( obj == null ) return 1;\n" +
"\n" +
"    <%= this.name %> other = (<%= this.name %>) obj;\n" +
"\n" +
"    int cmp;\n" +
"<% for (var i = 0; i < allProps.length; i++) { var prop = allProps[i]; %>\n" +
"    if ( ( cmp = compare(get<%= prop.name.capitalize() %>(), other.get<%= prop.name.capitalize() %>()) ) != 0 ) return cmp;<% } %>\n" +
"\n" +
"    return 0;\n" +
"  }\n" +
"\n" +
"  public StringBuilder append(StringBuilder b) {\n" +
"    return b<% for (var i = 0; i < allProps.length; i++) { var prop = allProps[i]; %>\n" +
"        .append(\"<%= prop.name %>=\").append(get<%= prop.name.capitalize() %>())<%= i < allProps.length - 1 ? '.append(\", \")' : '' %><% } %>;\n" +
"  }\n" +
"\n" +
"  public <%= className %> fclone() {\n" +
"    <%= this.name %> c = new <%= this.name %>();\n" +
"<% for (var i = 0; i < allProps.length; i++) { var prop = allProps[i]; %>\n" +
"    c.set<%= prop.name.capitalize() %>(get<%= prop.name.capitalize() %>());<% } %>\n" +
"    return c;\n" +
"  }\n" +
"<%\n" +
"  function feature(f) {\n" +
"    f.javaSource$f && f.javaSource$f(out, self);\n" +
"  }\n" +
"\n" +
"  this.methods.forEach(feature);\n" +
"  this.listeners.forEach(feature);\n" +
"%>\n" +
      "}\n"
  },
  grammar: function(alt, repeat, seq, literal) {
    return {
      start: alt(
        literal("hello world"),
        literal("help me"))
    }
  },
  methods: [
    function benchmark() {

      var ps = foam.parsers.StringPS.create();
      var util = foam.templates.TemplateUtil.create();

      console.time('template-util');
      for ( var i = 0 ; i < 500; i++ ) {
        ps.setString(this.JAVA_SOURCE);
        util.markup(ps);
      }
      console.timeEnd('template-util');
    }
  ]
});


foam.CLASS({
  package: 'foam.templates',
  name: 'TemplateAxiom',
  extends: 'Method',
  properties: [
    {
      name: 'name'
    },
    {
      name: 'template',
      type: 'String'
    },
    {
      name: 'args',
    }
  ],
  methods: [
    function installInProto(proto) {
      proto[this.name] =
        foam.templates.TemplateUtil.create().lazyCompile(this.template, this.name, this.args || []);
    }
  ]
});

foam.CLASS({
  package: 'foam.templates',
  name: 'TemplateExtension',
  refines: 'foam.core.Model',
  properties: [
    {
      name: 'templates',
      type: 'AxiomArray',
      adaptArrayElement: function(o) {
        return foam.templates.TemplateAxiom.create(o);
      }
    }
  ]
});
