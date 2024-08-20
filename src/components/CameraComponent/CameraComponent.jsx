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

function getDeviceInfo() {
	const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  
	// Detectar iOS
	const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
  
	// Detectar Android
	const isAndroid = /android/i.test(userAgent);
  
	// Detectar Safari
	const isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
  
	// Detectar Chrome
	const isChrome = /chrome|chromium|crios/i.test(userAgent) && !isSafari;
  
	return {
	  isIOS,
	  isAndroid,
	  isSafari,
	  isChrome,
	};
  }

const CameraComponent = () => {
	const deviceInfo = getDeviceInfo();
	
	const { id } = useParams();
	const navigate = useNavigate();
	const webcamRef = useRef(null);
	const [images, setImages] = useState(JSON.parse(localStorage.getItem('capturedImages')) || []);
	const [dimensions, setDimensions] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});
	const [imageCounter, setImageCounter] = useState(0);

	console.log('images', images);
	console.log('dimensions',dimensions);

	useEffect(() => {
		const handleResize = () => {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		};

		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		localStorage.setItem('capturedImages', JSON.stringify(images));
	}, [images]);

	const videoConstraints = {
		width: dimensions.innerWidth,
		height: dimensions.innerHeight,
		facingMode: 'environment',
	};

	

	const capture = () => {
		if (webcamRef.current) {
		  const video = webcamRef.current.video;
		  const videoWidth = video.videoWidth;
		  const videoHeight = video.videoHeight;
	
		  // Crear un canvas con las dimensiones del contenedor
		  const canvas = document.createElement('canvas');
		  const context = canvas.getContext('2d');
	
		  // Configura el canvas para tener el mismo tamaño que el contenedor del video
		  canvas.width = dimensions.width;
		  canvas.height = dimensions.height;
	
		  // Calcula el recorte necesario para el canvas
		  const aspectRatio = videoWidth / videoHeight;
		  const containerAspectRatio = dimensions.width / dimensions.height;
	
		  let drawWidth, drawHeight;
		  let offsetX = 0, offsetY = 0;
	
		  if (containerAspectRatio > aspectRatio) {
			drawWidth = videoWidth;
			drawHeight = videoWidth / containerAspectRatio;
			offsetY = (videoHeight - drawHeight) / 2;
		  } else {
			drawHeight = videoHeight;
			drawWidth = videoHeight * containerAspectRatio;
			offsetX = (videoWidth - drawWidth) / 2;
		  }
	
		  // Dibujar el video en el canvas con el recorte aplicado
		  context.drawImage(video, offsetX, offsetY, drawWidth, drawHeight, 0, 0, canvas.width, canvas.height);
	
		  // Obtener la imagen en base64 del canvas
		  const imageSrc = canvas.toDataURL('image/jpeg');
		  setImages([...images, imageSrc]);
		  setImageCounter(images.length + 1);
		}
	  };

	return (
		<div className='container'>
			<div className='camera-controlls-backgroud-top'></div>
			<div className='page-counter'>{`Página ${imageCounter}`}</div>
			<div style={{ width: dimensions.width, height: dimensions.height, overflow: 'hidden' }}>
				<Webcam
					ref={webcamRef}
					audio={false}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
					}}
					videoConstraints={videoConstraints}
				/>
			</div>
			<div className='camera-controlls-backgroud'></div>
			<div className='capture-controlls'>
				<div className='gallery-image' onClick={() => navigate('/gallery/' + id)}>
					{images.length === 0 ? <div className='icon-div'>{mountainIcon}</div> : <img src={images[images.length - 1]} />}
				</div>
				<div className='captureButton'>
					<IoRadioButtonOn onClick={capture} />
				</div>
				<div className='counter-div'>{imageCounter < 10 ? `0${imageCounter}` : imageCounter}</div>
			</div>
		</div>
	);
};

export default CameraComponent;
