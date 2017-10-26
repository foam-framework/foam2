package foam.blob;

import foam.core.X;
import org.apache.geronimo.mail.util.Hex;

import java.io.File;
import java.io.FileOutputStream;
import java.nio.ByteBuffer;
import java.security.MessageDigest;

public class BlobStore
    extends AbstractBlobService
{
  protected static final int BUFFER_SIZE = 8192;

  protected String root_ = "/Users/kirk/backend";
  protected String tmp_ = "/Users/kirk/backend/tmp";
  protected String sha256_ = "/Users/kirk/backend/sha256";
  protected boolean isSet_ = false;

  @Override
  public Blob put_(X x, Blob blob) {
    if ( blob instanceof IdentifiedBlob ) {
      return blob;
    }

    this.setup();

    try {
      MessageDigest hash = MessageDigest.getInstance("SHA-256");
      Buffer buffer = new Buffer(BUFFER_SIZE, ByteBuffer.allocate(BUFFER_SIZE));

      long chunk = 0;
      long size = blob.getSize();
      long remaining = size;
      long chunks = (long) Math.ceil((double) size / (double) BUFFER_SIZE);

      File tmp = allocateTmp(1);
      while (chunk < chunks) {
        buffer = blob.read(buffer, chunkOffset(chunk));
        byte[] buf = buffer.getData().array();
        hash.update(buf);
        FileOutputStream os = new FileOutputStream(tmp);
        os.write(buf, 0, buf.length);
        os.close();
        buffer.getData().clear();
        chunk++;
      }

      String digest = new String(Hex.encode(hash.digest()));
      File dest = new File(sha256_ + File.separator + digest);
      tmp.renameTo(dest);

      IdentifiedBlob result = new IdentifiedBlob();
      result.setId(digest);
      return result;
    } catch (Throwable t) {
      t.printStackTrace();
      return null;
    }
  }

  @Override
  public Blob find_(X x, Object id) {
    this.setup();
    if ( ((String) id).indexOf(File.separatorChar) != -1 ) {
      return null;
//      throw new RuntimeException("Invalid file name");
    }

    File file = new File(sha256_ + File.separator + id);
    if ( ! file.exists() ) {
      return null;
//      throw new RuntimeException("File does not exist");
    }

    if ( ! file.canRead() ) {
      return null;
//      throw new RuntimeException("Cannot read file");
    }

    return new FdBlob(file);
  }

  @Override
  public String urlFor_(X x, Blob blob) {
    throw new UnsupportedOperationException("Unsupported operation: urlFor_");
  }

  protected void setup() {
    if ( this.isSet_ )
      return;
    ensureDir(this.root_);
    ensureDir(this.tmp_);
    ensureDir(this.sha256_);
    this.isSet_ = true;
  }

  protected void ensureDir(String path) {
    File parsed = new File(path);
    if ( parsed.exists() && parsed.isDirectory() ) {
      return;
    }

    if ( ! parsed.mkdirs() ) {
      throw new RuntimeException("Failed to create: " + path);
    }
  }

  protected File allocateTmp(long name) {
    String path = this.tmp_ + File.separator + (name++);
    File file = new File(path);
    if ( file.exists() ) {
      return allocateTmp(name);
    }
    return file;
  }

  protected long chunkOffset(long i) {
    return i * BUFFER_SIZE;
  }
}