import { useEffect, useState } from "react";
import mocks from "../../mocks/graph.json";
import { type Nodes, type GraphNode } from "../../types/nodes";
import { Edge, Edges } from "../../types/edges";

export function useGraph() {
  const [nodes, setNodes] = useState<Nodes>([]);
  const [edges, setEdges] = useState<Edges>([]);
  const addNode = (newGraphNode: GraphNode) => {
    setNodes(() => {
      return [...nodes, newGraphNode];
    });
  };

  const addEdge = (source: GraphNode, dest: GraphNode, cost: number) => {
    console.log("adding new edge", source, dest);
    setEdges(() => {
      return [
        ...edges,
        {
          id: source.title + dest.title,
          source: source.id,
          destination: dest.id,
          cost: cost,
        },
      ];
    });
  };

  const delNode = (mouseX: number, mouseY: number) => {
    nodes.forEach((current) => {
      const X = (mouseX - current.canvaNode.x) * (mouseX - current.canvaNode.x);
      const Y = (mouseY - current.canvaNode.y) * (mouseY - current.canvaNode.y);
      if (X + Y <= current.canvaNode.radius * current.canvaNode.radius) {
        const newArr = nodes.filter((node) => {
          return node.id !== current.id;
        });
        setNodes(newArr);
      }
    });
  };

  useEffect(() => {
    const mnodes = mocks.nodes;
    const newNodes: Nodes = [];
    mnodes.forEach((element) => {
      const newGraphNode: GraphNode = {
        id: element.id,
        title: element.title,
        cost: element.cost,
        canvaNode: element.canvaNode,
      };
      newNodes.push(newGraphNode);
    });
    setNodes(newNodes);

    const medges = mocks.edges;
    const newEdges: Edges = [];
    medges.forEach((element) => {
      const newEdge: Edge = {
        id: element.id,
        cost: element.cost,
        destination: element.destination,
        source: element.source,
      };
      newEdges.push(newEdge);
    });
    setEdges(newEdges);
  }, []);

  return { nodes, edges, addEdge, addNode, delNode };
}
