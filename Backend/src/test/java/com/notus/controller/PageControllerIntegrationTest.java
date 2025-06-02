//package com.notus.controller;
//
//import com.fasterxml.jackson.databind.ObjectMapper;
//import com.notus.config.TestConfig;
//import com.notus.dto.page.PageRequest;
//import com.notus.entity.Page;
//import com.notus.entity.User;
//import com.notus.entity.Workspace;
//import com.notus.repository.PageRepository;
//import com.notus.repository.UserRepository;
//import com.notus.repository.WorkspaceRepository;
//import com.notus.security.JwtTokenProvider;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
//import org.springframework.boot.test.context.SpringBootTest;
//import org.springframework.context.annotation.Import;
//import org.springframework.http.MediaType;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.test.web.servlet.MockMvc;
//import org.springframework.test.web.servlet.ResultActions;
//
//import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
//import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
//
//@SpringBootTest
//@AutoConfigureMockMvc
//@Import(TestConfig.class)
//class PageControllerIntegrationTest {
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Autowired
//    private ObjectMapper objectMapper;
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private WorkspaceRepository workspaceRepository;
//
//    @Autowired
//    private PageRepository pageRepository;
//
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//
//    @Autowired
//    private JwtTokenProvider jwtTokenProvider;
//
//    private User user;
//    private Workspace workspace;
//    private String jwtToken;
//
//    @BeforeEach
//    void setUp() {
//        // Clean up
//        pageRepository.deleteAll();
//        workspaceRepository.deleteAll();
//        userRepository.deleteAll();
//
//        // Create test user
//        user = new User();
//        user.setEmail("test@example.com");
//        user.setPassword(passwordEncoder.encode("password"));
//        user.setName("Test User");
//        user = userRepository.save(user);
//
//        // Create test workspace
//        workspace = new Workspace();
//        workspace.setName("Test Workspace");
////        workspace.setUser(user);
//        workspace = workspaceRepository.save(workspace);
//
//        // Generate JWT token
////        jwtToken = jwtTokenProvider.generateToken(user.getId());
//    }
//
//    @Test
//    void createPage_Success() throws Exception {
//        PageRequest request = new PageRequest();
//        request.setTitle("Test Page");
//        request.setContent("Test Content");
//
//        ResultActions response = mockMvc.perform(post("/api/workspaces/{workspaceId}/pages", workspace.getId())
//                .header("Authorization", "Bearer " + jwtToken)
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(objectMapper.writeValueAsString(request)));
//
//        response.andExpect(status().isOk())
//                .andExpect(jsonPath("$.title").value(request.getTitle()))
//                .andExpect(jsonPath("$.content").value(request.getContent()))
//                .andExpect(jsonPath("$.workspaceId").value(workspace.getId()));
//    }
//
//    @Test
//    void getRootPages_Success() throws Exception {
//        // Create a test page
//        Page page = new Page();
//        page.setTitle("Test Page");
//        page.setContent("Test Content");
//        page.setWorkspace(workspace);
//        pageRepository.save(page);
//
//        ResultActions response = mockMvc.perform(get("/api/workspaces/{workspaceId}/pages", workspace.getId())
//                .header("Authorization", "Bearer " + jwtToken));
//
//        response.andExpect(status().isOk())
//                .andExpect(jsonPath("$[0].title").value(page.getTitle()))
//                .andExpect(jsonPath("$[0].content").value(page.getContent()));
//    }
//
//    @Test
//    void updatePage_Success() throws Exception {
//        // Create a test page
//        Page page = new Page();
//        page.setTitle("Original Title");
//        page.setContent("Original Content");
//        page.setWorkspace(workspace);
//        page = pageRepository.save(page);
//
//        PageRequest request = new PageRequest();
//        request.setTitle("Updated Title");
//        request.setContent("Updated Content");
//
//        ResultActions response = mockMvc.perform(put("/api/workspaces/{workspaceId}/pages/{pageId}", 
//                workspace.getId(), page.getId())
//                .header("Authorization", "Bearer " + jwtToken)
//                .contentType(MediaType.APPLICATION_JSON)
//                .content(objectMapper.writeValueAsString(request)));
//
//        response.andExpect(status().isOk())
//                .andExpect(jsonPath("$.title").value(request.getTitle()))
//                .andExpect(jsonPath("$.content").value(request.getContent()));
//    }
//
//    @Test
//    void deletePage_Success() throws Exception {
//        // Create a test page
//        Page page = new Page();
//        page.setTitle("Test Page");
//        page.setContent("Test Content");
//        page.setWorkspace(workspace);
//        page = pageRepository.save(page);
//
//        ResultActions response = mockMvc.perform(delete("/api/workspaces/{workspaceId}/pages/{pageId}", 
//                workspace.getId(), page.getId())
//                .header("Authorization", "Bearer " + jwtToken));
//
//        response.andExpect(status().isNoContent());
//    }
//} 