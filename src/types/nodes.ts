type Shape = {
  x: number;
  y: number;
  radius: number;
};
type GraphNode = {
  id: string;
  title: string;
  cost: number;
  canvaNode: Shape;
};
type Nodes = GraphNode[];

export type { GraphNode, Shape, Nodes };
