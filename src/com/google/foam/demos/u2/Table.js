foam.CLASS({
  refines: 'foam.core.Action',

  methods: [
    function tableCellView(obj, e) {
//       return foam.u2.ActionView.create({action: this, data: obj});

      return this.toE(null, e.__subContext__.createSubContext({data: obj}));
    }
  ]
});


foam.CLASS({
  name: 'Person',

  tableColumns: [ 'id', 'firstName', 'lastName', 'hello' ],

  properties: [
    { class: 'Int',    name: 'id', hidden: true },
    { class: 'String', name: 'firstName' },
    { class: 'String', name: 'lastName' },
    { class: 'Int',    name: 'age' }
  ],

  actions: [
    function hello() {
      console.log('Hello', this.firstName + ' ' + this.lastName);
    }
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

var t = foam.u2.TableView.create({
  of: Person,
  data: dao
}).write();
