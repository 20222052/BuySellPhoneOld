package com.eaut.backend.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.cache.RedisCacheWriter;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;

import java.time.Duration;

@Configuration
public class RedisConfig {
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
        RedisCacheConfiguration cacheConfiguration = RedisCacheConfiguration.defaultCacheConfig()
                // Khởi tạo cấu hình cache mặc định (bắt đầu từ các thiết lập mặc định của Spring)
                .entryTtl(Duration.ofMinutes(10)) // TTL cho cache: đặt thời gian sống mặc định cho mỗi entry là 10 phút
                .disableCachingNullValues() // Không lưu các giá trị null vào cache (tránh đánh dấu "đã cache" cho dữ liệu không tồn tại)
                .serializeValuesWith(
                        // Cấu hình serializer cho phần value của cache: chuyển đổi object -> JSON khi lưu
                        RedisSerializationContext.SerializationPair.fromSerializer(
                                new GenericJackson2JsonRedisSerializer()
                        )
                ); // Lưu ý: GenericJackson2JsonRedisSerializer ghi thông tin kiểu để deserialize; thay đổi class model có thể gây lỗi khi đọc dữ liệu cũ

        return RedisCacheManager.builder(
                // Tạo RedisCacheWriter không dùng khóa (non-locking) dựa vào RedisConnectionFactory được Spring cung cấp
                RedisCacheWriter.nonLockingRedisCacheWriter(redisConnectionFactory)
        )
                .cacheDefaults(cacheConfiguration) // Áp cấu hình mặc định vừa tạo cho CacheManager (nếu không override riêng cho cache cụ thể)
                .build(); // Xây dựng RedisCacheManager và trả về bean để Spring quản lý
    }
}