import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import './CameraComponent.scss'; // Importa el archivo SCSS
import { IoRadioButtonOn } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';
import cv from '@techstark/opencv-js';

const mountainIcon = (
	<svg width='22' height='12' viewBox='0 0 22 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M12.8658 0.398438L9.36576 5.0651L12.0258 8.61177L10.5324 9.73177C8.95509 7.63177 6.33242 4.13177 6.33242 4.13177L0.732422 11.5984H21.2658L12.8658 0.398438Z'
			fill='white'
		/>
	</svg>
);

const CameraComponent = () => {
	const canvasRef = useRef(null);
	const { id } = useParams();
	const navigate = useNavigate();
	const webcamRef = useRef(null);
	const [images, setImages] = useState(JSON.parse(localStorage.getItem('capturedImages')) || []);
	const [imageCounter, setImageCounter] = useState(0);

	console.log('images', images);

	const videoConstraints = {
		facingMode: 'environment',
	};

	useEffect(() => {
		localStorage.setItem('capturedImages', JSON.stringify(images));
	}, [images]);

	// const capture = () => {
	// 	const imageSrc = webcamRef.current.getScreenshot();
	// 	setImages([...images, imageSrc]);
	// 	setImageCounter(images.length + 1);
	// 	console.log(processImage(imageSrc));
	// };

	const captureAndProcessImage = () => {
		const imageSrc = webcamRef.current.getScreenshot();
	
		if (imageSrc) {
			const img = new Image();
			img.src = imageSrc;
	
			img.onload = () => {
				const canvas = canvasRef.current;
				const ctx = canvas.getContext('2d');
				canvas.width = img.width;
				canvas.height = img.height;
				ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	
				const src = cv.imread(canvas);
				const gray = new cv.Mat();
				const blurred = new cv.Mat();
				const edges = new cv.Mat();
				const morphed = new cv.Mat();
	
				try {
					// Convertir a escala de grises
					cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY, 0);
	
					// Aplicar un filtro de mediana para reducir el ruido
					cv.medianBlur(gray, blurred, 5);
	
					// Aplicar umbral adaptativo
					cv.adaptiveThreshold(
						blurred,
						edges,
						255,
						cv.ADAPTIVE_THRESH_GAUSSIAN_C,
						cv.THRESH_BINARY_INV, // Invertir los colores para resaltar los bordes internos
						11,
						2
					);
	
					// Aplicar operaciones morfológicas para cerrar brechas
					const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
					cv.morphologyEx(edges, morphed, cv.MORPH_CLOSE, kernel);
	
					// Encontrar contornos
					const contours = new cv.MatVector();
					const hierarchy = new cv.Mat();
					cv.findContours(morphed, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
	
					// Dibujar todos los contornos encontrados en el canvas
					for (let i = 0; i < contours.size(); i++) {
						const color = new cv.Scalar(255, 0, 0); // Color azul para los contornos
						cv.drawContours(src, contours, i, color, 2, cv.LINE_8, hierarchy, 100);
					}
	
					// Mostrar el resultado en el canvas
					cv.imshow(canvas, src);
	
					// Preparar para la detección de un documento (opcional)
					let maxArea = 0;
					let maxContour = null;
					for (let i = 0; i < contours.size(); i++) {
						const contour = contours.get(i);
						const area = cv.contourArea(contour);
						if (area > maxArea) {
							maxArea = area;
							maxContour = contour;
						}
					}					
	
					if (maxContour) {
						const approx = new cv.Mat();
						const perimeter = cv.arcLength(maxContour, true);
						cv.approxPolyDP(maxContour, approx, 0.02 * perimeter, true);

						console.log('approx',approx.rows);
						
	
						if (approx.rows === 4) {
							const points = [];
							for (let i = 0; i < 4; i++) {
								points.push({ x: approx.data32S[i * 2], y: approx.data32S[i * 2 + 1] });
							}
	
							console.log('Puntos encontrados:', points);
	
							// Aquí podrías realizar la transformación de perspectiva si los puntos encontrados son satisfactorios.
						}
	
						approx.delete();
					}
	
					// Liberar la memoria
					contours.delete();
					hierarchy.delete();
				} finally {
					// Liberar la memoria de los objetos Mat
					src.delete();
					gray.delete();
					blurred.delete();
					edges.delete();
					morphed.delete();
				}
			};
		}
	};

	return (
		<div className='container'>
			<div className='camera-controlls-backgroud-top'></div>
			<div className='page-counter'>{`Página ${imageCounter}`}</div>
			<Webcam audio={false} ref={webcamRef} screenshotFormat='image/jpeg' className='webcam' videoConstraints={videoConstraints} />
			<div className='camera-controlls-backgroud'></div>
			<div className='gallery-image' onClick={() => navigate('/gallery/' + id)}>
				{images.length === 0 ? <div className='icon-div'>{mountainIcon}</div> : <img src={images[images.length - 1]} />}
			</div>
			<div className='captureButton'>
				<IoRadioButtonOn onClick={captureAndProcessImage} />
			</div>
			<canvas ref={canvasRef} style={{ marginTop: 10 }} />
			<div className='counter-div'>{imageCounter < 10 ? `0${imageCounter}` : imageCounter}</div>
		</div>
	);
};

export default CameraComponent;
