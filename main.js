//
//
// MNRowView + Grid DAO test
//
//

if ( ! window.Worker ) throw new Error('No Worker');

// Replace default window with SingleRAF window.
// foam.__context__ = foam.core.Window.create(
//   { window: global },
//   foam.u2.SingleRAF.create()
// ).__subContext__;

var ctx = foam.box.Context.create({ myname: '/main' });
ctx.parser = ctx.generator = foam.json.NetworkJSON;

ctx.registry.register('ready', null, foam.box.SkeletonBox.create({
  data: test.Ready.create({
    run: function() {
      var view = foam.u2.view.ScrollDAOView.create({
        numRows: 40,
        negativeRunway: 200,
        positiveRunway: 200,
        dao: foam.dao.ClientDAO.create({
          delegate: foam.box.NamedBox.create({
            name: '/worker/grid'
          }, ctx)
        }, ctx),
        rowFormatter: foam.u2.MNRowFormatter.create(null, ctx)
      }, ctx);
      view.write();
    }
  }, ctx)
}, ctx));

foam.box.NamedBox.create({
  name: '/worker',
  delegate: foam.box.MessagePortBox.create({
    target: new Worker('worker.js')
  }, ctx)
}, ctx);

var stubFactory = foam.core.StubFactorySingleton.create(null, ctx);
var ReadyStub = stubFactory.get(test.Ready);
ReadyStub.create({
  delegate: foam.box.NamedBox.create({ name: '/worker/ready' }, ctx)
}, ctx).go();
