package com.eaut.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ClientHttpRequestFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class RestTemplateConfig {

    @Value("${ai.diagnostic.api.timeout:60000}")
    private int aiDiagnosticTimeout;

    /**
     * RestTemplate bean cho AI diagnostic service
     * Timeout cao hơn do AI processing có thể mất thời gian
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofMillis(aiDiagnosticTimeout))
                .setReadTimeout(Duration.ofMillis(aiDiagnosticTimeout))
                .build();
    }
}
