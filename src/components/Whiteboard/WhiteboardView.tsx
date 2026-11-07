import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  MousePointer, Pen, Eraser, Square, Circle, ArrowUpRight, Minus,
  StickyNote, Type, Undo2, Redo2, ZoomIn, ZoomOut, RotateCcw,
  Download, Trash2, Check, Workflow
} from 'lucide-react';
import type {
  WhiteboardData, WhiteboardTool, WhiteboardStroke,
  WhiteboardShape, WhiteboardSticky, WhiteboardText, WhiteboardConnector
} from '../../types';

interface WhiteboardViewProps {
  data?: WhiteboardData;
  onChange: (data: WhiteboardData) => void;
  readOnly?: boolean;
}

const DEFAULT_WHITEBOARD: WhiteboardData = {
  strokes: [],
  shapes: [],
  stickies: [
    {
      id: 'sticky-1',
      x: 240,
      y: 120,
      width: 200,
      height: 160,
      text: '💡 Ideias do Projeto\n• Brainstorm de arquitetura\n• Mapeamento de fluxos',
      color: '#fef08a'
    },
    {
      id: 'sticky-2',
      x: 480,
      y: 120,
      width: 200,
      height: 160,
      text: '🚀 Próxima Entrega\n• Protótipo interativo\n• Validação com clientes',
      color: '#bae6fd'
    }
  ],
  texts: []
};

const COLOR_PALETTE = [
  '#f87171', // Red
  '#fb923c', // Orange
  '#facc15', // Yellow
  '#4ade80', // Green
  '#38bdf8', // Blue
  '#818cf8', // Indigo
  '#c084fc', // Purple
  '#f472b6', // Pink
  '#ffffff', // White
  '#94a3b8', // Gray
  '#0f172a'  // Dark
];

const STICKY_COLORS = [
  { name: 'Amarelo', bg: '#fef08a', text: '#713f12' },
  { name: 'Azul', bg: '#bae6fd', text: '#0369a1' },
  { name: 'Verde', bg: '#bbf7d0', text: '#15803d' },
  { name: 'Rosa', bg: '#fbcfe8', text: '#9d174d' },
  { name: 'Laranja', bg: '#fed7aa', text: '#c2410c' },
  { name: 'Roxo', bg: '#e9d5ff', text: '#6b21a8' }
];

