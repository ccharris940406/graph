import "./index.css";
import { useEffect, useRef, useState } from "react";
import { type GraphNode } from "../../types/nodes";
import { useGraph } from "./useGraph";
import { getClickedNode, getCostCoordinates } from "./utils";

export default function Graph() {
  const {
    nodes,
    edges,
    addEdge: addNewEdge,
    addNode: addNewNode,
    delNode: removeNode,
  } = useGraph();
  const myCanvas = useRef<HTMLCanvasElement | null>(null);
  const cityName = useRef<HTMLInputElement | null>(null);
  const [addNode, setAddNode] = useState(false);
  const [delNode, setDelNode] = useState(false);
  const [addEdge, setAddEdge] = useState<1 | 2 | false>(false);
  const [sourceNodeAdd, setSourceNodeAdd] = useState<GraphNode | null>(null);
  const [drawingNode, setDrawingNode] = useState<GraphNode | null>(null);
  const [edgeCostInput, setEdgeCostInput] = useState(false);
  const [newEdgeCost, setNewEdgeCost] = useState(0);

  const clearCanvas = () => {
    const canvas = getMyCurrentCanvas();
    if (canvas === null) return;
    canvas.context.clearRect(0, 0, canvas.canvas.width, canvas.canvas.height);
  };

  const getNodeById = (id: string): { x: number | null; y: number | null } => {
    for (let index = 0; index < nodes.length; index++) {
      const element = nodes[index];
      if (id === element.id)
        return { x: element.canvaNode.x, y: element.canvaNode.y };
    }
    return { x: null, y: null };
  };

  const drawCanvas = () => {
    clearCanvas();
    const context = getMyCurrentCanvas()?.context;
    if (context === null || context === undefined) return;
    edges.forEach((edge) => {
      context.lineWidth = 3;
      context.strokeStyle = "#000";
      context.beginPath();
      const source = getNodeById(edge.source);
      const dest = getNodeById(edge.destination);
      if (source.x && source.y) context.moveTo(source.x, source.y);
      if (dest.x && dest.y) context.lineTo(dest.x, dest.y);
      context.stroke();
      context.closePath();
      context.fillStyle = "black";
      if (source.x && source.y && dest.x && dest.y) {
        const { xt, yt } = getCostCoordinates(
          source.x,
          source.y,
          dest.x,
          dest.y
        );
        context.fillText(edge.cost.toString(), xt, yt);
        context.closePath();
      }
    });
    nodes.forEach((current) => {
      context.beginPath();
      context.arc(
        current.canvaNode.x,
        current.canvaNode.y,
        current.canvaNode.radius,
        0,
        360
      );
      context.closePath();
      context.fillStyle = "blue";
      context.fill();
      context.closePath();
      context.fillStyle = "black";
      context.fillText(
        current.title,
        current.canvaNode.x,
        current.canvaNode.y + 20
      );
      context.closePath();
    });
  };

  const getDrawingNode = (mouseX: number, mouseY: number) => {
    nodes.forEach((current) => {
      const X = (mouseX - current.canvaNode.x) * (mouseX - current.canvaNode.x);
      const Y = (mouseY - current.canvaNode.y) * (mouseY - current.canvaNode.y);
      if (X + Y <= current.canvaNode.radius * current.canvaNode.radius) {
        setDrawingNode(current);
        return current;
      }
    });
    return null;
  };

  const movingNode = (mouseX: number, mouseY: number) => {
    if (drawingNode === null) return;
    nodes.forEach((current) => {
      if (drawingNode.title === current.title) {
        current.canvaNode.x = mouseX;
        current.canvaNode.y = mouseY;
      }
    });
    drawCanvas();
  };

  const getMyCurrentCanvas = (): {
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    canvasX: number;
    canvasY: number;
  } | null => {
    if (myCanvas.current === null) return null;
    const currentCanvas = myCanvas.current;
    const context = myCanvas.current.getContext("2d");
    if (context === null) return null;
    return {
      canvas: myCanvas.current,
      context: context,
      canvasX: currentCanvas.getBoundingClientRect().left,
      canvasY: myCanvas.current.getBoundingClientRect().top,
    };
  };

  useEffect(() => {
    drawCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges]);

  useEffect(() => {
    console.log(addEdge, addEdge);
    if (addEdge === 1) setEdgeCostInput(true);
    else if (addEdge === 2 || addEdge === false) setEdgeCostInput(false);
  }, [addEdge]);

  return (
    <div className="graph">
      <canvas
        ref={myCanvas}
        height={"400"}
        width={"500"}
        onClick={(e) => {
          if (getMyCurrentCanvas === null) return;
          const canvas = getMyCurrentCanvas();
          if (canvas === null) return;
          if (addNode) {
            if (!cityName.current) return;
            const newGraphNode: GraphNode = {
              id: cityName.current.value,
              title: cityName.current.value,
              canvaNode: {
                x: e.clientX - canvas.canvasX,
                y: e.clientY - canvas.canvasY,
                radius: 10,
              },
              cost: 0,
            };
            addNewNode(newGraphNode);
            setAddNode(false);
          } else if (delNode) {
            removeNode(e.clientX - canvas.canvasX, e.clientY - canvas.canvasY);
            setDelNode(false);
          } else if (addEdge === 1) {
            const sourNode = getClickedNode(
              nodes,
              e.clientX - canvas.canvasX,
              e.clientY - canvas.canvasY
            );
            if (sourNode !== null) {
              setSourceNodeAdd(sourNode);
              setAddEdge(2);
            }
          } else if (addEdge === 2) {
            const destNode = getClickedNode(
              nodes,
              e.clientX - canvas.canvasX,
              e.clientY - canvas.canvasY
            );
            if (sourceNodeAdd && destNode)
              addNewEdge(sourceNodeAdd, destNode, newEdgeCost);
            setAddEdge(false);
          }
        }}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (delNode) return;
          const canvas = getMyCurrentCanvas()?.canvas;
          if (canvas === null || canvas === undefined) return;
          getDrawingNode(
            event.clientX - canvas.getBoundingClientRect().left,
            event.clientY - canvas.getBoundingClientRect().top
          );
        }}
        onMouseMove={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (delNode === true) return;
          const canvas = getMyCurrentCanvas()?.canvas;
          if (canvas === null || canvas === undefined) return;
          movingNode(
            event.clientX - canvas.getBoundingClientRect().left,
            event.clientY - canvas.getBoundingClientRect().top
          );
        }}
        onMouseUp={() => {
          setDrawingNode(null);
        }}
        className={`drawzone ${delNode ? "delcity" : ""} ${
          addNode ? "addcity" : ""
        }`}
      >
        Test
      </canvas>
      <div className="controls">
        {addNode && (
          <input
            ref={cityName}
            placeholder="Santiago, La Habana, New York ..."
          />
        )}
        <button
          onClick={() => {
            setDelNode(false);
            setAddNode(!addNode);
          }}
        >
          Add City
        </button>
        <button
          onClick={() => {
            setAddNode(false);
            setDelNode(true);
          }}
        >
          Del City
        </button>
        <button
          onClick={() => {
            if (addEdge === false)
              setAddEdge(() => {
                return 1;
              });
            else setAddEdge(false);
          }}
        >
          Add Edge {`${addEdge ? addEdge : ""}`}
        </button>
        {edgeCostInput && (
          <input
            value={newEdgeCost}
            onChange={(e) => {
              const reg = /^\d+$/;
              const newCost = e.currentTarget.value;
              if (e.currentTarget.value === "") setNewEdgeCost(0);
              else if (reg.test(newCost))
                setNewEdgeCost(+e.currentTarget.value);
            }}
          />
        )}
      </div>
    </div>
  );
}
