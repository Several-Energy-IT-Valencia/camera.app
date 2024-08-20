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

				// Convertir la imagen del canvas a un Mat de OpenCV
				const src = cv.imread(canvas);
				const dst = new cv.Mat();

				// Convertir la imagen a escala de grises
				cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);

				// Aplicar desenfoque gaussiano para reducir el ruido
				cv.GaussianBlur(dst, dst, new cv.Size(5, 5), 0);

				// Aplicar detección de bordes de Canny
				cv.Canny(dst, dst, 50, 150, 3, false);

				// Encontrar contornos
				const contours = new cv.MatVector();
				const hierarchy = new cv.Mat();
				cv.findContours(dst, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
				console.log('contours', contours);

				let filteredContours = [];
				for (let i = 0; i < contours.size(); i++) {
					const contour = contours.get(i);
					const approx = new cv.Mat();
					const perimeter = cv.arcLength(contour, true);
					cv.approxPolyDP(contour, approx, 0.02 * perimeter, true);

					if (approx.rows === 4) {
						filteredContours.push(contour);
					}
					approx.delete(); // Eliminar `approx` después de usarlo
				}

				for (let i = 0; i < filteredContours.size(); i++) {
					const color = new cv.Scalar(255, 0, 0); // Color azul para los contornos
					cv.drawContours(src, filteredContours, i, color, 2, cv.LINE_8, hierarchy, 100);
				  }
				
				console.log('filtered',filteredContours);
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
				console.log('maxcontour', maxContour);
				console.log('maxArea', maxArea);
				if (maxContour) {
					console.log('hola');
					const approx = new cv.Mat();
					const perimeter = cv.arcLength(maxContour, true);
					const epsilon = 0.08 * perimeter;
					cv.approxPolyDP(maxContour, approx, epsilon, true);
					console.log('aprox', approx);
					if (approx.rows === 4) {
						const points = [];
						for (let i = 0; i < 4; i++) {
							points.push({ x: approx.data32S[i * 2], y: approx.data32S[i * 2 + 1] });
						}
						console.log('points', points);
						
						// Ordenar puntos
						points.sort((a, b) => a.x - b.x);
						const topLeft = points[0].y < points[1].y ? points[0] : points[1];
						const bottomLeft = points[0].y > points[1].y ? points[0] : points[1];
						const topRight = points[2].y < points[3].y ? points[2] : points[3];
						const bottomRight = points[2].y > points[3].y ? points[2] : points[3];

						const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
							topLeft.x,
							topLeft.y,
							topRight.x,
							topRight.y,
							bottomRight.x,
							bottomRight.y,
							bottomLeft.x,
							bottomLeft.y,
						]);

						const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [0, 0, canvas.width - 1, 0, canvas.width - 1, canvas.height - 1, 0, canvas.height - 1]);

						const M = cv.getPerspectiveTransform(srcTri, dstTri);
						const dst = new cv.Mat();
						cv.warpPerspective(srcTri, dstTri, M, new cv.Size(canvas.width, canvas.height));

						const croppedImageDataURL = canvas.toDataURL('image/jpeg');
						setImages([...images, croppedImageDataURL]);
						M.delete();
						dst.delete();
						srcTri.delete();
						dstTri.delete();
						console.log('Se detectó un contorno de 4 puntos. Cantidad de puntos:', approx.rows);
					} else {
						console.log('No se detectó un contorno de 4 puntos. Cantidad de puntos:', approx.rows);
					}
					approx.delete();
				}
				contours.delete();
				hierarchy.delete();

				// Mostrar el resultado en el canvas
				cv.imshow(canvas, src);
				// Liberar la memoria
				src.delete();
				dst.delete();
				contours.delete();
				hierarchy.delete();
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
