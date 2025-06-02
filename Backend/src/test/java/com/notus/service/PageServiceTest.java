//package com.notus.service;
//
//import com.notus.dto.page.PageRequest;
//import com.notus.dto.page.PageResponse;
//import com.notus.entity.Page;
//import com.notus.entity.Workspace;
//import com.notus.exception.BadRequestException;
//import com.notus.exception.ResourceNotFoundException;
//import com.notus.repository.PageRepository;
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
//class PageServiceTest {
//
//    @Mock
//    private PageRepository pageRepository;
//
//    @Mock
//    private WorkspaceRepository workspaceRepository;
//
//    @InjectMocks
//    private PageService pageService;
//
//    private Workspace workspace;
//    private Page page;
//    private PageRequest pageRequest;
//    private final Long WORKSPACE_ID = 1L;
//    private final Long PAGE_ID = 1L;
//    private final Long USER_ID = 1L;
//
//    @BeforeEach
//    void setUp() {
//        workspace = new Workspace();
//        workspace.setId(WORKSPACE_ID);
//
//        page = new Page();
//        page.setId(PAGE_ID);
//        page.setTitle("Test Page");
//        page.setContent("Test Content");
//        page.setWorkspace(workspace);
//
//        pageRequest = new PageRequest();
//        pageRequest.setTitle("Test Page");
//        pageRequest.setContent("Test Content");
//    }
//
//    @Test
//    void createPage_Success() {
//        when(workspaceRepository.findActiveWorkspaceByIdAndUserId(WORKSPACE_ID, USER_ID))
//                .thenReturn(Optional.of(workspace));
//        when(pageRepository.save(any(Page.class))).thenReturn(page);
//
//        PageResponse response = pageService.createPage(WORKSPACE_ID, pageRequest, USER_ID);
//
//        assertThat(response).isNotNull();
//        assertThat(response.getTitle()).isEqualTo(pageRequest.getTitle());
//        assertThat(response.getContent()).isEqualTo(pageRequest.getContent());
//        verify(pageRepository).save(any(Page.class));
//    }
//
//    @Test
//    void createPage_WorkspaceNotFound() {
//        when(workspaceRepository.findActiveWorkspaceByIdAndUserId(WORKSPACE_ID, USER_ID))
//                .thenReturn(Optional.empty());
//
//        assertThatThrownBy(() -> pageService.createPage(WORKSPACE_ID, pageRequest, USER_ID))
//                .isInstanceOf(ResourceNotFoundException.class)
//                .hasMessageContaining("Workspace not found");
//    }
//
//    @Test
//    void createPage_WithParent_Success() {
//        Page parentPage = new Page();
//        parentPage.setId(2L);
//        parentPage.setWorkspace(workspace);
//
//        pageRequest.setParentId(2L);
//
//        when(workspaceRepository.findActiveWorkspaceByIdAndUserId(WORKSPACE_ID, USER_ID))
//                .thenReturn(Optional.of(workspace));
//        when(pageRepository.findActivePageByIdAndWorkspaceId(2L, WORKSPACE_ID))
//                .thenReturn(Optional.of(parentPage));
//        when(pageRepository.save(any(Page.class))).thenReturn(page);
//
//        PageResponse response = pageService.createPage(WORKSPACE_ID, pageRequest, USER_ID);
//
//        assertThat(response).isNotNull();
//        verify(pageRepository).findActivePageByIdAndWorkspaceId(2L, WORKSPACE_ID);
//        verify(pageRepository).save(any(Page.class));
//    }
//
//    @Test
//    void getRootPages_Success() {
//        List<Page> pages = Arrays.asList(page);
//        when(workspaceRepository.findActiveWorkspaceByIdAndUserId(WORKSPACE_ID, USER_ID))
//                .thenReturn(Optional.of(workspace));
//        when(pageRepository.findRootPagesByWorkspaceId(WORKSPACE_ID)).thenReturn(pages);
//
//        List<PageResponse> response = pageService.getRootPages(WORKSPACE_ID, USER_ID);
//
//        assertThat(response).hasSize(1);
//        assertThat(response.get(0).getTitle()).isEqualTo(page.getTitle());
//    }
//
//    @Test
//    void updatePage_CircularReference() {
//        Page childPage = new Page();
//        childPage.setId(2L);
//        childPage.setParent(page);
//        childPage.setWorkspace(workspace);
//
//        pageRequest.setParentId(2L);
//
//        when(workspaceRepository.findActiveWorkspaceByIdAndUserId(WORKSPACE_ID, USER_ID))
//                .thenReturn(Optional.of(workspace));
//        when(pageRepository.findActivePageByIdAndWorkspaceId(PAGE_ID, WORKSPACE_ID))
//                .thenReturn(Optional.of(page));
//        when(pageRepository.findActivePageByIdAndWorkspaceId(2L, WORKSPACE_ID))
//                .thenReturn(Optional.of(childPage));
//
//        assertThatThrownBy(() -> pageService.updatePage(WORKSPACE_ID, PAGE_ID, pageRequest, USER_ID))
//                .isInstanceOf(BadRequestException.class)
//                .hasMessageContaining("Circular reference detected");
//    }
//} 