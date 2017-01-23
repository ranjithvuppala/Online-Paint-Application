// rest functions are presented in resource.

package resources;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

import javax.ws.rs.Consumes;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import javax.ws.rs.core.Response.ResponseBuilder;

import org.glassfish.jersey.media.multipart.FormDataContentDisposition;
import org.glassfish.jersey.media.multipart.FormDataParam;

import core.HandleImage;

@Path("/image")

public class ImageResource implements HandleImage {

	public static final String UPLOAD_FILE_SERVER = "./";

	@GET
	@Path("/download")
	@Produces("image/png")
	public Response downloadImageFile() {

		// set file (and path) to be download
		File file = new File("./blob.png");

		ResponseBuilder responseBuilder = Response.ok((Object) file);
		responseBuilder.header("Content-Disposition", "attachment; filename=\"MyImageFile.png\"");
		return responseBuilder.build();
	}

	@POST
	@Path("/upload")
	@Consumes(MediaType.MULTIPART_FORM_DATA)
	// Multipart form data: Form may contain different type of data may be strings, numbers, images etc 
	// are converted into required format and sends back
	// image cannot be send as image in http packets and is divided into bytes and breaks itself to multi parts
	
	
	public Response uploadImageFile(@FormDataParam("canvasImage") InputStream fileInputStream,
			@FormDataParam("canvasImage") FormDataContentDisposition fileFormDataContentDisposition) {
		String fileName = null;
		String uploadFilePath = null;

		try {
			fileName = fileFormDataContentDisposition.getFileName();
			uploadFilePath = writeToFileServer(fileInputStream, fileName);
		} catch (IOException ioe) {
			ioe.printStackTrace();
		}
		return Response.ok("File uploaded successfully at " + uploadFilePath).build();
	}

	// image cannot be send as image in http packets and is divided into bytes and breaks itself to multi parts
	
	private String writeToFileServer(InputStream inputStream, String fileName) throws IOException {

		OutputStream outputStream = null;
		String qualifiedUploadFilePath = UPLOAD_FILE_SERVER + fileName + ".png";

		try {
			outputStream = new FileOutputStream(new File(qualifiedUploadFilePath));
			int read = 0;
			byte[] bytes = new byte[1024];
			while ((read = inputStream.read(bytes)) != -1) {
				outputStream.write(bytes, 0, read);
			}
			outputStream.flush();
		} catch (IOException ioe) {
			ioe.printStackTrace();
		} finally {
			// release resource, if any
			outputStream.close();
		}
		return qualifiedUploadFilePath;
	}
}
