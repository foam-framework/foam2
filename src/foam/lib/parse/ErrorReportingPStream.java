/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class ErrorReportingPStream
    extends ProxyPStream
{
  public static final List<Character> ASCII_CHARS = IntStream.rangeClosed(0, 255)
      .mapToObj(i -> (char) i)
      .collect(Collectors.toList());

  protected ThreadLocal<StringBuilder> sb = new ThreadLocal<StringBuilder>() {
    @Override
    protected StringBuilder initialValue() {
      return new StringBuilder();
    }

    @Override
    public StringBuilder get() {
      StringBuilder b = super.get();
      b.setLength(0);
      return b;
    }
  };

  protected Parser errParser = null;
  protected ParserContext errContext = null;
  protected ErrorReportingNodePStream errStream = null;

  protected int pos;
  protected ErrorReportingNodePStream tail_ = null;
  protected Set<Character> validCharacters = new HashSet<>();

  public ErrorReportingPStream(PStream delegate) {
    this(delegate, 0);
  }

  public ErrorReportingPStream(PStream delegate, int pos) {
    setDelegate(delegate);
    this.pos = pos;
  }

  @Override
  public PStream tail() {
    // tail becomes new node with increased position
    if ( tail_ == null ) tail_ = new ErrorReportingNodePStream(this, super.tail(), pos + 1);
    return tail_;
  }

  @Override
  public PStream setValue(Object value) {
    // create a new node
    return new ErrorReportingNodePStream(this, super.setValue(value), pos);
  }

  @Override
  public PStream apply(Parser parser, ParserContext x) {
    PStream result = parser.parse(this, x);
    if ( result == null ) {
      // if result is null then self report
      this.report(new ErrorReportingNodePStream(this, getDelegate(), pos), parser, x);
    }
    return result;
  }

  public void report(ErrorReportingNodePStream ernps, Parser parser, ParserContext x) {
    // get the report with the furthest position
    if ( errStream == null || errStream.pos <= ernps.pos ) {
      errStream = ernps;
      errParser = parser;
      errContext = x;
    }
  }

  public void reportValidCharacter(Character character) {
    validCharacters.add(character);
  }

  public String getMessage() {
    // check if err is valid and print the char, if not print EOF
    String invalid = ( errStream.valid() ) ? String.valueOf(errStream.head()) : "EOF";

    // get a list of valid characters
    TrapPStream trap = new TrapPStream(this);
    Iterator i = ASCII_CHARS.iterator();
    while ( i.hasNext() ) {
      Character character = (Character) i.next();
      trap.setHead(character);
      trap.apply(errParser, errContext);
    }

    StringBuilder builder = sb.get()
        .append("Invalid character '")
        .append(invalid)
        .append("' found at ")
        .append(errStream.pos)
        .append("\n")
        .append("Valid characters include: ")
        .append(validCharacters.stream()
            .map(e -> "'" + e.toString() + "'")
            .collect(Collectors.joining(",")));

    return builder.toString();
  }
}