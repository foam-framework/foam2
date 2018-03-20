
foam.CLASS({
    name: 'Person',
  
    tableColumns: [ 'id', 'firstName', 'lastName', 'hello', 'remove' ],
  
    properties: [
      { class: 'Int',    name: 'id', hidden: true },
      { class: 'String', name: 'firstName' },
      { class: 'String', name: 'lastName' },
      { class: 'Int',    name: 'age' }
    ],
  
    actions: [
      {
        name: 'hello',
        code: function hello() {
          console.log('Hello', this.firstName + ' ' + this.lastName);
        }
      },
      {
        name: 'remove',
        code: function hello(X) {
          X.dao.remove(this);
        }
      }
    ]
  });
  
  
  foam.CLASS({
    name: 'Main',
  
    requires: [
      'foam.u2.TableView',
      'foam.dao.EasyDAO'
    ],
  
    exports: [ 'dao' ],
  
    properties: [
      {
        name: 'dao',
        factory: function() {
          return this.EasyDAO.create({
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
        }
      },
      {
        name: 'table',
        factory: function() {
          return this.TableView.create({
            of: Person,
            data: this.dao
          });
        }
      }
    ],
  
    methods: [
      function init() {
        var table = this.table;
        table.write();
        table.selection$.sub(function() { console.log('selection: ', arguments, table.selection); });
      }
    ]
  });
  
  var m = Main.create();
  