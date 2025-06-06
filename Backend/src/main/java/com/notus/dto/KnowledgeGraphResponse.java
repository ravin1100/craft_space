package com.notus.dto;

import java.util.List;

public record KnowledgeGraphResponse(List<GraphNode> nodes, List<GraphEdge> edges) {}

