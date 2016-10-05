foam.CLASS({
  name: 'Person',

  tableColumns: [ 'id', 'firstName', 'lastName' ],

  properties: [
    { name: 'id', hidden: true },
    { name: 'firstName' },
    { name: 'lastName'  }
  ]
});

var dao = foam.dao.EasyDAO.create({
  of: Person,
  daoType: 'MDAO',
  seqNo: true,
  testData: [
    { firstName: 'John',  lastName: 'Davis' },
    { firstName: 'Steve', lastName: 'Howe' },
    { firstName: 'Andy',  lastName: 'Smith' },
    { firstName: 'Gary',  lastName: 'Russell' },
    { firstName: 'Janet', lastName: 'Jones' },
    { firstName: 'Linda', lastName: 'Fisher' },
    { firstName: 'Kim',   lastName: 'Erwin' }
  ]
});

console.log('****', dao);

var t = foam.u2.TableView.create({
  of: Person,
  data: dao
}).write();
