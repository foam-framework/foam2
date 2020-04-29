package foam.nanos.ccl;

import javax.tools.JavaCompiler;
import javax.tools.JavaFileObject;
import javax.tools.StandardJavaFileManager;
import javax.tools.ToolProvider;
import java.io.*;
import java.nio.MappedByteBuffer;
import java.nio.channels.FileChannel;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.json.*;

public class CCLoader extends ClassLoader {
  final private String[] sources;
  final private String outDir;
  final private String classpath;

  public CCLoader(ClassLoader parent) {

    super(parent);

    String sourcesArrProp = System.getProperty("JAVA_SOURCES");
    JSONObject obj = new JSONObject(sourcesArrProp);

    JSONArray sourcesJson = obj.getJSONArray("sources");
    int sourcesLen = sourcesJson.length();
    sources = new String[sourcesLen];
    if ( sourcesJson != null ) {
      for ( int i=0 ; i<sourcesLen ; i++ ) {
        sources[i] = sourcesJson.getString(i);
      }
    }

    outDir = obj.getString("output");
    classpath = System.getProperty("java.class.path") + ":" + String.join(":", sources);
  }

  private byte[] getBytes( String filename ) throws IOException {
    final FileChannel channel = new FileInputStream(filename).getChannel();
    MappedByteBuffer buffer = channel.map(FileChannel.MapMode.READ_ONLY, 0, channel.size());

    byte[] arr = new byte[buffer.remaining()];
    buffer.get(arr);
    channel.close();
    return arr;
  }

  private boolean compile( File javaFile ) {
    JavaCompiler compiler = ToolProvider.getSystemJavaCompiler();
    StandardJavaFileManager manager = compiler.getStandardFileManager(null, null, null);
    Iterable<? extends JavaFileObject> it = manager.getJavaFileObjectsFromFiles((new ArrayList<>(Arrays.asList(javaFile))));

    List<String> options = new ArrayList<>();
    options.addAll(Arrays.asList("-classpath", classpath, "-d", outDir));
    JavaCompiler.CompilationTask task = compiler.getTask(null, manager, null, options, null, it);
    return task.call();
  }

  @Override
  public Class loadClass( String name)
    throws ClassNotFoundException {

    Class clas;

    clas = findLoadedClass( name );
    if ( clas != null ) return clas;

    String filePath = name.replace( '.', '/' );
    String classFilename = outDir + "/" + filePath + ".class";
    File classFile = new File(classFilename);

    String javaFilename = "";
    File javaFile = null;

    // Find full path to the the java file
    for ( String source: sources ) {
      javaFilename = source + "/" + filePath + ".java";
      javaFile = new File(javaFilename);
      if ( javaFile.exists() ) break;
    }

    if ( javaFile != null && javaFile.exists() &&
      ( ! classFile.exists() ||
        javaFile.lastModified() > classFile.lastModified() ) ) {
      if ( ! compile( javaFile ) || ! classFile.exists() ) {
        throw new ClassNotFoundException( "Compile failed: " + javaFilename );
      }
    }
    try {
      byte raw[] = getBytes( classFilename );
      clas = defineClass( name, raw, 0, raw.length );
    } catch( IOException ie ) { }

    if ( clas == null ) return super.loadClass(name);

    return clas;
  }
}