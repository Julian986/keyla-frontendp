import React, { useState } from "react";
import Cropper from "react-easy-crop";
import { Point, Area } from "react-easy-crop/types";
import { MdCropRotate } from "react-icons/md";
import "./imageRotator.css" // Estilos para el componente


interface ImageRotatorProps {
  image: string; // URL de la imagen
  onSave: (croppedImage: string) => void; // Función para guardar la imagen rotada
  onCancel: () => void; // Función para cancelar
}

const ImageRotator = ({ image, onSave, onCancel }: ImageRotatorProps) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const handleRotate = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };

  // Función para manejar el guardado de la imagen rotada
  const handleSave = async () => {
    const croppedImage = await getCroppedImage(image, rotation);
    onSave(croppedImage);
  };

  return (
    <div className="rotator-container">
      <div className="crop-container">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={4 / 3} // Relación de aspecto (puedes ajustarla)
          onCropChange={setCrop}
          onZoomChange={setZoom}
        />
      </div>
      <div className="controls">
        <button onClick={handleRotate} className="rotate-button losButtonsDelRotator">
        <MdCropRotate /> Rotar 90
        </button>
        <button onClick={handleSave} className="losButtonsDelRotator">Aceptar</button>
        <button onClick={onCancel} className="losButtonsDelRotator">Cancelar</button>
      </div>
    </div>
  );
};

// Función para obtener la imagen rotada y recortada
const getCroppedImage = async (imageSrc: string, rotation: number): Promise<string> => {
  const image = new Image();
  image.src = imageSrc;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No se pudo crear el contexto del canvas");
  }

  // Ajustar el tamaño del canvas según la rotación
  if (rotation === 90 || rotation === 270) {
    canvas.width = image.height;
    canvas.height = image.width;
  } else {
    canvas.width = image.width;
    canvas.height = image.height;
  }

  // Rotar la imagen
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);

  // Convertir el canvas a una URL de imagen
  return canvas.toDataURL("image/png");
};

export default ImageRotator;