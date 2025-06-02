package com.notus.config;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.notus.dto.error.ApiError;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint{
	
	private final ObjectMapper objectMapper;

	@Override
	public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException, ServletException {
		
		response.addHeader("Content-Type", "application/json;charset=UTF-8");
		response.setStatus(HttpServletResponse.SC_FORBIDDEN);
		ApiError apiError = ApiError.of(HttpStatus.NOT_FOUND, authException.getMessage(), authException);
//		ExceptionResponse exceptionResponse = new ExceptionResponse(DateTimeUtil.getCurrentTimeStamp(),
//				HttpStatus.FORBIDDEN.value(), "SESSION_EXPIRED", "Session Expired", request.getRequestURI(), null);
		objectMapper.writeValue(response.getOutputStream(), apiError);
		response.flushBuffer();
		
	}

}
