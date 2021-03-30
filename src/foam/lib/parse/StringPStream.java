/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package foam.lib.parse;

public class StringPStream
  implements PStream
{
  protected Reference<CharSequence> str;
  protected int               pos;
  protected StringPStream     tail_ = null;

  public StringPStream() {
    this(new Reference<CharSequence>());
  }

  public StringPStream(CharSequence s) {
    this(new Reference<>(s));
  }

  public StringPStream(Reference<CharSequence> s) {
    this(s, 0);
  }

  public StringPStream(Reference<CharSequence> s, int p) {
    this(s, p, null);
  }

  public StringPStream(Reference<CharSequence> s, int p, Object value) {
    str    = s;
    pos    = p;
    value_ = value;
  }

  public void setString(CharSequence s) {
    str.set(s);
  }

  public char head() {
    return str.get().charAt(pos);
  }

  public boolean valid() {
    return pos < str.get().length();
  }

  public PStream tail() {
    if ( tail_ == null ) tail_ = new StringPStream(str, pos + 1);
    return tail_;
  }

  private Object value_ = null;
  public Object value() {
    return value_;
  }

  public PStream setValue(Object value) {
    return new StringPStream(str, pos, value);
  }

  public String substring(PStream end) {
    return str.get().subSequence(pos, end.pos()).toString();
  }

  public PStream apply(Parser ps, ParserContext x) {
    return ps.parse(this, x);
  }

  public int pos() {
    return pos;
  }
}
