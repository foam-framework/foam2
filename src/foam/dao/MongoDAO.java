/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;
import com.mongodb.client.MongoDatabase;
import com.mongodb.MongoClient;
import com.mongodb.MongoCredential;
import com.mongodb.ServerAddress;
import foam.core.FObject;
import foam.core.PropertyInfo;
import foam.core.X;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;
import foam.nanos.logger.Logger;
import foam.util.SafetyUtil;
import java.util.ArrayList;
import java.util.Arrays;
import org.bson.BsonDocument;
import org.bson.BsonDocumentReader;
import org.bson.BsonType;

// FObject JSON Parsing
// MongoDB Driver Dependencies

public class MongoDAO
  extends AbstractDAO
{
  protected MongoDatabase database;
  protected String        collectionName;

  public MongoDAO(String host, int port, String dbName, String collectionName, String username, String password) {
    if ( SafetyUtil.isEmpty(dbName) || SafetyUtil.isEmpty(collectionName) ) {
      throw new IllegalArgumentException("Illegal arguments");
    }

    host = ( host != null ) ? host : "localhost";

    MongoClient mongoClient;

    if ( isUserPassProvided(username, password) ) {
      MongoCredential credential = MongoCredential.createCredential(username, dbName, password.toCharArray());
      mongoClient = new MongoClient(new ServerAddress(host, port), Arrays.asList(credential));
    } else {
      mongoClient = new MongoClient(host, port);
    }

    this.database = mongoClient.getDatabase(dbName);
    this.collectionName = collectionName;
  }

  public MongoDAO(String dbName, String collectionName, String username, String password) {
    this("localhost", 27017, dbName, collectionName, username, password);
  }

  public MongoDAO(String dbName, String collectionName) {
    this(dbName, collectionName, null, null);
  }

  private boolean isUserPassProvided(String username, String password) {
    return ( ! SafetyUtil.isEmpty(username) && ! SafetyUtil.isEmpty(password) );
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    sink = prepareSink(sink);

    Sink         decorated = decorateSink_(sink, skip, limit, order, predicate);
    Subscription sub       = new Subscription();
    Logger       logger    = (Logger) x.get("logger");

    if ( getOf() == null ) {
      throw new IllegalArgumentException("`of` is not set");
    }

    MongoCollection<BsonDocument> collection = database.getCollection(collectionName, BsonDocument.class);
    MongoCursor<BsonDocument> cursor = collection.find().iterator();

    try {
      while ( cursor.hasNext() ) {
        if ( sub.getDetached() ) break;

        FObject obj = createFObject(x, new BsonDocumentReader(cursor.next()), getOf().getObjClass(), logger);

        if ( ( predicate == null ) || predicate.f(obj) ) {
          decorated.put(obj, sub);
        }
      }
    } finally {
      cursor.close();
    }

    decorated.eof();

    return sink;
  }

  private FObject createFObject(X x, BsonDocumentReader reader, Class cls, Logger logger) {
    FObject obj = ( cls == null ) ? null : (FObject) x.create(cls);

    reader.readStartDocument();

    while ( reader.readBsonType() != BsonType.END_OF_DOCUMENT ) {
      String fieldName = reader.readName();

      PropertyInfo prop = ( obj == null) ? null :
          (PropertyInfo) obj.getClassInfo().getAxiomByName(fieldName);

      if ( prop == null ) {
        logger.warning("Unknown key in Mongo Document", fieldName);
        getValue(x, reader, null, logger);
        continue;
      }

      Class fieldType = prop.getValueClass();
      obj.setProperty(fieldName, getValue(x, reader, fieldType, logger));
    }

    reader.readEndDocument();

    return obj;
  }

  private Object getValue(X x, BsonDocumentReader reader, Class cls, Logger logger) {
    Object value = null;

    switch ( reader.getCurrentBsonType() ) {
      case INT32:
        value = reader.readInt32();
        break;

      case INT64:
        value = reader.readInt64();
        break;

      case ARRAY:
        value = readArray(x, reader, cls, logger);
        break;

      case BOOLEAN:
        value = reader.readBoolean();
        break;

      case DATE_TIME:
        // Converts epoch timestamp to java date
        value = new java.util.Date(reader.readDateTime());
        break;

      case STRING:
        String str = reader.readString();

        // Accounts for string "true" / "false"
        if ( str.equals("true") ) {
          value = true;
        } else if ( str.equals("false") ) {
          value = false;
        } else {
          value = str;
        }

        break;

      case DOUBLE:
        value = reader.readDouble();
        break;

      case NULL:
        value = null;
        reader.readNull();
        break;

      case DOCUMENT:
        value = createFObject(x, reader, cls, logger);
        break;

      case OBJECT_ID:
        value = reader.readObjectId().toString();
        break;

      default:
        logger.error(reader.getCurrentBsonType(), "parsing is not yet implemented.");
    }

    return value;
  }

  private Object readArray(X x, BsonDocumentReader reader, Class cls, Logger logger) {
    reader.readStartArray();

    ArrayList<Object> arr = new ArrayList();

    while ( reader.readBsonType() != BsonType.END_OF_DOCUMENT ) {
      arr.add(getValue(x, reader, cls, logger));
    }

    reader.readEndArray();

    return arr;
  }

  @Override
  public FObject put_(X x, FObject obj) {
    throw new UnsupportedOperationException("put_ is not yet supported for MongoDAO");
  }

  @Override
  public FObject find_(X x, Object id) {
    throw new UnsupportedOperationException("find_ is not yet supported for MongoDAO");
  }

  @Override
  public FObject remove_(X x, FObject obj) {
    throw new UnsupportedOperationException("remove_ is not yet supported for MongoDAO");
  }

  @Override
  public void removeAll_(X x, long skip, long limit, Comparator order, Predicate predicate) {
    throw new UnsupportedOperationException("removeAll_ is not yet supported for MongoDAO");
  }
}
