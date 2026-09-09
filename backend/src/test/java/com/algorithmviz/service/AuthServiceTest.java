package com.algorithmviz.service;

import com.algorithmviz.dto.RegisterRequest;
import com.algorithmviz.entity.AppUser;
import com.algorithmviz.repository.AppUserRepository;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceTest {
    private final AppUserRepository repository = mock(AppUserRepository.class);
    private final AuthService service = new AuthService(repository);

    private RegisterRequest request(String username) {
        RegisterRequest request = new RegisterRequest();
        request.setUsername(username);
        request.setPassword("test-password");
        return request;
    }

    @ParameterizedTest
    @ValueSource(strings = {"a", "小", "ab", " 小 "})
    void shortUsernameCanRegisterAndLoginWithDisplayNameFallback(String username) {
        when(repository.save(any(AppUser.class))).thenAnswer(invocation -> {
            AppUser user = invocation.getArgument(0);
            when(repository.findByUsername(user.getUsername())).thenReturn(Optional.of(user));
            return user;
        });
        var registered = service.register(request(username));
        assertEquals(username.trim(), registered.getUsername());
        assertEquals(username.trim(), registered.getDisplayName());
        assertEquals(username.trim(), service.login(username, "test-password").getUsername());
    }

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = {" ", "\t\n", "\u3000"})
    void blankUsernameIsRejected(String username) {
        assertThrows(IllegalArgumentException.class, () -> service.register(request(username)));
        verifyNoInteractions(repository);
    }

    @Test
    void maximumLengthRemainsFifty() {
        when(repository.save(any(AppUser.class))).thenAnswer(invocation -> invocation.getArgument(0));
        assertEquals(50, service.register(request("a".repeat(50))).getUsername().length());
        assertEquals("用户名不能超过 50 个字符。", assertThrows(IllegalArgumentException.class,
                () -> service.register(request("a".repeat(51)))).getMessage());
    }
}
