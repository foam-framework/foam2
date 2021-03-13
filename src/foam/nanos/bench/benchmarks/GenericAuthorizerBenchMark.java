/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench.benchmarks;

import foam.core.X;
import foam.test.*;
import foam.dao.ArraySink;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.nanos.auth.AuthorizationDAO;
import foam.nanos.auth.Authorizer;
import foam.nanos.auth.User;
import foam.nanos.bench.Benchmark;
import java.util.List;

import static foam.mlang.MLang.*;

/**
  Generic benchmark authorizer.
  {@authenticate runs benchmark with authorizer}
 */

public class ConfigurableAuthorizerBenchmark
  implements Benchmark
{
  protected X userAuthorizedContext;
  protected DAO dao = new MDAO(User.getOwnClassInfo());
  protected Authorizer authorizer;
  protected int recordAmount;

  public ConfigurableAuthorizerBenchmark(Authorizer authorizer_, int recordAmount_) {
    authorizer = authorizer_;
    recordAmount = recordAmount_;
  }

  @Override
  public void setup(X x) {
    userAuthorizedContext = TestUtils.createTestContext(x, "foam");
    if ( authorizer != null ) {
      dao = new AuthorizationDAO.Builder(userAuthorizedContext)
              .setDelegate(dao)
              .setAuthorizer(authorizer)
              .build();
    }

    for (int i = 0; i < recordAmount; i++) {
      User user = TestUtils.createTestUser();
      user.setEmail(i + user.getEmail());
      dao.put(user);
    }
  }

  @Override
  public void teardown(X x, java.util.Map stats) {}

  @Override
  public void execute(X x) {
    dao.inX(userAuthorizedContext).select(new ArraySink());
  }
}