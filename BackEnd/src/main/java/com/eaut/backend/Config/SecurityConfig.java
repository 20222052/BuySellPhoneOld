package com.eaut.backend.Config;

import com.eaut.backend.Model.Response.BadRequestResponse;
import com.eaut.backend.untils.ErrorCode;
import com.eaut.backend.untils.UserRole;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import javax.crypto.spec.SecretKeySpec;
import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final String[] PUBLIC_ENDPOINTS = {"/auth/**", "/user/**"};
    @Value("${app.jwt.secret}")
    @NonFinal
    private String jwtSecret;

    private final ObjectMapper objectMapper = new ObjectMapper();

   @Bean
   public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
       http
           .csrf(AbstractHttpConfigurer::disable)
           .oauth2ResourceServer(oauth2 ->
                   oauth2.jwt(jwtConfigurer ->
                           jwtConfigurer.decoder(jwtDecoder())
                           .jwtAuthenticationConverter(jwtAuthenticationConverter())
                   )
                   .authenticationEntryPoint((request, response, authException) -> {
                       log.warn("Authentication failed for request {}: {}", request.getRequestURI(), authException.getMessage());
                       
                       BadRequestResponse errorResponse = new BadRequestResponse();
                       errorResponse.setTitle("Authentication Error");
                       errorResponse.setErrorCode(ErrorCode.UNAUTHORIZED.getCode());
                       errorResponse.setMessage("Authentication required. Please provide valid credentials.");
                       errorResponse.setData(null);
                       errorResponse.setUri(request.getRequestURI());
                       errorResponse.setTime(LocalDateTime.now());
                       errorResponse.setRequestId(UUID.randomUUID().toString());
                       
                       response.setStatus(ErrorCode.UNAUTHORIZED.getHttpStatus().value());
                       response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                       response.setCharacterEncoding("UTF-8");
                       
                       objectMapper.writeValue(response.getOutputStream(), errorResponse);
                   })
                   .accessDeniedHandler((request, response, accessDeniedException) -> {
                       log.warn("Access denied for request {}: {}", request.getRequestURI(), accessDeniedException.getMessage());
                       
                       BadRequestResponse errorResponse = new BadRequestResponse();
                       errorResponse.setTitle("Authorization Error");
                       errorResponse.setErrorCode(ErrorCode.FORBIDDEN.getCode());
                       errorResponse.setMessage("Access denied. You don't have permission to access this resource.");
                       errorResponse.setData(null);
                       errorResponse.setUri(request.getRequestURI());
                       errorResponse.setTime(LocalDateTime.now());
                       errorResponse.setRequestId(UUID.randomUUID().toString());
                       
                       response.setStatus(ErrorCode.FORBIDDEN.getHttpStatus().value());
                       response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                       response.setCharacterEncoding("UTF-8");
                       
                       objectMapper.writeValue(response.getOutputStream(), errorResponse);
                   })
           )
           .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
           .authorizeHttpRequests(request -> request
               .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
               .anyRequest().authenticated()
           );

       return http.build();
   }

   @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
       JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
       jwtGrantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");

       JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
         jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
       return jwtAuthenticationConverter;
   }

   @Bean
    JwtDecoder jwtDecoder() {
       SecretKeySpec secretKeySpec = new SecretKeySpec(jwtSecret.getBytes(), "HS512");
       return NimbusJwtDecoder
               .withSecretKey(secretKeySpec)
               .macAlgorithm(MacAlgorithm.HS512)
               .build();
   }

   @Bean
   public PasswordEncoder passwordEncoder() {
       return new BCryptPasswordEncoder();
   }
}