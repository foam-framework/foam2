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
import foam.nanos.auth.User;
import foam.nanos.bench.Benchmark;
import foam.nanos.dao.Operation;
import foam.test.TestUtils;

/**
  General benchmark authorizer
  {@authorizer} wraps target DAO using authorizer provided
  {@recordAmount} defines amount of records to be created for benchmark (creates users in new MDAO)
  {@op} a (CRUD) operation to run benchmark on.
  Each CRUD operation has its own method specified for benchmarking, meaning each benchmark will relate to a single operation.
  If further setup or additional logic on each CRUD operation is required, extending this class and referencing the setup and CRUD method should suffice.
 */

public class AuthorizerBenchmark
  implements Benchmark
{
  protected X benchmarkContext;
  protected X userAuthorizedContext;
  protected DAO dao = new MDAO(User.getOwnClassInfo());
  protected Authorizer authorizer;
  protected int recordAmount;
  protected Operation operation;

  public AuthorizerBenchmark(X benchmarkContext_, Authorizer authorizer_, int recordAmount_, Operation operation_) {
    benchmarkContext = benchmarkContext_;
    authorizer = authorizer_;
    recordAmount = recordAmount_;
    operation = operation_;
  }

  @Override
  public void setup(X x) {
    userAuthorizedContext = TestUtils.createTestContext(x, "foam");

    if ( operation != Operation.CREATE ) {
      for (int i = 1; i < recordAmount + 1; i++) {
        User user = TestUtils.createTestUser();
        user.setId(i);
        user.setEmail(i + user.getEmail());
        dao.put(user);
      }
    }

    if ( authorizer != null ) {
      dao = new AuthorizationDAO.Builder(userAuthorizedContext)
          .setDelegate(dao)
          .setAuthorizer(authorizer)
          .build();
    }
  }

  public void benchmarkOnRead() {
    dao.inX(userAuthorizedContext).select(new ArraySink());
  }

  public void benchmarkOnCreate() {
    for (int i = 1; i < recordAmount + 1; i++) {
      User user = TestUtils.createTestUser();
      user.setId(i);
      user.setEmail(i + user.getEmail());
      try {
        dao.inX(userAuthorizedContext).put(user);
      } catch (Exception e) {}
    }
  }

  public void benchmarkOnUpdate() {
    for (int i = 1; i < recordAmount + 1; i++) {
      User user = TestUtils.createTestUser();
      user.setId(i);
      user.setEmail(user.getEmail() + i);
      try {
        dao.inX(userAuthorizedContext).put(user);
      } catch (Exception e) {}
    }
  }

  public void benchmarkOnRemove() {
    for (int i = 1; i < recordAmount + 1; i++) {
      User user = TestUtils.createTestUser();
      user.setId(i);
      user.setEmail(i + user.getEmail());
      try {
        dao.inX(userAuthorizedContext).remove(user);
      } catch (Exception e) {}
    }
  }

  @Override
  public void execute(X x) {
    if ( operation == Operation.READ ) benchmarkOnRead();
    if ( operation == Operation.CREATE ) benchmarkOnCreate();
    if ( operation == Operation.UPDATE ) benchmarkOnUpdate();
    if ( operation == Operation.REMOVE ) benchmarkOnRemove();
  }

  @Override
  public void teardown(X x, java.util.Map stats) {
    dao.inX(benchmarkContext).removeAll();
  }
}