import React, { useState, useRef, useCallback, useEffect } from 'react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onSave: (croppedImage: string) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageCropModal({ isOpen, imageSrc, onSave, onCancel }: ImageCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  const CROP_SIZE = 300; // Fixed crop circle size

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setZoom(1);
      setPosition({ x: 0, y: 0 });
      setImageLoaded(false);
      setIsDragging(false);
    }
  }, [isOpen]);

  // Handle image load
  const handleImageLoad = useCallback(() => {
    if (!imageRef.current || !containerRef.current) return;

    const img = imageRef.current;

    // Calculate initial zoom to ensure image covers the crop circle
    const minZoom = Math.max(
      CROP_SIZE / img.naturalWidth,
      CROP_SIZE / img.naturalHeight
    );

    // Start with a zoom that ensures the image covers the crop area
    const initialZoom = Math.max(minZoom * 1.1, 1);
    setZoom(initialZoom);

    // Center the image
    setPosition({ x: 0, y: 0 });
    setImageLoaded(true);
  }, []);

  // Handle mouse down for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  }, [position]);

  // Handle mouse move for dragging
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !imageRef.current || !containerRef.current) return;

    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;

    // Calculate bounds to keep image within reasonable limits
    const img = imageRef.current;
    const scaledWidth = img.naturalWidth * zoom;
    const scaledHeight = img.naturalHeight * zoom;
    
    const maxX = Math.max(0, (scaledWidth - CROP_SIZE) / 2);
    const maxY = Math.max(0, (scaledHeight - CROP_SIZE) / 2);
    
    const boundedX = Math.max(-maxX, Math.min(maxX, newX));
    const boundedY = Math.max(-maxY, Math.min(maxY, newY));

    setPosition({ x: boundedX, y: boundedY });
  }, [isDragging, dragStart, zoom]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle zoom change
  const handleZoomChange = useCallback((newZoom: number) => {
    if (!imageRef.current) return;
    
    const img = imageRef.current;
    const minZoom = Math.max(
      CROP_SIZE / img.naturalWidth,
      CROP_SIZE / img.naturalHeight
    );
    
    setZoom(Math.max(minZoom, Math.min(3, newZoom)));
  }, []);

  // Generate cropped image
  const handleSave = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;

    // Set canvas size to crop size
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;

    // Calculate source coordinates
    const scaledWidth = img.naturalWidth * zoom;
    const scaledHeight = img.naturalHeight * zoom;
    
    // Create circular clipping path
    ctx.beginPath();
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();

    // Calculate source area based on current view
    const centerX = img.naturalWidth / 2;
    const centerY = img.naturalHeight / 2;

    // Calculate what portion of the original image is visible in the crop circle
    const sourceRadius = (CROP_SIZE / 2) / zoom;
    const sourceX = centerX - position.x / zoom - sourceRadius;
    const sourceY = centerY - position.y / zoom - sourceRadius;
    const sourceSize = sourceRadius * 2;

    // Draw the cropped image
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      CROP_SIZE,
      CROP_SIZE
    );

    // Convert to base64 and save
    const croppedImageData = canvas.toDataURL('image/jpeg', 0.9);
    onSave(croppedImageData);
  }, [zoom, position, onSave]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Crop Profile Picture</h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative mb-6">
          <div 
            ref={containerRef}
            className="relative mx-auto bg-gray-100 overflow-hidden"
            style={{ 
              width: CROP_SIZE, 
              height: CROP_SIZE,
              borderRadius: '50%'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* Image */}
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              className="absolute cursor-move select-none"
              style={{
                transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${zoom})`,
                transformOrigin: 'center center',
                left: '50%',
                top: '50%',
                maxWidth: 'none',
                maxHeight: 'none'
              }}
              onLoad={handleImageLoad}
              onMouseDown={handleMouseDown}
              draggable={false}
            />

            {/* Overlay to show crop boundary */}
            <div 
              className="absolute inset-0 border-4 border-white pointer-events-none"
              style={{ borderRadius: '50%' }}
            />
          </div>

          {/* Instructions */}
          <p className="text-sm text-gray-500 text-center mt-2">
            Drag to reposition • Use zoom to resize
          </p>
        </div>

        {/* Zoom Control */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zoom
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleZoomChange(zoom - 0.1)}
              className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-sm font-bold"
            >
              −
            </button>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={zoom}
              onChange={(e) => handleZoomChange(parseFloat(e.target.value))}
              className="flex-1"
            />
            <button
              onClick={() => handleZoomChange(zoom + 0.1)}
              className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-full text-sm font-bold"
            >
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!imageLoaded}
            className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
          >
            Save
          </button>
        </div>

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}
