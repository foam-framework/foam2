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

package foam.core;

import java.util.Map;

public interface X
{
  public <T> T get(Class<T> key);
  public Object get(Object key);
  public Object get(X x, Object key);

  // getInt methods
  public int getInt(Object key);
  public int getInt(Object key, int defaultValue);
  public int getInt(X x, Object key, int defaultValue);

  // getBoolean methods
  public boolean getBoolean(Object key);
  public boolean getBoolean(Object key, boolean defaultValue);
  public boolean getBoolean(X x, Object key, boolean defaultValue);

  public X put(Object key, Object value);
  public X putFactory(Object key, XFactory factory);

  // Facet Manager
  public Object getInstanceOf(Object value, Class type);
  public <T> T create(Class<T> type);
  public <T> T create(Class<T> type, Map<String, Object> args);

  // cd methods
  X cd(String path);

  /**
   * Cd into a sub context.
   * @param x Starting context
   * @param path Dot-separated path to a sub context eg, "foo.bar".
   * @return A sub context if exists, otherwise returns null.
   */
  default X cd(X x, String path) {
    X subX = x;
    for ( var c : path.split("\\.") ) {
      var obj = subX.get(c);
      if ( ! ( obj instanceof X ) ) {
        return null;
      }
      subX = (X) obj;
    }
    return subX;
  }
}
