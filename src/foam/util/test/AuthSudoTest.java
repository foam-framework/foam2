package foam.util.test.AuthSudoTest;

import foam.util.Auth;
import foam.nanos.auth.User;
import foam.nanos.app.AppConfig;
import foam.nanos.app.Mode;
import foam.core.X;
import foam.dao.DAO;
import static foam.mlang.MLang.*;

public class AuthSudoTest
  extends foam.nanos.test.Test {

  public void runTest(X x) {
    User user = setupUser(x);
    AppConfig appConfig = (AppConfig) x.get("appConfig");

    appConfig.setMode(Mode.TEST);
    X y = x.put("appConfig", appConfig);

    try {
      Auth.sudo(y, user);
      test(true, "sudo allowed.");
    } catch (IllegalStateException e) {
      test(false, "Through IllegalStateException in mode TEST");
    }

    appConfig.setMode(Mode.PRODUCTION);
    y = x.put("appConfig", appConfig);

    try {
      Auth.sudo(y, user);
      test(false, "IllegalStateException not thrown in mode PRODUCTION");
    } catch (IllegalStateException e) {
      test(true, "sudo denied.");
    }
  }

  public User setupUser(X x) {
    User user = (User) ((DAO)x.get("localUserDAO")).find(EQ(User.EMAIL,"authsudotest@nanopay.net" ));
    if ( user == null ) {
      user = new User();
      user.setEmail("authsudotest@nanopay.net");
    }
    user = (User) user.fclone();
    user.setEmailVerified(true);
    user = (User) (((DAO) x.get("localUserDAO")).put_(x, user));
    return user;
  }
}
