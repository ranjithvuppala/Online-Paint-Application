package core;

import java.io.InputStream;

import javax.ws.rs.core.Response;

import org.glassfish.jersey.media.multipart.FormDataContentDisposition;

public interface HandleImage {
	public Response downloadImageFile();

	public Response uploadImageFile(InputStream fileInputStream,
			FormDataContentDisposition fileFormDataContentDisposition);
}

// Handle image it is a interface used to over ride by adding new features or 
// the methods by not disturbing the total file image resource

// the method in the image resource file are kept in the interface so that it helps in future if we over ride anything