export const WhiteboardView: React.FC<WhiteboardViewProps> = ({
  data = DEFAULT_WHITEBOARD,
  onChange,
  readOnly = false
}) => {
  const currentData: WhiteboardData = {
    strokes: data?.strokes || [],
    shapes: data?.shapes || [],
    stickies: data?.stickies || [],
    texts: data?.texts || [],
    connectors: data?.connectors || []
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeTool, setActiveTool] = useState<WhiteboardTool>('select');
  const [activeColor, setActiveColor] = useState<string>('#38bdf8');
  const [strokeWidth, setStrokeWidth] = useState<number>(3);
  const [stickyColor, setStickyColor] = useState<string>('#fef08a');

  // Canvas Viewport transform (Pan & Zoom)
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });

  // History for Undo / Redo
  const [history, setHistory] = useState<WhiteboardData[]>([currentData]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Drawing state
  const isDrawingRef = useRef(false);
  const currentStrokeRef = useRef<{ x: number; y: number }[]>([]);
  const shapeStartRef = useRef<{ x: number; y: number } | null>(null);
  const [tempShape, setTempShape] = useState<WhiteboardShape | null>(null);

  // Connector state
  const connectorStartRef = useRef<{ x: number; y: number } | null>(null);
  const [tempConnector, setTempConnector] = useState<WhiteboardConnector | null>(null);

  // Dragging Sticky state
  const [draggingStickyId, setDraggingStickyId] = useState<string | null>(null);
  const dragStickyOffsetRef = useRef({ x: 0, y: 0 });

  const pushToHistory = useCallback((newData: WhiteboardData) => {
    setHistory(prev => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, newData];
    });
    setHistoryIndex(prev => prev + 1);
    onChange(newData);
  }, [historyIndex, onChange]);

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChange(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChange(next);
    }
  };

  // Redraw canvas
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Apply viewport transform (pan & zoom)
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw Subtle Grid background
    const gridSize = 32;
    const startX = -pan.x / zoom - ((-pan.x / zoom) % gridSize);
    const startY = -pan.y / zoom - ((-pan.y / zoom) % gridSize);
    const endX = startX + rect.width / zoom + gridSize;
    const endY = startY + rect.height / zoom + gridSize;

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1 / zoom;
    ctx.beginPath();
    for (let x = startX; x < endX; x += gridSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y < endY; y += gridSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // Render Strokes
    currentData.strokes.forEach(stroke => {
      if (stroke.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

    // Render active drawing stroke
    if (currentStrokeRef.current.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = activeColor;
      ctx.lineWidth = strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(currentStrokeRef.current[0].x, currentStrokeRef.current[0].y);
      for (let i = 1; i < currentStrokeRef.current.length; i++) {
        ctx.lineTo(currentStrokeRef.current[i].x, currentStrokeRef.current[i].y);
      }
      ctx.stroke();
    }

    // Render Shapes
    const allShapes = tempShape ? [...currentData.shapes, tempShape] : currentData.shapes;
    allShapes.forEach(shape => {
      ctx.beginPath();
      ctx.strokeStyle = shape.strokeColor;
      ctx.lineWidth = shape.strokeWidth;
      ctx.fillStyle = shape.fillColor || 'transparent';

      if (shape.type === 'rectangle') {
        ctx.roundRect(shape.x, shape.y, shape.width, shape.height, 6);
        if (shape.fillColor) ctx.fill();
        ctx.stroke();
      } else if (shape.type === 'circle') {
        const radiusX = Math.abs(shape.width / 2);
        const radiusY = Math.abs(shape.height / 2);
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        ctx.ellipse(centerX, centerY, Math.max(1, radiusX), Math.max(1, radiusY), 0, 0, Math.PI * 2);
        if (shape.fillColor) ctx.fill();
        ctx.stroke();
      } else if (shape.type === 'line' || shape.type === 'arrow') {
        const toX = shape.x + shape.width;
        const toY = shape.y + shape.height;
        ctx.moveTo(shape.x, shape.y);
        ctx.lineTo(toX, toY);
        ctx.stroke();

        if (shape.type === 'arrow') {
          const angle = Math.atan2(toY - shape.y, toX - shape.x);
          const headlen = 14;
          ctx.beginPath();
          ctx.moveTo(toX, toY);
          ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
          ctx.moveTo(toX, toY);
          ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
          ctx.stroke();
        }
      }
    });

    // Render Free Floating Texts
    currentData.texts.forEach(txt => {
      ctx.font = `${txt.fontSize || 16}px Inter, sans-serif`;
      ctx.fillStyle = txt.color || '#fff';
      ctx.fillText(txt.text, txt.x, txt.y);
    });

    // Render Connectors (Flow Arrows)
    const allConnectors = tempConnector ? [...(currentData.connectors || []), tempConnector] : (currentData.connectors || []);
    allConnectors.forEach(conn => {
      const { fromPoint, toPoint } = conn;
      ctx.save();
      ctx.strokeStyle = conn.color || '#38bdf8';
      ctx.lineWidth = conn.strokeWidth || 2.5;
      if (conn.style === 'dashed') ctx.setLineDash([8, 6]);
      else if (conn.style === 'dotted') ctx.setLineDash([3, 4]);

      // Calculate smooth Bezier curve
      const dx = toPoint.x - fromPoint.x;
      const dy = toPoint.y - fromPoint.y;
      const cp1x = fromPoint.x + dx * 0.5;
      const cp1y = fromPoint.y;
      const cp2x = fromPoint.x + dx * 0.5;
      const cp2y = toPoint.y;

      ctx.beginPath();
      ctx.moveTo(fromPoint.x, fromPoint.y);
      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, toPoint.x, toPoint.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Arrow at toPoint
      if (conn.endArrow !== false) {
        const angle = Math.atan2(toPoint.y - cp2y, toPoint.x - cp2x) || Math.atan2(dy, dx);
        const headlen = 12;
        ctx.fillStyle = conn.color || '#38bdf8';
        ctx.beginPath();
        ctx.moveTo(toPoint.x, toPoint.y);
        ctx.lineTo(toPoint.x - headlen * Math.cos(angle - Math.PI / 6), toPoint.y - headlen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toPoint.x - headlen * Math.cos(angle + Math.PI / 6), toPoint.y - headlen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      }

      // Draw Start Circle/Dot
      ctx.fillStyle = conn.color || '#38bdf8';
      ctx.beginPath();
      ctx.arc(fromPoint.x, fromPoint.y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Render Connector Label if present
      if (conn.label) {
        const midX = (fromPoint.x + toPoint.x) / 2;
        const midY = (fromPoint.y + toPoint.y) / 2;
        ctx.font = '12px Inter, sans-serif';
        const metrics = ctx.measureText(conn.label);
        const padX = 8;
        const padY = 4;
        ctx.fillStyle = 'rgba(19, 20, 31, 0.88)';
        ctx.strokeStyle = conn.color || '#38bdf8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(midX - metrics.width / 2 - padX, midY - 9 - padY, metrics.width + padX * 2, 18 + padY * 2, 4);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#eceef8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(conn.label, midX, midY);
        ctx.textAlign = 'start';
        ctx.textBaseline = 'alphabetic';
      }

      ctx.restore();
    });

    ctx.restore();
  }, [currentData, pan, zoom, activeColor, strokeWidth, tempShape, tempConnector]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  // Window resize observer
  useEffect(() => {
    const handleResize = () => renderCanvas();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [renderCanvas]);

  // Convert client mouse coord to canvas local world coord
  const getCanvasCoords = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = clientX - rect.left;
    const rawY = clientY - rect.top;
    return {
      x: (rawX - pan.x) / zoom,
      y: (rawY - pan.y) / zoom
    };
  };

  // Mouse / Pointer handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (readOnly) return;

    // Pan with middle mouse button or Spacebar
    if (e.button === 1 || e.shiftKey || activeTool === 'select' && e.altKey) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
      return;
    }

    const { x, y } = getCanvasCoords(e.clientX, e.clientY);

    if (activeTool === 'pen') {
      isDrawingRef.current = true;
      currentStrokeRef.current = [{ x, y }];
      renderCanvas();
    } else if (['rectangle', 'circle', 'arrow', 'line'].includes(activeTool)) {
      isDrawingRef.current = true;
      shapeStartRef.current = { x, y };
      setTempShape({
        id: `shape-${Date.now()}`,
        type: activeTool as 'rectangle' | 'circle' | 'arrow' | 'line',
        x,
        y,
        width: 0,
        height: 0,
        strokeColor: activeColor,
        strokeWidth: strokeWidth
      });
    } else if (activeTool === 'connector') {
      isDrawingRef.current = true;
      connectorStartRef.current = { x, y };
      setTempConnector({
        id: `conn-${Date.now()}`,
        fromPoint: { x, y },
        toPoint: { x, y },
        color: activeColor,
        strokeWidth: Math.max(2, strokeWidth),
        style: 'solid',
        endArrow: true,
        startArrow: false
      });
    } else if (activeTool === 'sticky') {
      const newSticky: WhiteboardSticky = {
        id: `sticky-${Date.now()}`,
        x: x - 90,
        y: y - 70,
        width: 190,
        height: 150,
        text: 'Nova anotação...',
        color: stickyColor
      };
      pushToHistory({
        ...currentData,
        stickies: [...currentData.stickies, newSticky]
      });
      setActiveTool('select');
    } else if (activeTool === 'text') {
      const input = prompt('Digite o texto a ser inserido no quadro:');
      if (input && input.trim()) {
        const newText: WhiteboardText = {
          id: `txt-${Date.now()}`,
          x,
          y,
          text: input.trim(),
          color: activeColor,
          fontSize: 18
        };
        pushToHistory({
          ...currentData,
          texts: [...currentData.texts, newText]
        });
      }
      setActiveTool('select');
    } else if (activeTool === 'eraser') {
      // Find nearest stroke or shape to erase
      const strokeRadius = 15;
      const filteredStrokes = currentData.strokes.filter(s => {
        return !s.points.some(p => Math.hypot(p.x - x, p.y - y) < strokeRadius);
      });
      const filteredShapes = currentData.shapes.filter(s => {
        return !(x >= s.x && x <= s.x + s.width && y >= s.y && y <= s.y + s.height);
      });
      const filteredTexts = currentData.texts.filter(t => Math.hypot(t.x - x, t.y - y) > 30);

      if (
        filteredStrokes.length !== currentData.strokes.length ||
        filteredShapes.length !== currentData.shapes.length ||
        filteredTexts.length !== currentData.texts.length
      ) {
        pushToHistory({
          ...currentData,
          strokes: filteredStrokes,
          shapes: filteredShapes,
          texts: filteredTexts
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y
      });
      return;
    }

    if (draggingStickyId) {
      const { x, y } = getCanvasCoords(e.clientX, e.clientY);
      const updated = currentData.stickies.map(s => {
        if (s.id === draggingStickyId) {
          return {
            ...s,
            x: x - dragStickyOffsetRef.current.x,
            y: y - dragStickyOffsetRef.current.y
          };
        }
        return s;
      });
      onChange({ ...currentData, stickies: updated });
      return;
    }

    if (!isDrawingRef.current) return;

    const { x, y } = getCanvasCoords(e.clientX, e.clientY);

    if (activeTool === 'pen') {
      currentStrokeRef.current.push({ x, y });
      renderCanvas();
    } else if (shapeStartRef.current && ['rectangle', 'circle', 'arrow', 'line'].includes(activeTool)) {
      setTempShape({
        id: tempShape?.id || `shape-${Date.now()}`,
        type: activeTool as 'rectangle' | 'circle' | 'arrow' | 'line',
        x: shapeStartRef.current.x,
        y: shapeStartRef.current.y,
        width: x - shapeStartRef.current.x,
        height: y - shapeStartRef.current.y,
        strokeColor: activeColor,
        strokeWidth: strokeWidth
      });
    } else if (connectorStartRef.current && activeTool === 'connector') {
      setTempConnector({
        id: tempConnector?.id || `conn-${Date.now()}`,
        fromPoint: connectorStartRef.current,
        toPoint: { x, y },
        color: activeColor,
        strokeWidth: Math.max(2, strokeWidth),
        style: 'solid',
        endArrow: true,
        startArrow: false
      });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (draggingStickyId) {
      setDraggingStickyId(null);
      pushToHistory(currentData);
      return;
    }

    if (isDrawingRef.current) {
      isDrawingRef.current = false;

      if (activeTool === 'pen' && currentStrokeRef.current.length > 1) {
        const newStroke: WhiteboardStroke = {
          id: `stroke-${Date.now()}`,
          points: currentStrokeRef.current,
          color: activeColor,
          width: strokeWidth
        };
        currentStrokeRef.current = [];
        pushToHistory({
          ...currentData,
          strokes: [...currentData.strokes, newStroke]
        });
      } else if (tempShape && (Math.abs(tempShape.width) > 4 || Math.abs(tempShape.height) > 4)) {
        pushToHistory({
          ...currentData,
          shapes: [...currentData.shapes, tempShape]
        });
        setTempShape(null);
        shapeStartRef.current = null;
      } else if (tempConnector && connectorStartRef.current) {
        const dist = Math.hypot(tempConnector.toPoint.x - tempConnector.fromPoint.x, tempConnector.toPoint.y - tempConnector.fromPoint.y);
        if (dist > 15) {
          pushToHistory({
            ...currentData,
            connectors: [...(currentData.connectors || []), tempConnector]
          });
        }
        setTempConnector(null);
        connectorStartRef.current = null;
      } else {
        setTempShape(null);
        shapeStartRef.current = null;
        setTempConnector(null);
        connectorStartRef.current = null;
      }
    }
  };

  // Touch event handlers for mobile & tablet support
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleMouseDown({
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0,
        shiftKey: false,
        altKey: false
      } as unknown as React.MouseEvent);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      handleMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY
      } as unknown as React.MouseEvent);
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

  // Zoom handlers
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
      setZoom(z => Math.min(3, Math.max(0.3, z * zoomFactor)));
    } else {
      // Normal scroll pans canvas
      setPan(p => ({
        x: p.x - e.deltaX,
        y: p.y - e.deltaY
      }));
    }
  };

  // Clear Canvas
  const handleClear = () => {
    if (confirm('Deseja limpar todo o quadro branco?')) {
      pushToHistory({
        strokes: [],
        shapes: [],
        stickies: [],
        texts: []
      });
    }
  };

  // Export as PNG
  const handleExportPng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `quadro_miro_${new Date().toISOString().slice(0, 10)}.png`;
    a.click();
  };

  // Sticky Note handlers
  const handleUpdateStickyText = (id: string, text: string) => {
    const updated = currentData.stickies.map(s => s.id === id ? { ...s, text } : s);
    pushToHistory({ ...currentData, stickies: updated });
  };

  const handleDeleteSticky = (id: string) => {
    const updated = currentData.stickies.filter(s => s.id !== id);
    pushToHistory({ ...currentData, stickies: updated });
  };

  return (
    <div
      ref={containerRef}
      className="miro-whiteboard-container"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
      style={{
        position: 'relative',
        width: '100%',
        height: 'calc(100vh - 190px)',
        minHeight: '520px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        cursor: isPanning ? 'grabbing' : activeTool === 'pen' ? 'crosshair' : 'default'
      }}
    >
      {/* HTML5 Canvas for Strokes, Shapes & Grid */}
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      />

      {/* Interactive Sticky Notes (DOM Elements overlayed on canvas with pan & zoom) */}
      <div
        className="whiteboard-dom-layer"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0'
        }}
      >
        {currentData.stickies.map(sticky => (
          <div
            key={sticky.id}
            className="whiteboard-sticky-note"
            style={{
              position: 'absolute',
              left: `${sticky.x}px`,
              top: `${sticky.y}px`,
              width: `${sticky.width}px`,
              minHeight: `${sticky.height}px`,
              backgroundColor: sticky.color,
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
              padding: '10px 12px',
              pointerEvents: 'auto',
              display: 'flex',
              flexDirection: 'column',
              cursor: activeTool === 'select' ? 'move' : 'default',
              userSelect: 'none',
              transition: 'box-shadow 0.15s ease',
              border: '1px solid rgba(0,0,0,0.1)'
            }}
            onMouseDown={(e) => {
              if (activeTool === 'select') {
                e.stopPropagation();
                setDraggingStickyId(sticky.id);
                const { x, y } = getCanvasCoords(e.clientX, e.clientY);
                dragStickyOffsetRef.current = { x: x - sticky.x, y: y - sticky.y };
              }
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                {STICKY_COLORS.map(c => (
                  <button
                    key={c.bg}
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: c.bg,
                      border: sticky.color === c.bg ? '1.5px solid #000' : 'none',
                      cursor: 'pointer',
                      padding: 0
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const updated = currentData.stickies.map(s => s.id === sticky.id ? { ...s, color: c.bg } : s);
                      pushToHistory({ ...currentData, stickies: updated });
                    }}
                  />
                ))}
              </div>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'rgba(0,0,0,0.4)',
                  cursor: 'pointer',
                  padding: '2px'
                }}
                title="Excluir nota"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteSticky(sticky.id);
                }}
              >
                <Trash2 size={13} />
              </button>
            </div>

            <textarea
              className="sticky-note-textarea"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                resize: 'none',
                color: '#1e293b',
                fontFamily: 'Inter, sans-serif',
                fontSize: '13.5px',
                lineHeight: 1.4,
                width: '100%',
                fontWeight: 500
              }}
              value={sticky.text}
              placeholder="Escreva sua ideia aqui..."
              onChange={(e) => handleUpdateStickyText(sticky.id, e.target.value)}
              onMouseDown={(e) => e.stopPropagation()}
            />
          </div>
        ))}
      </div>

      {/* Floating Miro-Style Primary Toolbar (Top Center) */}
      <div
        className="whiteboard-toolbar-main"
        style={{
          position: 'absolute',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 12px',
          boxShadow: 'var(--shadow-lg)',
          backdropFilter: 'blur(12px)',
          zIndex: 40
        }}
      >
        <button
          className={`sidebar-btn-icon ${activeTool === 'select' ? 'active' : ''}`}
          style={{
            background: activeTool === 'select' ? 'var(--accent)' : 'transparent',
            color: activeTool === 'select' ? '#fff' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            width: '34px',
            height: '34px'
          }}
          title="Selecionar / Mover (V)"
          onClick={() => setActiveTool('select')}
        >
          <MousePointer size={16} />
        </button>

        <button
          className={`sidebar-btn-icon ${activeTool === 'pen' ? 'active' : ''}`}
          style={{
            background: activeTool === 'pen' ? 'var(--accent)' : 'transparent',
            color: activeTool === 'pen' ? '#fff' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            width: '34px',
            height: '34px'
          }}
          title="Caneta de Desenho Livre (P)"
          onClick={() => setActiveTool('pen')}
        >
          <Pen size={16} />
        </button>

        <button
          className={`sidebar-btn-icon ${activeTool === 'eraser' ? 'active' : ''}`}
          style={{
            background: activeTool === 'eraser' ? 'var(--accent)' : 'transparent',
            color: activeTool === 'eraser' ? '#fff' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            width: '34px',
            height: '34px'
          }}
          title="Borracha (E)"
          onClick={() => setActiveTool('eraser')}
        >
          <Eraser size={16} />
        </button>

        <div style={{ width: '1px', height: '22px', background: 'var(--border-color)', margin: '0 4px' }} />

        {/* Shapes */}
        <button
          className={`sidebar-btn-icon ${activeTool === 'rectangle' ? 'active' : ''}`}
          style={{
            background: activeTool === 'rectangle' ? 'var(--accent)' : 'transparent',
            color: activeTool === 'rectangle' ? '#fff' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            width: '34px',
            height: '34px'
          }}
          title="Retângulo"
          onClick={() => setActiveTool('rectangle')}
        >
          <Square size={16} />
        </button>

        <button
          className={`sidebar-btn-icon ${activeTool === 'circle' ? 'active' : ''}`}
          style={{
            background: activeTool === 'circle' ? 'var(--accent)' : 'transparent',
            color: activeTool === 'circle' ? '#fff' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            width: '34px',
            height: '34px'
          }}
          title="Círculo"
          onClick={() => setActiveTool('circle')}
        >
          <Circle size={16} />
        </button>

        <button
          className={`sidebar-btn-icon ${activeTool === 'arrow' ? 'active' : ''}`}
          style={{
            background: activeTool === 'arrow' ? 'var(--accent)' : 'transparent',
            color: activeTool === 'arrow' ? '#fff' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            width: '34px',
            height: '34px'
          }}
          title="Seta Direcional"
          onClick={() => setActiveTool('arrow')}
        >
          <ArrowUpRight size={16} />
        </button>

        <button
          className={`sidebar-btn-icon ${activeTool === 'line' ? 'active' : ''}`}
          style={{
            background: activeTool === 'line' ? 'var(--accent)' : 'transparent',
            color: activeTool === 'line' ? '#fff' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            width: '34px',
            height: '34px'
          }}
          title="Linha Reta"
          onClick={() => setActiveTool('line')}
        >
          <Minus size={16} />
        </button>

        {/* Flow Connector Tool */}
        <button
          className={`sidebar-btn-icon ${activeTool === 'connector' ? 'active' : ''}`}
          style={{
            background: activeTool === 'connector' ? 'var(--accent)' : 'transparent',
            color: activeTool === 'connector' ? '#fff' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            width: '34px',
            height: '34px'
          }}
          title="Conector de Blocos / Fluxo (Arraste entre formas)"
          onClick={() => setActiveTool('connector')}
        >
          <Workflow size={16} />
        </button>

        <div style={{ width: '1px', height: '22px', background: 'var(--border-color)', margin: '0 4px' }} />

        {/* Post-it / Sticky Note */}
        <button
          className={`sidebar-btn-icon ${activeTool === 'sticky' ? 'active' : ''}`}
          style={{
            background: activeTool === 'sticky' ? 'var(--accent)' : 'transparent',
            color: activeTool === 'sticky' ? '#fff' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            width: '34px',
            height: '34px'
          }}
          title="Post-it / Nota Adesiva (N)"
          onClick={() => setActiveTool('sticky')}
        >
          <StickyNote size={16} />
        </button>

        {/* Text Tool */}
        <button
          className={`sidebar-btn-icon ${activeTool === 'text' ? 'active' : ''}`}
          style={{
            background: activeTool === 'text' ? 'var(--accent)' : 'transparent',
            color: activeTool === 'text' ? '#fff' : 'var(--text-secondary)',
            borderRadius: 'var(--radius-full)',
            width: '34px',
            height: '34px'
          }}
          title="Texto Livre (T)"
          onClick={() => setActiveTool('text')}
        >
          <Type size={16} />
        </button>
      </div>

      {/* Floating Style Palette (Left Side) */}
      <div
        className="whiteboard-toolbar-palette"
        style={{
          position: 'absolute',
          top: '80px',
          left: '16px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '10px 8px',
          boxShadow: 'var(--shadow-md)',
          backdropFilter: 'blur(12px)',
          zIndex: 40
        }}
      >
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
          Cores
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
          {COLOR_PALETTE.map(color => (
            <button
              key={color}
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: color,
                border: activeColor === color ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.1)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0
              }}
              title={color}
              onClick={() => setActiveColor(color)}
            >
              {activeColor === color && (
                <Check size={10} color={color === '#ffffff' ? '#000' : '#fff'} />
              )}
            </button>
          ))}
        </div>

        <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
          Traço
        </span>

        <div style={{ display: 'flex', gap: '4px' }}>
          {[2, 4, 8].map(w => (
            <button
              key={w}
              style={{
                width: '22px',
                height: '22px',
                borderRadius: '4px',
                background: strokeWidth === w ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: strokeWidth === w ? '#fff' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setStrokeWidth(w)}
            >
              {w === 2 ? 'F' : w === 4 ? 'M' : 'G'}
            </button>
          ))}
        </div>

        <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', margin: '4px 0' }} />

        <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
          Post-it
        </span>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
          {STICKY_COLORS.map(c => (
            <button
              key={c.bg}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: c.bg,
                border: stickyColor === c.bg ? '2px solid var(--accent)' : '1px solid rgba(0,0,0,0.1)',
                cursor: 'pointer',
                padding: 0
              }}
              title={c.name}
              onClick={() => {
                setStickyColor(c.bg);
                setActiveTool('sticky');
              }}
            />
          ))}
        </div>
      </div>

      {/* Floating Bottom Navigation & Utility Bar */}
      <div
        className="whiteboard-utility-bar"
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-full)',
          padding: '6px 14px',
          boxShadow: 'var(--shadow-md)',
          backdropFilter: 'blur(12px)',
          zIndex: 40
        }}
      >
        <button
          className="sidebar-btn-icon"
          title="Desfazer (Ctrl+Z)"
          disabled={historyIndex <= 0}
          style={{ opacity: historyIndex <= 0 ? 0.4 : 1 }}
          onClick={handleUndo}
        >
          <Undo2 size={15} />
        </button>

        <button
          className="sidebar-btn-icon"
          title="Refazer (Ctrl+Y)"
          disabled={historyIndex >= history.length - 1}
          style={{ opacity: historyIndex >= history.length - 1 ? 0.4 : 1 }}
          onClick={handleRedo}
        >
          <Redo2 size={15} />
        </button>

        <div style={{ width: '1px', height: '18px', background: 'var(--border-color)', margin: '0 4px' }} />

        <button
          className="sidebar-btn-icon"
          title="Diminuir Zoom"
          onClick={() => setZoom(z => Math.max(0.3, z * 0.85))}
        >
          <ZoomOut size={15} />
        </button>

        <span style={{ fontSize: '12px', fontWeight: 600, minWidth: '42px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          {Math.round(zoom * 100)}%
        </span>

        <button
          className="sidebar-btn-icon"
          title="Aumentar Zoom"
          onClick={() => setZoom(z => Math.min(3, z * 1.15))}
        >
          <ZoomIn size={15} />
        </button>

        <button
          className="sidebar-btn-icon"
          title="Resetar Vista (100%)"
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
        >
          <RotateCcw size={14} />
        </button>
      </div>

      {/* Floating Bottom Right Actions (Download, Clear) */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 40
        }}
      >
        <button
          className="nav-btn"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
            backdropFilter: 'blur(12px)',
            color: 'var(--text-primary)'
          }}
          title="Exportar Quadro como PNG"
          onClick={handleExportPng}
        >
          <Download size={14} />
          <span>Exportar PNG</span>
        </button>

        <button
          className="nav-btn"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-md)',
            backdropFilter: 'blur(12px)',
            color: '#ef4444'
          }}
          title="Limpar Todo o Quadro"
          onClick={handleClear}
        >
          <Trash2 size={14} />
          <span>Limpar</span>
        </button>
      </div>
    </div>
  );
};
