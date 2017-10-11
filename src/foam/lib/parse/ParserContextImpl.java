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

import java.util.HashMap;

public class ParserContextImpl implements ParserContext {
  private HashMap<String, Object> map_ = new HashMap<String, Object>();
  private ParserContext parent_ = null;

  public Object get(String key) {
    if ( map_.containsKey(key) )
      return map_.get(key);
    if ( parent_ != null )
      return parent_.get(key);
    return null;
  }

  public void set(String key, Object value)  {
    map_.put(key, value);
  }

  public ParserContext sub() {
    ParserContextImpl child = new ParserContextImpl();
    child.parent_ = this;
    return child;
  }
}
