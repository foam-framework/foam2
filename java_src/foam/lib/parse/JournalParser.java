package foam.lib.json;

import foam.core.ContextAwareSupport;
import foam.core.FObject;
import foam.core.ProxyX;
import foam.core.X;

/**
 * Class responsible for parsing journal files.
 * journal files follows this structure.
 * put(foam.json.parse({"class":"foam.nanos.boot.NSpec","name":"Gibs1" }))
 * remove(foam.json.parse({"class":"foam.nanos.boot.NSpec","name":"Gibs" }))
 */
public class JournalParser extends ContextAwareSupport {

    protected JSONParser jsonParser;

    public JournalParser() {
        // do not fail if context is null
        X ctx = (getX() == null) ? new ProxyX() : getX();
        this.jsonParser = new JSONParser();
        jsonParser.setX(ctx);
    }


    // TODO(drish): do not generate a second copy of the journalLine
    public FObject parseObject(String journalLine) {

        // get the actual object
        int objectIndex = journalLine.indexOf("{");
        String object = journalLine.substring(objectIndex, journalLine.lastIndexOf("}") + 1);

        return this.jsonParser.parseString(object);
    }

    /**
     * Extract the operation (put/remove) from the journal file line.
     *
     * @param journalLine
     * @return operation
     */
    public String parseOperation(String journalLine) {
        // get put/remove index.
        int operationIndex = journalLine.indexOf("(");
        String operation = journalLine.substring(0, operationIndex);
        return operation;
    }
}