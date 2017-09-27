/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.parse;

/**
 * This PStream is used to test against a single character to check if the parser accepts it or not
 */
public class TrapPStream
    implements PStream
{
  protected ErrorReportingPStream root;
  protected Character head;

  public TrapPStream(ErrorReportingPStream root) {
    this(root, null);
  }

  public TrapPStream(ErrorReportingPStream root, Character head) {
    this.root = root;
    this.head = head;
  }

  @Override
  public char head() {
    return this.head;
  }

  public void setHead(char head) {
    this.head = head;
  }

  @Override
  public boolean valid() {
    return true;
  }

  @Override
  public PStream tail() {
    root.reportValidCharacter(head);
    return InvalidPStream.instance();
  }

  @Override
  public Object value() {
    return null;
  }

  @Override
  public PStream setValue(Object value) {
    return this;
  }

  @Override
  public String substring(PStream end) {
    return null;
  }

  @Override
  public PStream apply(Parser parser, ParserContext x) {
    return parser.parse(this, x);
  }
}