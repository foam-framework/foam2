/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.medusa;

import foam.core.X;
import foam.dao.NullDAO;
import foam.core.FObject;
import foam.dao.DAO;
import foam.dao.Sink;
import foam.mlang.order.Comparator;
import foam.dao.ArraySink;
import foam.mlang.predicate.Predicate;

import java.net.ConnectException;
import java.io.IOException;
import foam.lib.json.JSONParser;

import foam.nanos.medusa.quorum.*;
import foam.nanos.medusa.*;

public class NodeStatusDAO
  extends NullDAO
{
  //TODO: throw exception for other oprations.

  @Override
  public FObject find_(X x, Object id) {
    Long clusterId = (Long)id;

    DAO clusterDAO = (DAO) x.get("clusterNodeDAO");
    if ( clusterDAO == null ) throw new RuntimeException("can not find clusterDAO");

    ClusterNode node = (ClusterNode) clusterDAO.find_(x, clusterId);
    if ( node == null ) throw new RuntimeException("can not find ClusterNode");

    String urlString = "http://" + node.getIp() + ":" + node.getServicePort() + "/service" + "/ping";

    String ret = null;
    try {
      ret = ping(urlString, "");
    } catch ( IOException e ) {
      NodeStatus status = new NodeStatus();
      status.setId(node.getId());
      status.setHostName(node.getIp() + ":" + node.getServicePort());
      status.setInstanceType(node.getType());
      status.setOnline(false);
      return status;
    }

    NodeStatus response = (NodeStatus) x.create(JSONParser.class).parseString(ret);

    if ( response != null && response.getId() != -1 ) {
      return response;
    }

    throw new RuntimeException("Can not find clusterNode");

  }

  @Override
  public Sink select_(X x, Sink sink, long skip, long limit, Comparator order, Predicate predicate) {
    if ( sink == null ) {
      sink = new ArraySink();
    }

    DAO clusterNodeDAO = (DAO) x.get("clusterNodeDAO");
    if ( clusterNodeDAO == null ) throw new RuntimeException("clusterNodeDAO miss");

    Sink sink1 = clusterNodeDAO.select(new ArraySink());
    java.util.List array = ((ArraySink) sink1).getArray();

    for ( Object value : array ) {
      ClusterNode node = (ClusterNode) value;

      String urlString = "http://" + node.getIp() + ":" + node.getServicePort() + "/service" + "/ping";

      String ret = null;
      try {
        ret = ping(urlString, "");
      } catch ( IOException e ) {
        NodeStatus status = new NodeStatus();
        status.setId(node.getId());
        status.setHostName(node.getIp() + ":" + node.getServicePort());
        status.setGroup(node.getGroup());
        status.setInstanceType(node.getType());
        status.setIsMasterSlave(false);
        status.setQuorumStatus(InstanceState.NONE);
        status.setOnline(false);
        sink.put(status, null);
        continue;
      }
      NodeStatus response = (NodeStatus) x.create(JSONParser.class).parseString(ret);

      if ( response != null && response.getId() != -1 ) {
        sink.put(response, null);
      }
    }
    sink.eof();
    return sink;
  }
  public static String ping(String urlString, String msg) throws IOException {

    java.net.HttpURLConnection conn;

    java.net.URL url = new java.net.URL(urlString);
    conn = (java.net.HttpURLConnection)url.openConnection();
    conn.setDoOutput(true);
    conn.setRequestMethod("POST");
    conn.setRequestProperty("Accept", "application/json");
    conn.setRequestProperty("Content-Type", "application/json");

    java.io.OutputStreamWriter output = new java.io.OutputStreamWriter(conn.getOutputStream(),
        java.nio.charset.StandardCharsets.UTF_8);

    output.write(msg);

    output.close();

    byte[] buf = new byte[8388608];
    java.io.InputStream input = conn.getInputStream();

    int off = 0;
    int len = buf.length;
    int read = -1;
    while ( len != 0 && ( read = input.read(buf, off, len) ) != -1 ) {
      off += read;
      len -= read;
    }

    if ( len == 0 && read != -1 ) {
      throw new RuntimeException("Message too large.");
    }

    String str = new String(buf, 0, off, java.nio.charset.StandardCharsets.UTF_8);
    return str;
  }

}
