package com.notus.entity;



import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "text_chunk_embedding")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TextChunkEmbedding {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "chunk_text", columnDefinition = "text")
    private String chunkText;

    @Column(name = "source_id")
    private Long sourceId; // user id

    @Column(name = "vector", columnDefinition = "vector(384)")
    private String vector;
    
    @Column(name = "work_space_id")
    private Long workSpaceId;
    
    @Column(name = "page_id")
    private Long pageId;
}