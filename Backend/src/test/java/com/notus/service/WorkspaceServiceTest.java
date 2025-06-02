//package com.notus.service;
//
//import com.notus.dto.workspace.WorkspaceRequest;
//import com.notus.dto.workspace.WorkspaceResponse;
//import com.notus.entity.User;
//import com.notus.entity.Workspace;
//import com.notus.exception.BadRequestException;
//import com.notus.exception.ResourceNotFoundException;
//import com.notus.repository.UserRepository;
//import com.notus.repository.WorkspaceRepository;
//import org.junit.jupiter.api.BeforeEach;
//import org.junit.jupiter.api.Test;
//import org.junit.jupiter.api.extension.ExtendWith;
//import org.mockito.InjectMocks;
//import org.mockito.Mock;
//import org.mockito.junit.jupiter.MockitoExtension;
//
//import java.util.Arrays;
//import java.util.List;
//import java.util.Optional;
//
//import static org.assertj.core.api.Assertions.assertThat;
//import static org.assertj.core.api.Assertions.assertThatThrownBy;
//import static org.mockito.ArgumentMatchers.any;
//import static org.mockito.Mockito.*;
//
//@ExtendWith(MockitoExtension.class)
//class WorkspaceServiceTest {
//
//    @Mock
//    private WorkspaceRepository workspaceRepository;
//
//    @Mock
//    private UserRepository userRepository;
//
//    @InjectMocks
//    private WorkspaceService workspaceService;
//
//    private User user;
//    private Workspace workspace;
//    private WorkspaceRequest workspaceRequest;
//    private final Long USER_ID = 1L;
//    private final Long WORKSPACE_ID = 1L;
//
//    @BeforeEach
//    void setUp() {
//        user = new User();
//        user.setId(USER_ID);
//        user.setEmail("test@example.com");
//
//        workspace = new Workspace();
//        workspace.setId(WORKSPACE_ID);
//        workspace.setName("Test Workspace");
////        workspace.setUser(user);
//
//        workspaceRequest = new WorkspaceRequest();
//        workspaceRequest.setName("Test Workspace");
//    }
//
//    @Test
//    void createWorkspace_Success() {
//        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
////        when(workspaceRepository.countByUserIdAndDeletedAtIsNull(USER_ID)).thenReturn(0L);
//        when(workspaceRepository.save(any(Workspace.class))).thenReturn(workspace);
//
//        WorkspaceResponse response = workspaceService.createWorkspace(workspaceRequest, USER_ID);
//
//        assertThat(response).isNotNull();
//        assertThat(response.getName()).isEqualTo(workspaceRequest.getName());
//        verify(workspaceRepository).save(any(Workspace.class));
//    }
//
//    @Test
//    void createWorkspace_ExceedsLimit() {
//        when(userRepository.findById(USER_ID)).thenReturn(Optional.of(user));
////        when(workspaceRepository.countByUserIdAndDeletedAtIsNull(USER_ID)).thenReturn(5L);
//
//        assertThatThrownBy(() -> workspaceService.createWorkspace(workspaceRequest, USER_ID))
//                .isInstanceOf(BadRequestException.class)
//                .hasMessageContaining("Maximum workspace limit reached");
//    }
//
//    @Test
//    void getWorkspaces_Success() {
//        List<Workspace> workspaces = Arrays.asList(workspace);
////        when(workspaceRepository.findByUserIdAndDeletedAtIsNull(USER_ID)).thenReturn(workspaces);
//
//        List<WorkspaceResponse> response = workspaceService.getWorkspaces(USER_ID);
//
//        assertThat(response).hasSize(1);
//        assertThat(response.get(0).getName()).isEqualTo(workspace.getName());
//    }
//
//    @Test
//    void getWorkspace_Success() {
//        when(workspaceRepository.findActiveWorkspaceByIdAndUserId(WORKSPACE_ID, USER_ID))
//                .thenReturn(Optional.of(workspace));
//
//        WorkspaceResponse response = workspaceService.getWorkspace(WORKSPACE_ID, USER_ID);
//
//        assertThat(response).isNotNull();
//        assertThat(response.getName()).isEqualTo(workspace.getName());
//    }
//
//    @Test
//    void getWorkspace_NotFound() {
//        when(workspaceRepository.findActiveWorkspaceByIdAndUserId(WORKSPACE_ID, USER_ID))
//                .thenReturn(Optional.empty());
//
//        assertThatThrownBy(() -> workspaceService.getWorkspace(WORKSPACE_ID, USER_ID))
//                .isInstanceOf(ResourceNotFoundException.class)
//                .hasMessageContaining("Workspace not found");
//    }
//
//    @Test
//    void updateWorkspace_Success() {
//        when(workspaceRepository.findActiveWorkspaceByIdAndUserId(WORKSPACE_ID, USER_ID))
//                .thenReturn(Optional.of(workspace));
//        when(workspaceRepository.save(any(Workspace.class))).thenReturn(workspace);
//
//        workspaceRequest.setName("Updated Workspace");
//        WorkspaceResponse response = workspaceService.updateWorkspace(WORKSPACE_ID, workspaceRequest, USER_ID);
//
//        assertThat(response).isNotNull();
//        assertThat(response.getName()).isEqualTo(workspaceRequest.getName());
//        verify(workspaceRepository).save(any(Workspace.class));
//    }
//
//    @Test
//    void deleteWorkspace_Success() {
//        when(workspaceRepository.findActiveWorkspaceByIdAndUserId(WORKSPACE_ID, USER_ID))
//                .thenReturn(Optional.of(workspace));
//        when(workspaceRepository.save(any(Workspace.class))).thenReturn(workspace);
//
//        workspaceService.deleteWorkspace(WORKSPACE_ID, USER_ID);
//
//        verify(workspaceRepository).save(workspace);
//        assertThat(workspace.getDeletedAt()).isNotNull();
//    }
//} 