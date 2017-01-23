package application;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;

import com.bazaarvoice.dropwizard.assets.AssetsBundleConfiguration;
import com.bazaarvoice.dropwizard.assets.AssetsConfiguration;
import com.fasterxml.jackson.annotation.JsonProperty;

import io.dropwizard.Configuration;

public class ApplicationConfiguration extends Configuration implements AssetsBundleConfiguration {

	private String[] allowedOrigins;
	
	@Valid
	@NotNull
	@JsonProperty
	private final AssetsConfiguration assets = new AssetsConfiguration();

	@JsonProperty
	public String[] getAllowedOrigins() {
		return allowedOrigins;
	}

	@JsonProperty
	public void setAllowedOrigins(String[] allowedOrigins) {
		this.allowedOrigins = allowedOrigins;
	}

	public AssetsConfiguration getAssetsConfiguration() {
		return this.assets;
	}

}