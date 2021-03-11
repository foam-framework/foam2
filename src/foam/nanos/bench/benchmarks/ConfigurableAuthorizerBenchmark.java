/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.bench.benchmarks;

import foam.core.X;
import foam.dao.DAO;
import foam.dao.MDAO;
import foam.dao.NullDAO;
import foam.nanos.auth.ExtendedConfigurableAuthorizer;
import foam.nanos.auth.AuthorizationDAO;
import foam.nanos.auth.PermissionTemplateReference;
import foam.nanos.auth.PermissionTemplateProperty;
import foam.nanos.bench.Benchmark;
import foam.nanos.auth.User;
import foam.dao.ArraySink;
import java.util.List;

public class ConfigurableAuthorizerBenchmark
  implements Benchmark
{
  protected DAO         dao_;

  @Override
  public void setup(X x) {
    ExtendedConfigurableAuthorizer authorizer = new ExtendedConfigurableAuthorizer.Builder(x)
      .setDAOKey("authorizedUserDAO")
      .build();
    dao_ = new AuthorizationDAO.Builder(x)
            .setDelegate(new MDAO(User.getOwnClassInfo()))
            .setAuthorizer(authorizer)
            .build();

    DAO templateDAO = (DAO) x.get("permissionTemplateReferenceDAO");
    PermissionTemplateReference template = new PermissionTemplateReference();
    template.setOperation(foam.nanos.ruler.Operations.READ);
    template.setDaoKeys(new String[]{ "authorizedUserDAO" });
    PermissionTemplateProperty[] properties = new PermissionTemplateProperty[]{
      new PermissionTemplateProperty.Builder(x).setPropertyReference("firstName").build()
    };
    template.setProperties(properties);
    templateDAO.put(template);
    
    User user = (User) new User();
    user.setId(1);
    user.setFirstName("Dr.");
    user.setLastName("Disrespect");
    dao_.put(user);
  }

  @Override
  public void teardown(X x, java.util.Map stats) {
  }

  @Override
  public void execute(X x) {
    List users = ((ArraySink) dao_.select(new ArraySink())).getArray();
    System.out.println(users);
  }
}
