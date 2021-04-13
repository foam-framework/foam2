/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench.benchmarks;

import foam.core.X;
import foam.dao.DAO;
import foam.nanos.auth.AuthorizationDAO;
import foam.nanos.auth.Authorizer;
import foam.nanos.auth.ExtendedConfigurableAuthorizer;
import foam.nanos.auth.PermissionTemplateProperty;
import foam.nanos.auth.PermissionTemplateReference;
import foam.nanos.dao.Operation;

/**
  Benchmark of ConfigurableAuthorizer
  {@authorizer} wraps target DAO with the ExtendedConfigurableAuthorizer
  {@recordAmount} defines amount of records to be created for benchmark (creates users in new MDAO & permission templates defined)
  {@op} a (CRUD) operation to run benchmark on.
 */

public class ConfigurableAuthorizerBenchmark
  extends AuthorizerBenchmark
{
  public static final String CONFIGURATION_DAO_KEY = "userDAO";
  public static boolean cache;

  public ConfigurableAuthorizerBenchmark(X benchmarkContext_, Authorizer authorizer_, int recordAmount_, Operation operation_, boolean cached) {
    super(benchmarkContext_, authorizer_, recordAmount_, operation_);
    cache = cached;
  }

  @Override
  public void setup(X x) {
    super.setup(x);

    authorizer = new ExtendedConfigurableAuthorizer.Builder(userAuthorizedContext)
      .setDAOKey(CONFIGURATION_DAO_KEY)
      .setCache(cache)
      .build();
    dao = new AuthorizationDAO.Builder(userAuthorizedContext)
      .setDelegate(dao)
      .setAuthorizer(authorizer)
      .build();

    DAO userDAO = (DAO) userAuthorizedContext.get("localUserDAO");
    DAO templateDAO = (DAO) userAuthorizedContext.get("localPermissionTemplateReferenceDAO");

    for ( int i = 0; i < recordAmount; i++) {
      PermissionTemplateReference template = new PermissionTemplateReference();
      template.setOperation(operation);
      template.setDaoKeys(new String[]{ CONFIGURATION_DAO_KEY });
      PermissionTemplateProperty[] properties = new PermissionTemplateProperty[]{
        new PermissionTemplateProperty.Builder(x).setPropertyReference("id").build()
      };
      template.setProperties(properties);
      templateDAO.put(template);
    }
  }
}