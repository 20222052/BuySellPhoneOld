package com.eaut.backend.config;

import com.eaut.backend.entities.Role;
import com.eaut.backend.entities.User;
import com.eaut.backend.repository.RoleRepository;
import com.eaut.backend.repository.UserRepository;
import com.eaut.backend.constant.UserRole;
import com.eaut.backend.constant.UserStatus;
import com.eaut.backend.untils.BcryptUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.*;

@Slf4j
@Configuration
@EnableAsync
public class AplplicationInitConfig {
    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository) {
        return args -> {
            if (userRepository.findByEmail("admin@gmail.com").isEmpty()) {
                System.out.println(
                        "Admin user not found. create account admin user username:'admin@gmail.com', password:'Admin1234!@#$' ");
                Role role = new Role();
                if (!roleRepository.existsByName(UserRole.admin.getValue())) {
                    role.setName(UserRole.admin.getValue());
                    role.setDescription("Administrator role with full permissions");
                    try {
                        roleRepository.save(role);
                        log.info("UserService: Role admin save success.");
                    } catch (Exception e) {
                        log.info("UserService: Role admin save failed.");
                        throw new RuntimeException(e);
                    }
                }
                role = roleRepository.findById(UserRole.admin.getValue())
                        .orElseThrow(() -> new RuntimeException("Role admin not found"));
                User user = User.builder()
                        .fullName("admin")
                        .email("admin@gmail.com")
                        .phone("123456789")
                        .password(BcryptUtils.encode("Admin1234!@#$"))
                        .roles(Set.of(role))
                        .status(UserStatus.active)
                        .build();

                try {
                    userRepository.save(user);
                    log.info("UserService: User admin save success.");
                } catch (Exception e) {
                    log.info("UserService: User admin save failed.");
                    throw new RuntimeException(e);
                }
            }
        };
    };
}
