package com.daybook.service;

import com.daybook.dto.*;
import com.daybook.exception.BadRequestException;
import com.daybook.exception.UnauthorizedException;
import com.daybook.model.Profile;
import com.daybook.model.RefreshToken;
import com.daybook.model.User;
import com.daybook.repository.ProfileRepository;
import com.daybook.repository.RefreshTokenRepository;
import com.daybook.repository.UserRepository;
import com.daybook.security.JwtService;
import com.daybook.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            ProfileRepository profileRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User(request.getEmail(), passwordEncoder.encode(request.getPassword()));
        user = userRepository.save(user);

        Profile profile = new Profile(user);
        profileRepository.save(profile);

        String accessToken = jwtService.generateAccessTokenForUser(user.getId(), user.getEmail());
        String refreshTokenStr = createRefreshToken(user);

        UserDto userDto = new UserDto(user.getId(), user.getEmail(), user.getCreatedAt());
        return new AuthResponse(accessToken, refreshTokenStr, userDto);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        String accessToken = jwtService.generateAccessToken(authentication);
        String refreshTokenStr = createRefreshToken(user);

        UserDto userDto = new UserDto(user.getId(), user.getEmail(), user.getCreatedAt());
        return new AuthResponse(accessToken, refreshTokenStr, userDto);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        String tokenHash = hashToken(request.getRefreshToken());
        RefreshToken refreshToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token"));

        if (refreshToken.isRevoked() || refreshToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new UnauthorizedException("Refresh token is expired or revoked");
        }

        // Revoke old refresh token (token rotation)
        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);

        User user = refreshToken.getUser();
        String newAccessToken = jwtService.generateAccessTokenForUser(user.getId(), user.getEmail());
        String newRefreshTokenStr = createRefreshToken(user);

        UserDto userDto = new UserDto(user.getId(), user.getEmail(), user.getCreatedAt());
        return new AuthResponse(newAccessToken, newRefreshTokenStr, userDto);
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Transactional
    public void changePassword(Long userId, PasswordChangeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private String createRefreshToken(User user) {
        String rawToken = jwtService.generateRefreshToken();
        String tokenHash = hashToken(rawToken);

        LocalDateTime expiresAt = LocalDateTime.now().plusNanos(jwtService.getRefreshTokenExpirationMs() * 1_000_000);
        RefreshToken refreshToken = new RefreshToken(user, tokenHash, expiresAt);
        refreshTokenRepository.save(refreshToken);

        return rawToken;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing refresh token", e);
        }
    }
}
