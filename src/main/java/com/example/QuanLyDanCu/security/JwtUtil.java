package com.example.QuanLyDanCu.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil {
    // 🔹 Nên dùng chuỗi base64 thật sự (bạn có thể generate mới)
    private static final String SECRET_KEY = "uZxIhHqj4Hd7Gd5sP3B9oK4gZr1wE8tY2xF0lV6qR9uN5pD2sA7jC0mH8qT3vR1n";
    private static final long EXPIRATION = 24 * 60 * 60 * 1000; // 1 ngày

    private Key getSignKey() {
        // Giải mã chuỗi base64 -> tạo key hợp lệ
        byte[] keyBytes = Decoders.BASE64.decode(SECRET_KEY);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String username, String role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION))
                .signWith(getSignKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }
}
