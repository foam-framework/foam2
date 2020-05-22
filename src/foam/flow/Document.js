/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.flow',
  name: 'Document',

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      class: 'String',
      name: 'title'
    },
    {
      class: 'String',
      name: 'markup',
      view: { class: 'foam.flow.MarkupEditor' }
    }
  ],

  methods: [
    function toE(args, x) {
      var f = this.htmlish.parseString(this.markup, this.cls_.id);
      return f ? f(x) :
        x.E('span').add(this.htmlish.getLastError());
    }
  ],

  grammars: [
    {
      name: 'htmlish',
      symbols: function() {
        return {
          "foam.flow.Document": seq(optional(sym('title')),
                                    sym('content'),
                                    eof()),

          'title': seq1(1, '<title>', join(until('</title>'))),

          'content': repeat(alt(sym('entity'),
                                sym('tag'),
                                sym('text'))),

          'text': substring(plus(not(alt(sym('entity'),
                                         chars('<')),
                                     anyChar()))),

          'entity': seq1(1, '&', alt('nbsp', 'lt', 'gt', 'amp'), ';'),

          'normal-tag': seq('<', sym('tag-identifier'), sym('attributes'), '>', sym('content'), '</', sym('tag-identifier'), '>'),
          'self-closed-tag': seq('<', sym('tag-identifier'), sym('attributes'), '/>'),

          // TODO: FOAM tags have their own entry because the registerElement support
          // does not actually take effect during Element.start/tag/add
          'tag': alt(sym('foam'),
                     sym('code'),
                     sym('self-closed-tag'),
                     sym('normal-tag')),

          'tag-identifier': substring(plus(notChars(' />'))),

          'xtag': alt(sym('br'),
                     sym('bold'),
                     sym('italic'),
                     sym('paragraph'),
                     sym('unordered-list'),
                     sym('ordered-list'),
                     sym('code'),
                     sym('anchor'),
                     sym('section'),
                     sym('h1'),
                     sym('h2'),
                     sym('h3'),
                     sym('h4'),
                     sym('h5'),
                     sym('h6'),
                     sym('foam')),

          'br': seq('<br/>'),

          'section': seq('<section', sym('attributes'), '>', sym('content'), '</section>'),
          'paragraph': seq1(1, '<p>', sym('content'), '</p>'),
          'anchor': seq('<a', sym('attributes'), '>', sym('content'), '</a>'),
          'h1': seq1(1, '<h1>', sym('content'), '</h1>'),
          'h2': seq1(1, '<h2>', sym('content'), '</h2>'),
          'h3': seq1(1, '<h3>', sym('content'), '</h3>'),
          'h4': seq1(1, '<h4>', sym('content'), '</h4>'),
          'h5': seq1(1, '<h5>', sym('content'), '</h5>'),
          'h6': seq1(1, '<h6>', sym('content'), '</h6>'),

          'bold': seq1(1, '<b>', sym('content'), '</b>'),
          'italic': seq1(1, '<i>', sym('content'), '</i>'),

          'ws': repeat(chars(' \r\n\t')),

          'unordered-list':seq1(1,
                                '<ul>',
                                repeat(seq1(1,
                                            sym('ws'),
                                            sym('list-item'))),
                                sym('ws'),
                                '</ul>'),

          'ordered-list': seq1(1,
                               '<ol>',
                               repeat(seq1(1,
                                           sym('ws'),
                                           sym('list-item'))),
                               sym('ws'),
                               '</ol>'),

          'list-item': seq1(1,
                            '<li>',
                            sym('content'),
                            '</li>'),

          'code': seq1(1, '<code>', join(until('</code>'))),

          'foam': seq1(1, '<foam', sym('attributes'), '/>'),

          'attributes': repeat(sym('attrib-key-value'), ' '),

          'attrib-key-value': seq(sym('attrib-key'),
                                  '="',
                                  sym('attrib-value'),
                                  '"'),

          'attrib-key': seq1(1, repeat0(' '), plus(notChars('=>'))),
          'attrib-value': repeat(notChars('"'))
        }
      },
      actions: {
        "foam.flow.Document": function(v) {
          if ( foam.String.isInstance(v[0]) ) this.title = v[0];

          var children = v[1];
          var self = this;

          return function(x) {
            return x.
              E('article').
              cssClass('foam-flow-Document').
              call(children, [x]);
          };
        },

        'text': function(str) {
          return function(x) {
            this.add(str);
          };
        },

        'br': function() {
          return function(x) { this.tag('br'); }
        },

        'content': function(children) {
          return function(x) {
            this.forEach(children, function(c) { c.call(this, x); });
          };
        },

        'normal-tag': function(v) {
          var openIdent = v[1];
          var closeIdent = v[6];
          var attributes = v[2];
          var children = v[4];

          if ( closeIdent !== openIdent ) {
            console.warn("Expected close of", openIdent, "but instead found close of", closeIdent);
          }

          return function(x) {
            this.
              start(openIdent).
              attrs(attributes).
              call(children, [x]).
              end();
          }
        },

        'self-closed-tag': function(v) {
          var ident = v[1];
          var attributes = v[2];
          return function(x) {
            this.
              start(ident).
              attrs(attributes).
              end();
          };
        },

        'section': function(v) {
          var attributes = v[1];
          var children = v[3];
          return function(x) {
            this.
              start('section').
              call(children, [x]).
              end();
          };
        },

        'paragraph': function(content) {
          return function(x) {
            this.
              start('p').
              call(content, [x]).
              end();
          };
        },

        'anchor': function(v) {
          var attributes = v[1];
          var children = v[3];
          return function(x) {
            this.
              start('a').
              callIf(attributes.href, function() { this.setAttribute('href', attributes.href); }).
              call(children, [x]).
              end();
          };
        },

        'entity': function(e) {
          return function() { this.entity(e); };
        },

        'h1': function(content) {
          return function(x) {
            this.start('h1').
              call(content, [x]).
              end();
          };
        },

        'h2': function(v) {
          return function(x) {
            this.start('h2').
              call(v, [x]).
              end();
          };
        },

        'h3': function(v) {
          return function(x) {
            this.start('h3').
              call(v, [x]).
              end();
          };
        },

        'h4': function(v) {
          return function(x) {
            this.start('h4').
              call(v, [x]).
              end();
          };
        },

        'h5': function(v) {
          return function(x) {
            this.start('h5').
              call(v, [x]).
              end();
          };
        },

        'h6': function(v) {
          return function(x) {
            this.start('h6').
              call(v, [x]).
              end();
          };
        },

        'bold': function(v) {
          var children = v;
          return function(x) {
            this.
              start('b').
              call(children, [x]).
              end();
          };
        },

        'italic': function(v) {
          var children = v;
          return function(x) {
            this.
              start('i').
              call(children, [x]).
              end();
          };
        },

        'unordered-list': function(v) {
          var children = v;
          return function(x) {
            this.
              start('ul').
              forEach(children, function(c) { c.call(this, x); }).
              end();
          };
        },


        'ordered-list': function(v) {
          var children = v;
          return function(x) {
            this.
              start('ol').
              forEach(children, function(c) { c.call(this, x); }).
              end();
          };
        },


        'list-item': function(children) {
          return function(x) {
            this.
              start('li').
              call(children, [x]).
              end();
          };
        },

        'code': function(code) {
          return function(x) {
            this.
              start('pre').
                cssClass('code').
                add(code).
              end();
          };
        },

        'foam': function(attributes) {
          return function(x) {
            var viewName = attributes.view;
            var className = attributes.class;

            // TODO: Reuse FoamTagLoader support
            var promise = Promise.all([
              viewName ? x.classloader.load(viewName) : Promise.resolve(),
              className ? x.classloader.load(className) : Promise.resolve(),
            ])

            var self = this;
            this.add(promise.then(function(o) {
              return self.E().
                callIf(o, function() {
                  var cls = x.lookup(className, true);
                  var view = x.lookup(viewName, true);

                  if ( className && ! cls )
                    this.add('Unknown class', className);
                  if ( viewName && ! view )
                    this.add('Unknown view', viewName);

                  if ( ! cls && ! view ) return;

                  var obj = cls.create(attributes, this);

                  if ( ! viewName ) this.add(obj)
                  else this.tag(view, { data: obj });
                });
            }))

          };
        },

        'attributes': function(v) {
          return v.reduce(function(a, kv) {
            a[kv[0]] = kv[1];
            return a;
          }, {});
        },

        'attrib-key-value': function(v) {
          return [v[0], v[2]];
        },

        'attrib-key': function(v) {
          return v.join('');
        },

        'attrib-value': function(v) {
          return v.join('');
        }
      }
    }
  ]
});
