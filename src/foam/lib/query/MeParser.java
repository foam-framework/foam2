/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.query;

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
                new Not(new CharParser())));
  }

  @Override
  public PStream parse(PStream ps, ParserContext x) {
    ps = super.parse ( ps, x );
    if ( ps == null ) return null;

    if ( ( (Object[]) ps.value() )[0].equals("me") ) {
      User user = (User) x.get("user");
        if ( user == null ) {
          System.err.println("User is not logged in");
          return null;
        }
      return ps.setValue(user.getId());
    }
    return null;
  }
}
