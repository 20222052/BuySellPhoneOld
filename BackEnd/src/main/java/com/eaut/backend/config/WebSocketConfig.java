package com.eaut.backend.config;

import com.eaut.backend.service.AI_ChatBot.AIChatService;
import com.eaut.backend.service.AI_ChatBot.ChatQueueService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.util.Map;

@CrossOrigin(origins = "*")
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Kích hoạt simple memory-based message broker để gửi lại message cho client
        // Các destination có prefix /topic (broadcast) và /queue (p2p) sẽ được broker
        // xử lý
        config.enableSimpleBroker("/topic", "/queue");

        // Các message gửi từ client lên server (để server xử lý, map với
        // @MessageMapping)
        // sẽ bắt đầu bằng prefix /app
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Đăng ký endpoint websocket /ws
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Cho phép mọi origin kết nối (dev)
                .withSockJS(); // Fallback nếu trình duyệt không hỗ trợ WebSocket
    }
}
