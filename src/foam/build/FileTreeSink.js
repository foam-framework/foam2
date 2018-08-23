/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build',
  name: 'FileTreeSink',
  extends: 'foam.dao.AbstractSink',

  flags: ['node'],

  requires: [
    'foam.build.JsCodeOutputter',
  ],

  properties: [
    {
      name: 'o',
      factory: function() { return this.JsCodeOutputter.create() }
    },
    {
      class: 'String',
      name: 'dir',
    },
    {
      name: 'fs',
      factory: function() { return require('fs'); }
    },
    {
      name: 'sep',
      factory: function() { return require('path').sep; }
    },
  ],

  methods: [
    {
      name: 'put',
      code: function(o) {
        var p = o.id.split('.');
        var f = p.pop();

        // Because fs.mkdir doesn't have a -p.
        var dirs = this.dir.split(this.sep).concat(p);
        var path = '';
        while ( dirs.length ) {
          path = path + dirs.shift() + this.sep;
          if ( ! this.fs.existsSync(path) ) this.fs.mkdirSync(path);
        }

        path = path + `${f}.js`;
        this.fs.writeFileSync(path, this.o.stringify(this.__context__, o), 'utf8');
      },
    },
  ]
});
