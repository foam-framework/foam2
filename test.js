process.on('unhandledRejection', function(e) {
  console.error("ERROR: Unhandled promise rejection ", e);
  process.exit(1);
});

global.FOAM_FLAGS = {
  node: true,
  web: false,
  js: true,
  java: true,
  swift: false,
  debug: true
};

require('./foam-bin.js');
require('./modeldao.js');

console.log("Requesting foo");
foam.__context__.classloader.load('test.Foo').then(function(c) {
  console.log("Trying to create one");
  c.create().refined_method();
});

//foam.__context__.classloader.load('foam.nanos.auth.User').then(function(c) {
//  console.log(c.create().stringify());
//});

Promise.all(
  [foam.__context__.classloader.load('foam.nanos.demo.relationship.Professor'),
   foam.__context__.classloader.load('foam.nanos.demo.relationship.Course'),
   foam.__context__.classloader.load('foam.nanos.demo.relationship.Student')]).then(function(c) {
     var x = foam.__context__.createSubContext({
       courseDAO: foam.dao.EasyDAO.create({ daoType: 'MDAO', of: foam.nanos.demo.relationship.Course }),
       studentDAO: foam.dao.EasyDAO.create({ daoType: 'MDAO', of: foam.nanos.demo.relationship.Student }),
       professorDAO: foam.dao.EasyDAO.create({ daoType: 'MDAO', of: foam.nanos.demo.relationship.Professor }),
       studentCourseJunctionDAO: foam.dao.EasyDAO.create({ daoType: 'MDAO', of: foam.nanos.demo.relationship.StudentCourseJunction })
     });

     var cs101 = foam.nanos.demo.relationship.Course.create({
       code: 'cs101'
     }, x);

     var adam =  foam.nanos.demo.relationship.Student.create({
       studentId: 123,
       name: 'adam'
     }, x);

     x.courseDAO.put(cs101);
     x.studentDAO.put(adam);

     x.courseDAO.find('cs101').then(function(c) {
       c.students.add(adam).then(function() {
         console.log("Students in cs101");
         c.students.dao.select(console);
       });
     });
   });
