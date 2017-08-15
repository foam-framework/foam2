//
//
// MNRowView + Grid DAO test
//
//

self.window = self.global = self;
self.FOAM_BOOT_PATH = 'src/';
importScripts('src/foam.js', 'shared.js');
var ctx = foam.box.Context.create({
  myname: '/worker'
});
ctx.parser = ctx.stringifier = foam.json.NetworkJSON;

self.onmessage = function(event) {
  if ( ! event.data instanceof MessagePort ) {
    throw new Error('Unexpected control message', event.data);
  }

  ctx.messagePortService.addPort(event.data);
};

var sourceDAO = foam.dao.MDAO.create({ of: test.Source }, ctx);
var targetDAO = foam.dao.MDAO.create({ of: test.Target }, ctx);
var junctionDAO = foam.dao.MDAO.create({ of: test.SourceTargetJunction }, ctx);
var grid = foam.dao.grid.ManyToManyGridDAO.create(
    null, ctx.__subContext__.createSubContext({
      sourceDAO: sourceDAO,
      targetDAO: targetDAO,
      sourceTargetJunctionDAO: junctionDAO,
      relationship: test.SourceTargetRelationship
    }));

ctx.registry.register('grid', null, foam.box.SkeletonBox.create({
  data: grid
}, ctx));

var numSources = 5;
var numTargets = 500;

var sources = new Array(numSources);
for ( var i = 0; i < numSources; i++ ) {
  sources[i] = test.Source.create();
}
var targets = new Array(numTargets);
var junctions = [];
for ( var i = 0; i < numTargets; i++ ) {
  targets[i] = test.Target.create();
  for ( var j = 0; j < numSources; j++ ) {
    if ( i % numSources === j ) {
      junctions.push(test.SourceTargetJunction.create({
        sourceId: sources[j].id,
        targetId: targets[i].id
      }));
    }
  }
}

var promise = Promise.all(
        sources.map(function(source) { return sourceDAO.put(source); }).
        concat(targets.map(function(target) {
          return targetDAO.put(target);
        })).
        concat(junctions.map(function(junction) {
          return junctionDAO.put(junction);
        })));

ctx.registry.register('ready', null, foam.box.SkeletonBox.create({
  data: test.Ready.create({
    run: function() {
      var stubFactory = foam.core.StubFactorySingleton.create(null, ctx);
      var ReadyStub = stubFactory.get(test.Ready);
      promise.then(function() {
        ReadyStub.create({
          delegate: foam.box.NamedBox.create({ name: '/main/ready' }, ctx)
        }, ctx).go();
      });
    }
  }, ctx)
}, ctx));

ctx.messagePortService.parser;
