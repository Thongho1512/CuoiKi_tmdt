package com.tmdt.BEphonestore.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }

    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer.mediaType("jfif", MediaType.valueOf("image/jpeg"))
                .mediaType("jpg", MediaType.valueOf("image/jpeg"))
                .mediaType("jpeg", MediaType.valueOf("image/jpeg"))
                .mediaType("png", MediaType.valueOf("image/png"))
                .mediaType("gif", MediaType.valueOf("image/gif"))
                .mediaType("webp", MediaType.valueOf("image/webp"))
                .mediaType("bmp", MediaType.valueOf("image/bmp"));
    }
}