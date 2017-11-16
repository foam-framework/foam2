package foam.blob;

import foam.core.X;
import java.net.URL;
import java.net.HttpURLConnection;
import java.nio.ByteBuffer;

public class RestBlobService
    extends AbstractBlobService
{
  public static final int BUFFER_SIZE = 8192;

  protected String address_;

  public RestBlobService(String address) {
    this.address_ = address + "/httpBlobService";
  }

  public String getAddress() {
    return address_;
  }

  //update file to url
  @Override
  public Blob put_(X x, Blob blob) {
    if ( blob instanceof IdentifiedBlob ) {
      return blob;
    }

    try {
      URL url = new URL(address_);
      HttpURLConnection connection = (HttpURLConnection) url.openConnetion();
      
      //create http connection
      connection.setConnectTimeout(5 * 1000);
      connection.setReadTimeout(15 * 1000);
      connnection.setDoOutput(true);
      connection.setUseCaches(false);

      connection.setRequestMethod("PUT");

      connection.setRequestProperty("Accept", "*/*");
      connection.setRequestProperty("Connection", "keep-alive");

      //output blob into connection
      long chunk = 0;
      long size = blob.getSize();
      long chunks = (long) Math.ceil((double) size / (double) BUFFER_SIZE);
      Buffer buffer = new Buffer(BUFFER_SIZE, ByteBuffer.allocate(BUFFER_SIZE));

      //generate file name
      while ( chunk < chunks ) {
        buffer = blob.read(buffer, chunkOffset(chunk));
        byte[] buf = buffer.getData().array();

        //output to http outputStream

        buffer.getData().clear();
        chunk++;
      }

      return null;
    } catch ( Throwable e) {
      e.printStackTrace();
      return null;
    }
  }

  //retrive file from url
  @Override
  public Blob find_(X x, Object id) {
    return null;
  }

  @Override
  public String urlFor_(X x, Blob blob) {
    if ( ! (blob instanceof IdentifiedBlob) ) {
      return null;
    }
    return this.address_ + "/" + ((IdentifiedBlob) blob).getId();
  }

  private long chunkOffset(long i) {
    return i * BUFFER_SIZE;
  }
}