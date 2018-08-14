/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.parse;

import foam.lib.parse.PStream;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ParserContextImpl;
import foam.lib.parse.StringPStream;
import foam.nanos.auth.User;

public class QueryParserUser {

  /**
   * Determines if the query is valid or not
   *
   * @param query the query to validate
   * @return true if it is a valid query, otherwise false
   */
  public static boolean isValid(String query, String statement) {
    QueryParser parser = new QueryParser(User.getOwnClassInfo());

    StringPStream sps = new StringPStream();
    sps.setString(query);
    PStream ps = sps;
    ParserContext x = new ParserContextImpl();
    ps = parser.parse(ps, x);
    if (ps == null)
      return false;

    foam.mlang.predicate.Nary result = (foam.mlang.predicate.Nary) ps.value();

    return statement.equalsIgnoreCase(result.createStatement()) ? true : false;
  }
}
