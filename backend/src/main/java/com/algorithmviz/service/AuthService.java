package com.algorithmviz.service;

import com.algorithmviz.dto.AuthResponse;
import com.algorithmviz.dto.RegisterRequest;
import com.algorithmviz.entity.AppUser;
import com.algorithmviz.repository.AppUserRepository;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.HexFormat;

@Service
public class AuthService {

    private final AppUserRepository userRepository;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthService(AppUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public AuthResponse register(RegisterRequest req) {
        String username = normalize(req.getUsername());
        String displayName = normalize(req.getDisplayName());
        String password = req.getPassword() == null ? "" : req.getPassword();

        if (username.isBlank() || password.isBlank()) {
            throw new IllegalArgumentException("请完整填写注册信息。");
        }
        if (username.length() > 50) {
            throw new IllegalArgumentException("用户名不能超过 50 个字符。");
        }
        if (password.length() < 6) {
            throw new IllegalArgumentException("密码至少需要 6 个字符。");
        }
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("该用户名已被注册。");
        }

        String salt = generateSalt();
        AppUser user = new AppUser();
        user.setUsername(username);
        user.setDisplayName(displayName.isBlank() ? username : displayName);
        user.setPasswordSalt(salt);
        user.setPasswordHash(hashPassword(password, salt));

        return toResponse(userRepository.save(user));
    }

    public AuthResponse login(String username, String password) {
        String normalizedUsername = normalize(username);
        String rawPassword = password == null ? "" : password;

        AppUser user = userRepository.findByUsername(normalizedUsername)
                .orElseThrow(() -> new IllegalArgumentException("用户名或密码不正确。"));

        String candidateHash = hashPassword(rawPassword, user.getPasswordSalt());
        if (!MessageDigest.isEqual(
                candidateHash.getBytes(StandardCharsets.UTF_8),
                user.getPasswordHash().getBytes(StandardCharsets.UTF_8))) {
            throw new IllegalArgumentException("用户名或密码不正确。");
        }

        return toResponse(user);
    }

    private AuthResponse toResponse(AppUser user) {
        return new AuthResponse(user.getId(), user.getUsername(), user.getDisplayName());
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }

    private String generateSalt() {
        byte[] bytes = new byte[16];
        secureRandom.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private String hashPassword(String password, String salt) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest((salt + ":" + password).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 is not available", e);
        }
    }
}
