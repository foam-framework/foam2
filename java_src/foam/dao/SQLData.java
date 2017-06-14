package foam.dao;

import foam.core.FObject;
import foam.core.PropertyInfo;

import java.util.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.StringJoiner;

/**
 * prepares sql info based on a FObject
 */
public class SQLData {

    //TODO(drish): use uuids ?
    protected Object id;
    protected String table;
    protected ArrayList<String> columnNames;
    protected ArrayList<Object> values;

    public SQLData(FObject obj) throws IllegalStateException, IllegalAccessException {

        table = obj.getClass().getSimpleName().toLowerCase();
        columnNames = new ArrayList<String>();
        List<PropertyInfo> props = obj.getClassInfo().getAxioms();

        // TODO(drish): throw in case where fobject has no properties ?
        if (props.size() <= 0) {
            return;
        }

        values = new ArrayList<Object>();
        for (PropertyInfo p: props) {

            // do not include ID into columns, since its auto-incremented
            if (p.getName().equals("id")) {
                id = p.get(obj);
                continue;
            }
            columnNames.add(p.getName());
            values.add(p.get(obj));
        }
    }

    public String createDeleteStatement() {
        StringBuilder sql = new StringBuilder("delete from " + getTableName());
        sql.append(" where id = ?");
        System.out.println(sql.toString());
        return sql.toString();
    }

    public String createUpdateStatement() {
        StringBuilder sql = new StringBuilder("update " + getTableName() + " set");
        sql.append(getFormatedColumnNames());
        sql.append(" = ");
        sql.append(getFormatedColumnPlaceholders());
        sql.append(" where id = " + id);
        return sql.toString();
    }

    public String createInsertStatement() {
        StringBuilder sql = new StringBuilder("insert into " + getTableName());
        sql.append(getFormatedColumnNames());
        sql.append("values " + getFormatedColumnPlaceholders());
        return sql.toString();
    }

    /**
     * get insert-formated column names
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
     * get formated placeholders for prepared statements insert/update
     * in the following format:
     *
     * (?, ?, ?)
     *
     * @return String
     */
    public String getFormatedColumnPlaceholders() {
        StringBuilder output = new StringBuilder("( ");
        StringJoiner joiner = new StringJoiner(",");
        for (int i = 0; i < columnNames.size(); i++) {
            joiner.add("?");
        }
        output.append(joiner.toString());
        output.append(" )");
        return output.toString();
    }

    public ArrayList<Object> getValues() {
        return values;
    }

    public ArrayList<String> getColumnNames() {
        return columnNames;
    }

    public String getTableName() {
        return table;
    }
}
