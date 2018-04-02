/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

import java.security.AccessControlException;

import foam.lib.parse.LiteralIC;
import foam.lib.parse.Not;
import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.Seq;
import foam.nanos.auth.User;

public class MeParser extends foam.lib.parse.ProxyParser {

  public MeParser() {
    setDelegate(
        new Seq(new LiteralIC("me"),
                new Not(new charParser())));
  }
  
  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse(ps, x);
    if ( ps == null || ps.value() == null ) return null;

    if ( ( (Object[]) ps.value() )[0].equals("me") ) {
      User user = (User) x.get("user");
      try {
        if ( user == null ) throw new AccessControlException("User is not logged in");
      } catch ( Exception e ) {
        System.out.println("User is not logged in");
        return ps.setValue(null);
      }
      return ps.setValue(user.getId());
    }
    return null;
  }
}
