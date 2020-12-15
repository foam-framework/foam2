/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.ruler.test',
  name: 'RuledDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.GUIDDAO',
    'foam.dao.MDAO',
    'foam.nanos.ruler.RuledDAO',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        RuledDAOTest_find_ruled_obj_without_predicate(x);
        RuledDAOTest_find_ruled_obj_with_truthy_predicate(x);
        RuledDAOTest_find_ruled_obj_with_falsely_predicate(x);
      `
    },
    {
      name: 'setUpDAO',
      type: 'DAO',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Class', name: 'of' }
      ],
      javaCode: `
        return new RuledDAO.Builder(x).setDelegate(
          new GUIDDAO.Builder(x).setDelegate(new MDAO(of)).build()
        ).build();
      `
    },
    {
      name: 'RuledDAOTest_find_ruled_obj_without_predicate',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        var dao = setUpDAO(x, RuledDummy.getOwnClassInfo());
        var obj = dao.put(new RuledDummy());
        test(obj != null && dao.find(obj).equals(obj), "Find ruled obj without predicate");
      `
    },
    {
      name: 'RuledDAOTest_find_ruled_obj_with_truthy_predicate',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        var dao = setUpDAO(x, RuledDummy.getOwnClassInfo());
        var obj = dao.put(new RuledDummy.Builder(x).setPredicate(TRUE).build());
        test(obj != null && dao.find(obj).equals(obj), "Find ruled obj with truthy predicate");
      `
    },
    {
      name: 'RuledDAOTest_find_ruled_obj_with_falsely_predicate',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        var dao = setUpDAO(x, RuledDummy.getOwnClassInfo());
        var obj = dao.put(new RuledDummy.Builder(x).setPredicate(FALSE).build());
        test(obj != null && dao.find(obj) == null, "Find ruled obj with falsely predicate");
      `
    }
  ]
});
