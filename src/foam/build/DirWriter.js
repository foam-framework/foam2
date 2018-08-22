/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.build',
  name: 'DirWriter',
  requires: [
    'foam.build.FileTreeSink',
    'foam.build.StrippedModelDAO',
  ],
  properties: [
    {
      name: 'flags',
      value: ['js', 'web', 'debug'],
    },
    {
      name: 'outDir',
      value: 'STRIPPED/src',
    },
    {
      name: 'srcDir',
      value: 'src',
    },
    {
      name: 'strippedModelDAO',
      expression: function(flags, srcDir) {
        return this.StrippedModelDAO.create({
          flags: flags,
          srcDir: srcDir
        });
      },
    },
  ],
  methods: [
    function execute() {
      var self = this;
      return self.strippedModelDAO.select(self.FileTreeSink.create({
        dir: self.outDir,
      })).then(function(s) {
        console.log('Done writing to', self.outDir);
      });
    },
  ],
});
