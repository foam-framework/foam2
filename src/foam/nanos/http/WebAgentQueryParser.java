/**
 * @license
 * Copyright 2018 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.http;

import foam.core.ClassInfo;
import foam.core.ProxyX;
import foam.core.EmptyX;
import foam.core.X;
import foam.lib.parse.ErrorReportingPStream;
import foam.lib.parse.PStream;
import foam.lib.parse.Parser;
import foam.lib.parse.ParserContext;
import foam.lib.parse.ParserContextImpl;
import foam.lib.parse.StringPStream;
import foam.parse.QueryParser;
import foam.mlang.predicate.Predicate;
import foam.mlang.predicate.Nary;
import foam.mlang.MLang;
import foam.nanos.logger.Logger;
import foam.nanos.logger.PrefixLogger;
import foam.util.SafetyUtil;

//
// Wrap the common WebAgent use case of QueryParser
// to extract and compile the 'q' (mql) URL query.
//
public class WebAgentQueryParser {
  protected QueryParser parser_;

  public WebAgentQueryParser(ClassInfo classInfo) {
    parser_ = new QueryParser(classInfo);
  }

  public Predicate parse(X x, String q)
    throws IllegalArgumentException {

    if ( ! SafetyUtil.isEmpty(q) ) {
      Logger logger = (Logger) x.get("logger");
      logger.debug(this.getClass().getSimpleName(), "q", q);
      StringPStream sps = new StringPStream();
      sps.setString(q);
      PStream ps = sps;
      ParserContext px = new ParserContextImpl();
      ps = parser_.parse(ps, px);
      if ( ps == null ) {
        String message = getParsingError(x, q);
        logger.error(this.getClass().getSimpleName(), "failed to parse q", message);
        throw new IllegalArgumentException("failed to parse [" + q + "]: "+message);
      }
      parser_.setX(EmptyX.instance());
      Predicate pred = (Predicate) ps.value();
      logger.debug(this.getClass().getSimpleName(), "pred", pred.getClass(), pred.toString());
      return pred;
    }
    return MLang.TRUE;
  }

  /**
   * Gets the result of a failing parsing of a buffer
   * @param buffer the buffer that failed to be parsed
   * @return the error message
   */
  protected String getParsingError(X x, String buffer) {
    Parser        parser = new foam.lib.json.ExprParser();
    PStream       ps     = new StringPStream();
    ParserContext psx    = new ParserContextImpl();

    ((StringPStream) ps).setString(buffer);
    psx.set("X", x == null ? new ProxyX() : x);

    ErrorReportingPStream eps = new ErrorReportingPStream(ps);
    ps = eps.apply(parser, psx);
    return eps.getMessage();
  }
}
