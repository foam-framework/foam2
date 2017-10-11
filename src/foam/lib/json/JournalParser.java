/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.lib.json;

import foam.core.*;

/**
 * Class responsible for parsing journal files.
 * journal files follows this structure.
 *
 * p({"class":"foam.dao.Guitar","name":"Gibs1" }))
 * r({"id": "1"}))
 */
public class JournalParser
  extends ContextAwareSupport {

  protected JSONParser jsonParser;

  public JournalParser() {
    // do not fail if context is null
    X ctx = (getX() == null) ? new ProxyX() : getX();
    this.jsonParser = new JSONParser();
    jsonParser.setX(ctx);
  }


  // TODO(drish): do not generate a second copy of the journalLine
  public FObject parseObject(String line) {
    return this.jsonParser.parseString(line);
  }

  public Object parseObjectId(String journalLine) {

    String id;
    int idIndex = journalLine.lastIndexOf(":");

    if ( String.valueOf(journalLine.charAt(idIndex + 1)).equals("\"") ) {
      id = journalLine.substring(idIndex + 2, journalLine.lastIndexOf("}") - 1);
    } else {
      id = journalLine.substring(idIndex + 1, journalLine.lastIndexOf("}"));
    }

    return id;
  }
}
