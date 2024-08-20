import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import './CameraComponent.scss'; // Importa el archivo SCSS
import { IoRadioButtonOn } from 'react-icons/io5';
import { useNavigate, useParams } from 'react-router-dom';

const mountainIcon = (
	<svg width='22' height='12' viewBox='0 0 22 12' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<path
			d='M12.8658 0.398438L9.36576 5.0651L12.0258 8.61177L10.5324 9.73177C8.95509 7.63177 6.33242 4.13177 6.33242 4.13177L0.732422 11.5984H21.2658L12.8658 0.398438Z'
			fill='white'
		/>
	</svg>
);

const CameraComponent = () => {
    const {id} = useParams();
    const navigate = useNavigate();
	const webcamRef = useRef(null);
	const [images, setImages] = useState(JSON.parse(localStorage.getItem('capturedImages')) || []);
	const [imageCounter, setImageCounter] = useState(0);
	const [deviceId, setDeviceId] = useState('');

	const videoConstraints = {
		facingMode: "environment"
	  };	

	useEffect(() => {
		localStorage.setItem('capturedImages', JSON.stringify(images));
	}, [images]);

	const capture = () => {
		const imageSrc = webcamRef.current.getScreenshot();
		setImages([...images, imageSrc]);
		setImageCounter(images.length + 1);
		console.log(processImage(imageSrc));
	};

    const processImage = async (imgSrc) => {
        const picaInstance = pica();
      
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        
        const imageElement = document.createElement('img');
        imageElement.setAttribute('src', `${imgSrc}`)
        console.log('element',imageElement);
        

        canvas.width = imageElement.width;
        canvas.height = imageElement.height;
      
        context.drawImage(imageElement, 0, 0);
      
        const outputCanvas = document.createElement('canvas');
        outputCanvas.width = 200; // Define el tamaño del recorte
        outputCanvas.height = 200;
      
        await picaInstance.resize(canvas, outputCanvas);
        
        return outputCanvas.toDataURL();
      };

	return (
		<div className='container'>
			<div className='camera-controlls-backgroud-top'></div>
			<div className='page-counter'>{`Página ${imageCounter}`}</div>
			<Webcam audio={false} ref={webcamRef} screenshotFormat='image/jpeg' className='webcam' videoConstraints={videoConstraints}/>
			<div className='camera-controlls-backgroud'></div>
			<div className='gallery-image' onClick={()=>navigate('/gallery/' + id)}>
				{images.length === 0 ? <div className='icon-div'>{mountainIcon}</div> : <img src={images[images.length - 1]} />}
			</div>
			<div className='captureButton'>
				<IoRadioButtonOn onClick={capture} />
			</div>
			<div className='counter-div'>{imageCounter < 10 ? `0${imageCounter}` : imageCounter}</div>
		</div>
	);
};

export default CameraComponent;
