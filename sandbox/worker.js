FOAM_BOOT_PATH="/src/core/";

importScripts('/src/foam.js');
importScripts('testlib.js');


var registry = foam.box.RegistryBox.create();
var server = foam.messaging.MessageChannelServer.create({
  source: this,
  delegate: registry
}, registry);

server.start();

// Create TestObject skeleton
var skeleton = foam.box.SkeletonBox.create({
  data: demos.TestObject.create()
});

// Export skeleton under the name "testObject"
registry.register('testObject', skeleton);

var dao = foam.dao.ArrayDAO.create({
  of: demos.Person
});

dao.put(demos.Person.create({ name: 'adam', age: 27, phone: '555-123-4117' }));
dao.put(demos.Person.create({ name: 'kevin', age: 28, phone: '555-555-5555' }));
dao.put(demos.Person.create({ name: 'jackson', age: 29, phone: '123-456-7890' }));
dao.put(demos.Person.create({ name: 'mark', age: 30, phone: ' 1 (800) MARK ' }));
dao.put(demos.Person.create({ name: 'braden', age: 31, phone: '555-BRADEN-1' }));

registry.register('personDao', foam.box.SkeletonBox.create({
  data: dao
}));
