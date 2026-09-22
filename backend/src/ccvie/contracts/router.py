"""RouteDecision."""

from enum import Enum


class RouteDecision(str, Enum):
    graph = "graph"
    vector = "vector"
