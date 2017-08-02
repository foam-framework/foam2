/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.dao;

import java.util.List;
import java.util.Arrays;
import java.util.ArrayList;
import java.util.Iterator;

import foam.core.FObject;
import foam.core.X;
import foam.core.PropertyInfo;
import foam.core.ClassInfo;
import foam.mlang.order.Comparator;
import foam.mlang.predicate.Predicate;

// FObject JSON Parsing
import foam.core.EmptyX;
import foam.lib.json.JSONParser;
import foam.lib.json.Outputter;

// MongoDB Driver Dependencies
import com.mongodb.MongoClient;
import com.mongodb.MongoClientURI;
import com.mongodb.ServerAddress;
import com.mongodb.MongoCredential;

import com.mongodb.client.MongoDatabase;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoCursor;

import org.bson.BsonDocument;
import org.bson.BsonDocumentReader;
import org.bson.BsonType;


public class MongoDAO
        extends AbstractDAO
{
  private MongoDatabase database;
  private String collectionName;

  public MongoDAO(String host, int port, String dbName, String collectionName, String username, String password) {
    if ( dbName == null || dbName.isEmpty() || collectionName == null || collectionName.isEmpty() ) {
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
    return ( ( username != null ) && ( ! username.isEmpty() ) ) &&
            ( ( password != null ) && ( ! password.isEmpty() ) );
  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( sink == null ) {
      sink = new ListSink();
    }

    Sink         decorated = decorateSink_(sink, skip, limit, order, predicate);
    Subscription sub       = new Subscription();

    if ( getOf() == null ) {
      throw new IllegalArgumentException("`of` is not set");
    }

    MongoCollection<BsonDocument> collection = database.getCollection(collectionName, BsonDocument.class);
    MongoCursor<BsonDocument> cursor = collection.find().iterator();

    try {
      while ( cursor.hasNext() ) {
        if ( sub.getDetached() ) break;

        FObject obj = createFObject(x, new BsonDocumentReader(cursor.next()), getOf().getObjClass());

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

  private FObject createFObject(X x, BsonDocumentReader reader, Class cls) {
    FObject obj = (FObject) x.create(cls);

    reader.readStartDocument();

    while ( reader.readBsonType() != BsonType.END_OF_DOCUMENT ) {
      String fieldName = reader.readName();

      // Skips the initial MongoDB Document ID field
      if ( fieldName.equals("_id") ) {
        reader.readObjectId();
        continue;
      }

      Class fieldType = ((PropertyInfo) obj.getClassInfo().getAxiomByName(fieldName)).getValueClass();

      obj.setProperty(fieldName, getValue(x, reader, fieldType));
    }

    reader.readEndDocument();

    return obj;
  }

  private Object getValue(X x, BsonDocumentReader reader, Class cls) {
    Object value = null;

    switch ( reader.getCurrentBsonType() ) {
      case INT32:
        value = reader.readInt32();
        break;
        
      case INT64:
        value = reader.readInt64();
        break;

      case ARRAY:
        value = readArray(x, reader, cls);
        break;

      case BOOLEAN:
        value = reader.readBoolean();
        break;

      case DATE_TIME:
        // Converts epoch timestamp to java date
        value = new java.util.Date((java.lang.Long) reader.readDateTime());
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
        value = createFObject(x, reader, cls);
        break;

      default:
        System.out.println(reader.getCurrentBsonType() + " parsing is not yet implemented.");
    }

    return value;
  }

  private Object readArray(X x, BsonDocumentReader reader, Class cls) {
    reader.readStartArray();

    ArrayList<Object> arr = new ArrayList();

    while (reader.readBsonType() != BsonType.END_OF_DOCUMENT) {
      arr.add(getValue(x, reader, cls));
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
