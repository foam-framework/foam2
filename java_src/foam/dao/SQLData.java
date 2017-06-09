package foam.dao;

import com.sun.istack.internal.NotNull;
import foam.core.FObject;
import foam.core.PropertyInfo;

import java.lang.reflect.Field;
import java.util.*;

/**
 * prepares sql info based on a FObject
 */
public class SQLData {

    protected String table;
    protected ArrayList<String> columnNames;

    // table column, value
    protected Map<String, Object> values;

    public SQLData(FObject obj) throws IllegalStateException, IllegalAccessException {

        table = getTableName(obj.getClassInfo().getId());
        columnNames = new ArrayList<String>();
        List<PropertyInfo> props = obj.getClassInfo().getAxioms();

        // TODO(drish): throw in case where class has no fields ?
        if (props.size() <= 0) {
            return;
        }
        values = new HashMap<String, Object>();

        for (PropertyInfo p: props) {

            // do include ID into columns, since its auto-incremented
            if (p.getName().equals("id")) {
                continue;
            }
            columnNames.add(p.getName());
            Object value = p.get(obj);
            values.put(p.getName(), value);
        }
    }

    /**
     * get formated column names
     * @return String
     */
    public String getFormatedColumnNames() {
        StringJoiner joiner = new StringJoiner(",");
        StringBuilder output = new StringBuilder("( ");
        for (String columnName: columnNames) {
            joiner.add(columnName);
        }
        output.append(joiner.toString());
        output.append(" )");
        return output.toString();
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
        StringBuilder output = new StringBuilder("( ");
        StringJoiner joiner = new StringJoiner(",");
        for (int i = 0; i < columnNames.size(); i++) {
            joiner.add("?");
        }
        output.append(joiner.toString());
        output.append(" )");
        return output.toString();
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
