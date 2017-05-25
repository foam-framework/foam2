package foam.lib.json;

import foam.core.FObject;

/**
 * Class responsible for parsing journal files.
 * journal files follows this structure.
 * put(foam.json.parse({"class":"foam.nanos.boot.NSpec","name":"Gibs1" }))
 * remove(foam.json.parse({"class":"foam.nanos.boot.NSpec","name":"Gibs" }))
 */
public class JournalParser {

    public FObject parseObject(String journalLine) {

        // get the actual object
        int objectIndex = journalLine.indexOf("{");
        String object = journalLine.substring(objectIndex, journalLine.lastIndexOf("}") + 1);

        JSONParser jsonParser = new JSONParser();
        FObject obj = jsonParser.parseString(object);
        return obj;
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
