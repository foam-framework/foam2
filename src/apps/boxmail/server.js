require('./bootFOAMNode.js');

var env = foam.box.Context.create();

// Force services to start.
env.socketService;
env.webSocketService;

env.registry.register(
  'INBOX',
  null,
  foam.box.SkeletonBox.create({
    data: foam.dao.TimestampDAO.create({
      delegate: foam.dao.MDAO.create({
        of: boxmail.Message
      })
    })
  }));
