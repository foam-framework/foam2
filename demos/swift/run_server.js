/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

// Enable FOAM swift support.
global.FOAM_FLAGS = {
  'node': true,
  'debug': true,
};

var dir = __dirname;
var root = dir + '/../..';

require(root + '/src/foam.js');

var srcPaths = [
  dir + '/../../src',
  dir + '/js',
]

var executor = foam.classloader.NodeJsModelExecutor.create({
  classpaths: srcPaths,
});

Promise.all([
  executor.__subContext__.arequire('Test'),
]).then(function(models) {
  var Test = foam.lookup('Test');

  var box = foam.box.Context.create({
    myname: '/test',
  });
  box.socketService = foam.net.node.SocketService.create({
    port: 7000,
    delegate: box.registry,
  }, box)

  var dao = foam.dao.EasyDAO.create({
    of: Test,
    daoType: 'MDAO',
  });

  dao.put(Test.create({firstName: 'Mike'}));

  box.registry.register(
    'TestDAO',
    null,
    foam.box.SkeletonBox.create({
      data: dao,
    })
  )

  box.socketService
});
