package foam.dao;

import com.sun.istack.internal.NotNull;
import foam.core.FObject;
import foam.core.PropertyInfo;

import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.StringJoiner;

/**
 * prepares sql info based on a FObject
 */
public class SQLData {

    protected String table;
    protected ArrayList<String> columnNames;

    // table column, value
    protected Map<String, Object> values;

    public SQLData(FObject obj) throws IllegalStateException, IllegalAccessException {

        Field[] fields = obj.getClass().getFields();
        table = getTableName(obj.getClassInfo().getId());
        columnNames = new ArrayList<String>();

        // TODO(drish): throw in case where class has no fields ?
        if (fields.length <= 0) {
            return;
        }
        values = new HashMap<String, Object>();

        for (Field f: fields) {
            String fieldName = f.getName();
            columnNames.add(fieldName.toLowerCase());
            Object value = ((PropertyInfo) f.get(obj)).get(obj);
            values.put(fieldName, value);
        }
    }

    /**
     * get formated column names
     * @return String
     */
    public String getFormatedColumnNames() {
        StringJoiner joiner = new StringJoiner(",");
        String output = "( ";
        for (String columnName: columnNames) {
            joiner.add(columnName);
        }
        output += joiner.toString();
        output += " )";
        return output;
    }

    /**
     * get formated placeholders for prepared statements
     * in the following format:
     *
     * (?, ?, ?)
     *
     * @return String
     */
    public String getFormatedPlaceholders() {
        String output = "( ";
        StringJoiner joiner = new StringJoiner(",");
        for (int i = 0; i < columnNames.size(); i++) {
            joiner.add("?");
        }
        output += joiner.toString();
        output += " )";
        return output;
    }

    public Map getValues() {
        return values;
    }

    public String getTableName() {
        return table;
    }

    @NotNull
    private String getTableName(String classId) {
        // TODO(drish): pluralize table name ?
        return classId.substring(classId.lastIndexOf(".") + 1, classId.length()).toLowerCase();
    }
}
