/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

package foam.nanos.mrac;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.channels.FileChannel;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReadWriteLock;

import foam.box.AbstractSkeleton;
import foam.box.Box;
import foam.box.Message;
import foam.dao.DAO;
import foam.nanos.fs.FileSystemStorage;

// 1. Which file to load.
// 2. how many entry to load from file.
// 3. chunk size to write to socketchannel.
// 4. sort need?
// 5. create a file lock dao to store lock.
// The class should be thread-safe, because Skeleton has only one instance in the system.
//TODO: The class is a draft. Need a better design to re-implement it.
//TODO: should create a sink to hook on Map dao, cache any updates.
public class ReplaySkeleton extends AbstractSkeleton {

	//
	private static int fileBlockSize = 524288000;
	// Cache filename -> FileMeta mapping.
	private Map<String, FileMeta> fileMetaCache = new ConcurrentHashMap<String, FileMeta>();

	@Override
	public void send(Message message) {
		// TODO: Create different Message for fileReplay
		if (!(message.getObject() instanceof Message)) {
			// TODO: Log error
			// Response error?
			return;
		}

		Box replyBox = (Box) message.getAttributes().get("replyBox");

		if ( replyBox == null ) {
			//TODO: Log error and return error.
			return;
		}

		if ( ! ( replyBox instanceof TcpSocketChannelFileSinkBox ) ) {
			//TODO: Log and return error.
			return;
		}

		TcpSocketChannelFileSinkBox sinkBox = (TcpSocketChannelFileSinkBox) replyBox;

		// TODO: get it from message.
		String fileName = "aaa";

		DAO fileMetaDAO = (DAO) getX().get("fileMetaDAO");

		// Get and cache FileMeta.
		fileMetaCache.computeIfAbsent(fileName, key -> {
			return (FileMeta) fileMetaDAO.find(fileName);
		});

		FileMeta fileMeta = fileMetaCache.get(fileName);
		if (fileMeta == null) {
			// Fail to obtain FileMeta by given fileName, then replay should cancel.
			// TODO: log error;
			return;
		}

		// TODO: double check. Make sure it returns one that inject in the Boot.java.
		FileSystemStorage fileSystemStorage = (FileSystemStorage) getX().get(foam.nanos.fs.Storage.class);
		File file = fileSystemStorage.get(fileName);
		if ( ! file.exists() ) {
			// File does not exist.
			// TODO: log and return error.
			return;
		}

		FileInputStream fileInputStream = null;
		FileChannel fileChannel = null;

		try {
			fileInputStream = new FileInputStream(file.getAbsolutePath());
			fileChannel = fileInputStream.getChannel();
		} catch ( FileNotFoundException e ) {
			//TODO: log and return error.
			return;
		}

		ReadWriteLock readWriteLock = (ReadWriteLock) fileMeta.getFileLock();
		Lock readLock = readWriteLock.readLock();

		long totalFetchFileSize = -1;

		//TODO: we can have a journalMeta model to store data info.
		readLock.lock();
		try {
			totalFetchFileSize = fileChannel.size();
			//TODO: need to create TempQueueSink to listen to the DAO.
		} catch ( Exception e ) {
			//TODO: log exception.
			//TODO: return failure message to client.
			return;
		} finally {
			readLock.unlock();
		}

		// Allocate 500MB off-heap buffer. Avoid GC.
		ByteBuffer byteBuffer = ByteBuffer.allocateDirect(fileBlockSize);

		try {
			while ( fileChannel.position() < totalFetchFileSize ) {
				if ( (int) ( totalFetchFileSize - fileChannel.position() ) < fileBlockSize ) {
					// Create a new byteBuffer for the last block of bytes in file.
					byteBuffer = ByteBuffer.allocateDirect((int) (totalFetchFileSize - fileChannel.position()));
				}

				fileChannel.read(byteBuffer);
				byteBuffer.flip();
				while ( byteBuffer.hasRemaining() ) {
					sinkBox.send(byteBuffer);
				}
				byteBuffer.clear();
			}
		} catch ( IOException e ) {
			//TODO: close SocketChannel.
			//TODO: Need to specify there exception come from?.
			//TODO: If IOException comes from fileChannel, then we can still re-use the channel.

		}

		//TODO: single client when file transfer is finish.

		System.out.println("file path: ");
		System.out.println(file.getAbsolutePath());
	
	}

	@Override
	public void setDelegateObject(Object obj) {
		//TODO: need to implement this method?

	}
}