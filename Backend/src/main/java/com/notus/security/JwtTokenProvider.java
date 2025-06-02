package com.notus.security;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class JwtTokenProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration}")
    private long jwtExpirationInMs;
    
    public String generateToken(String userName) {
		return doGenerateToken(userName);
	}
	
	private String doGenerateToken(String subject) {
		return Jwts.builder().subject(subject).issuedAt(new Date(System.currentTimeMillis()))
				.expiration(new Date(System.currentTimeMillis() + jwtExpirationInMs  ))
				.signWith(getKey()).compact();
	}
	
	private Key getKey() {
		byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
		SecretKey key = Keys.hmacShaKeyFor(keyBytes);
		return key;
	}

	public String getUserNameFromToken(String token) {
		return getClaimFromToken(token, Claims::getSubject);
	}

	private <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = getAllClaimsFromToken(token);
		return claimsResolver.apply(claims);
	}

	private Claims getAllClaimsFromToken(String token) {
		return Jwts.parser().verifyWith((SecretKey)getKey()).build().parseSignedClaims(token).getPayload();
	}

	public Date getIssuedAtDateFromToken(String token) {
		return getClaimFromToken(token, Claims::getIssuedAt);
	}

	public Date getExpirationDateFromToken(String token) {
		return getClaimFromToken(token, Claims::getExpiration);
	}
	
	public boolean validateToken(String token) {
		try {
	        Jwts.parser()
	            .verifyWith((SecretKey)getKey())
	            .build().parseSignedClaims(token);
	        return true;
	    } catch (SignatureException ex) {
	        System.out.println("Invalid JWT signature");
	    } catch (MalformedJwtException ex) {
	        System.out.println("Invalid JWT token");
	    } catch (ExpiredJwtException ex) {
	        System.out.println("Expired JWT token");
	    } catch (UnsupportedJwtException ex) {
	        System.out.println("Unsupported JWT token");
	    } catch (IllegalArgumentException ex) {
	        System.out.println("JWT claims string is empty.");
	    }
	    return false;
	}
	
} 