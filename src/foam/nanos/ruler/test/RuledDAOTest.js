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
    'foam.nanos.ruler.FindRuledCommand',
    'foam.nanos.ruler.RuledDAO',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'runTest',
      javaCode: `
        RuledDAOTest_find_ruled_obj_by_rule_group(x);
        RuledDAOTest_find_ruled_obj_order_by_priority(x);
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
      name: 'RuledDAOTest_find_ruled_obj_by_rule_group',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        var dao = setUpDAO(x, RuledDummy.getOwnClassInfo());
        var obj = dao.put(new RuledDummy.Builder(x).setRuleGroup("test").build());

        var found = dao.cmd(new FindRuledCommand("test"));
        var notFound = dao.cmd(new FindRuledCommand("non_existence"));
        test(found != null && obj.equals(found) && notFound == null
          , "Find ruled obj by rule group");
      `
    },
    {
      name: 'RuledDAOTest_find_ruled_obj_order_by_priority',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        var dao = setUpDAO(x, RuledDummy.getOwnClassInfo());
        var obj1 = dao.put(new RuledDummy.Builder(x).setRuleGroup("test").setPriority(10).build());
        var obj2 = dao.put(new RuledDummy.Builder(x).setRuleGroup("test").setPriority(100).build());

        var found = dao.cmd(new FindRuledCommand("test"));
        test(found != null && obj2.equals(found)
          , "Find ruled obj order by priority");
      `
    },
    {
      name: 'RuledDAOTest_find_ruled_obj_with_truthy_predicate',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        var dao = setUpDAO(x, RuledDummy.getOwnClassInfo());
        var obj = dao.put(new RuledDummy.Builder(x).setRuleGroup("test").setPredicate(TRUE).build());

        var found = dao.cmd(new FindRuledCommand("test"));
        test(found != null && obj.equals(found)
          , "Find ruled obj with truthy predicate");
      `
    },
    {
      name: 'RuledDAOTest_find_ruled_obj_with_falsely_predicate',
      args: [
        { type: 'Context', name: 'x' }
      ],
      javaCode: `
        var dao = setUpDAO(x, RuledDummy.getOwnClassInfo());
        var obj = dao.put(new RuledDummy.Builder(x).setRuleGroup("test").setPredicate(FALSE).build());

        var notFound = dao.cmd(new FindRuledCommand("test"));
        test(notFound == null, "Find ruled obj with falsely predicate");
      `
    }
  ]
});
