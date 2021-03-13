/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench.benchmarks;

import foam.core.X;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.nanos.auth.AuthorizationDAO;
import foam.nanos.auth.Authorizer;
import foam.nanos.auth.ExtendedConfigurableAuthorizer;
import foam.nanos.auth.Group;
import foam.nanos.auth.GroupPermissionJunction;
import foam.nanos.auth.PermissionTemplateProperty;
import foam.nanos.auth.PermissionTemplateReference;
import foam.nanos.auth.StandardAuthorizer;
import foam.nanos.auth.User;
import foam.nanos.bench.Benchmark;
import foam.nanos.session.Session;
import java.util.List;

import static foam.mlang.MLang.*;

/**
  Benchmark comparisons between unauthenticated, StandardAuthorized, and ConfigurableAuthorized ServiceDAOs
  {@authenticate runs benchmark with authorizer}
  {@standardAuth runs benchmark with StandardAuthorizer, when false applied ConfigurableAuthorizer}
  {@templateAmount defines how many templates used in the configurable authorizer}
 */

public class ConfigurableAuthorizerBenchmark
  implements Benchmark
{
  protected DAO dao = new MDAO(User.getOwnClassInfo());
  protected DAO templateDAO;
  protected long userId;
  protected Group group;
  protected boolean authenticate_;
  protected boolean standardAuth_;
  protected int templateAmount_;
  protected X authX;

  public ConfigurableAuthorizerBenchmark(boolean authenticate, boolean standardAuth, int templateAmount) {
    authenticate_ = authenticate;
    standardAuth_ = standardAuth;
    templateAmount_ = templateAmount;
  }

  @Override
  public void setup(X x) {
    if ( authenticate_ ) {
      Authorizer authorizer = standardAuth_ ?
          new StandardAuthorizer("authorizeduserdao") :
          new ExtendedConfigurableAuthorizer.Builder(x)
            .setDAOKey("authorizedUserDAO")
            .build();

      dao = new AuthorizationDAO.Builder(x)
              .setDelegate(dao)
              .setAuthorizer(authorizer)
              .build();
    }

    DAO userDAO = (DAO) x.get("bareUserDAO");
    templateDAO = (DAO) x.get("permissionTemplateReferenceDAO");

    if ( ! standardAuth_ ) {
      for ( int i = 0; i < templateAmount_; i++) {
        PermissionTemplateReference template = new PermissionTemplateReference();
        template.setOperation(foam.nanos.ruler.Operations.READ);
        template.setDaoKeys(new String[]{ "authorizedUserDAO" });
        PermissionTemplateProperty[] properties = new PermissionTemplateProperty[]{
          new PermissionTemplateProperty.Builder(x).setPropertyReference("jobTitle").build()
        };
        template.setProperties(properties);
        templateDAO.put(template);
      }
    }

    group = new Group.Builder(x)
      .setId("test")
      .build();
    DAO groupDAO = (DAO) x.get("groupDAO");
    group = (Group) groupDAO.put(group);

    DAO groupPermissionJunctionDAO = (DAO) x.get("localGroupPermissionJunctionDAO");
    groupPermissionJunctionDAO.put(new GroupPermissionJunction.Builder(x).setSourceId("test").setTargetId("permissiontemplatereference.read.*").build());

    User authUser = null;
    for (int i = 1; i < 100000; i++) {
      User user = (User) new User();
      user.setId(i);
      user.setUserName("Dr.Disrespect" + i);
      user.setJobTitle(i > 5000 ? "thetwotime" : "blockbusterchampion");
      user.setGroup("test");
      user.setSpid("foam");
      user.setLifecycleState(foam.nanos.auth.LifecycleState.ACTIVE);
      authUser = (User) dao.put(user);
    }
    authUser = (User) userDAO.put(authUser.fclone());
    userId = authUser.getId();
  }

  @Override
  public void teardown(X x, java.util.Map stats) {
    DAO userDAO = (DAO) x.get("bareUserDAO");
    DAO groupDAO = (DAO) x.get("groupDAO");
    DAO groupPermissionJunctionDAO = (DAO) x.get("localGroupPermissionJunctionDAO");
    groupPermissionJunctionDAO.where(EQ(GroupPermissionJunction.SOURCE_ID, "test")).removeAll();
    templateDAO.where(IN("authorizedUserDAO", PermissionTemplateReference.DAO_KEYS)).removeAll();
    User user = (User) userDAO.find(userId);
    Group group = (Group) groupDAO.find("test");
    userDAO.remove(user);
    groupDAO.remove(group);
  }

  @Override
  public void execute(X x) {
    Session benchmarkUserSession = new Session.Builder(x).setUserId(userId).build();
    authX = benchmarkUserSession.applyTo(x);
    authX = authX.put(Session.class, benchmarkUserSession);
    authX.put("group", group);
    benchmarkUserSession.setContext(authX);

    List users = ((ArraySink) dao.inX(authX).select(new ArraySink())).getArray();
  }
}

/**
    Initial Results:

    Unauthenticated User MDAO select operation on 100000 entries of users:
    Threads,  Memory GB,  Operations/s/t,  Pass,  Operations/s,  Total,  Run,  Fail
          1,       0.13,           62.50,     1,         62.50,      1,    1,     0
          3,       0.36,           71.43,     3,        214.29,      3,    1,     0

    Authenticated using StandardAuthorizer User MDAO select operation on 100000 entries of users:
    Threads,  Memory GB,  Operations/s/t,  Pass,  Operations/s,  Total,  Run,  Fail
          1,       0.25,            0.05,     1,          0.05,      1,    1,     0
          3,       0.18,            0.03,     3,          0.10,      3,    1,     0

    Authenticated using ExtendedConfigurableAuthorizer User MDAO select operation on 100000 entries of users and 5 permission templates(likely):
    Threads,  Memory GB,  Operations/s/t,  Pass,  Operations/s,  Total,  Run,  Fail
          1,       0.27,            0.06,     1,          0.06,      1,    1,     0
          3,       0.48,            0.04,     3,          0.13,      3,    1,     0

    Authenticated using ExtendedConfigurableAuthorizer User MDAO select operation on 100000 entries of users and 100 permission templates(unlikely):
    Threads,  Memory GB,  Operations/s/t,  Pass,  Operations/s,  Total,  Run,  Fail
          1,       0.23,            0.03,     1,          0.03,      1,    1,     0
          3,       0.66,            0.02,     3,          0.07,      3,    1,     0

 */