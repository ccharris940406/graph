import { Nodes } from "../../types/nodes";

export function getCostCoordinates(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): { xt: number; yt: number } {
  const a = x1 - x2;
  const b = y1 - y2;
  const N = Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
  const midPoint = { X: (x1 + x2) / 2, Y: (y1 + y2) / 2 };
  const vector: { A: number; B: number } = { A: (b * -1) / N, B: a / N };
  return {
    xt: vector.A * 12 + midPoint.X,
    yt: vector.B * 12 + midPoint.Y,
  };
}

export function getClickedNode(nodes: Nodes, mouseX: number, mouseY: number) {
  for (let index = 0; index < nodes.length; index++) {
    const element = nodes[index];
    const X = (mouseX - element.canvaNode.x) * (mouseX - element.canvaNode.x);
    const Y = (mouseY - element.canvaNode.y) * (mouseY - element.canvaNode.y);
    if (X + Y <= element.canvaNode.radius * element.canvaNode.radius) {
      return element;
    }
  }
  return null;
}
