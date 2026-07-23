package com.edigital.taskpad.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:/var/www/tasktracker/uploads}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(
                    "http://localhost:3000",
                    "http://localhost:3001",
                    "http://localhost:5173",
                    "http://127.0.0.1:3000",
                    "http://127.0.0.1:3001",
                    "http://127.0.0.1:5173",
                    "https://tasktracker.edigitalknowledge.in",
                    "http://tasktracker.edigitalknowledge.in"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH")
                .allowedHeaders("*")
                .allowCredentials(true);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded files from the configured absolute upload directory
        // On production, nginx serves /uploads/ directly so this acts as fallback for local dev
        java.nio.file.Path absoluteUploadPath = java.nio.file.Paths.get(uploadDir).toAbsolutePath().normalize();
        String uploadLocation = "file:" + absoluteUploadPath.toString() + "/";

        registry.addResourceHandler("/uploads/**", "/api/uploads/**")
                .addResourceLocations(uploadLocation, "file:uploads/", "file:./uploads/");
    }
}
