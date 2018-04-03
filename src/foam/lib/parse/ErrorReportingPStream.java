/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

import org.apache.commons.lang3.StringUtils;

import java.util.HashSet;
import java.util.Set;

public class ErrorReportingPStream
    extends ProxyPStream
{

  protected Parser errParser = null;
  protected ParserContext errContext = null;
  protected ErrorReportingNodePStream errStream = null;

  protected ErrorReportingNodePStream tail_ = null;
  protected Set<String> validCharacters = new HashSet<>();

  public ErrorReportingPStream(PStream delegate) {
    setDelegate(delegate);
  }

  @Override
  public PStream tail() {
    // tail becomes new node with increased position
    if ( tail_ == null ) tail_ = new ErrorReportingNodePStream(this, super.tail(), 1);
    return tail_;
  }

  @Override
  public PStream setValue(Object value) {
    // create a new node
    return new ErrorReportingNodePStream(this, super.setValue(value), 0);
  }

  @Override
  public PStream apply(Parser parser, ParserContext x) {
    PStream result = parser.parse(this, x);
    if ( result == null ) {
      // if result is null then self report
      this.report(new ErrorReportingNodePStream(this, getDelegate(), 0), parser, x);
    }
    return result;
  }

  public void report(ErrorReportingNodePStream ernps, Parser parser, ParserContext x) {
    // get the report with the furthest position
    if ( errStream == null || errStream.pos_ <= ernps.pos_ ) {
      errStream = ernps;
      errParser = parser;
      errContext = x;
    }
  }

  public void reportValidCharacter(Character ch) {
    validCharacters.add("'" + getPrintableCharacter(ch) + "'");
  }

  public String getMessage() {
    // check if err is valid and print the char, if not print EOF
    String invalid = ( errStream.valid() ) ? String.valueOf(errStream.head()) : "EOF";

    // get a list of valid characters
    TrapPStream trap = new TrapPStream(this);
    for ( int i = 0; i <= 255; i++ ) {
      trap.setHead((char) i);
      trap.apply(errParser, errContext);
    }

    return "Invalid character '" + invalid +
        "' found at " + errStream.pos_ + "\n" +
        "Valid characters include: " +
        StringUtils.join(validCharacters, ",");
  }

  public String getPrintableCharacter(Character ch) {
    switch ( (int) ch ) {
      case 0x09:
        return "\\t";
      case 0x0A:
        return "\\n";
      case 0x0D:
        return "\\r";
      default:
        return ch.toString();
    }
  }
}