import React, { useState } from 'react';
import './GalleryComponent.scss';
import { FaArrowLeft } from 'react-icons/fa';
import { FaRegTrashAlt } from 'react-icons/fa';
import { useParams, useNavigate } from 'react-router-dom';

const tickButton = (
	<svg width='18' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'>
		<rect width='10' height='10' fill='white' fill-opacity='0.01' />
		<path d='M8.125 15.0009L2.5 9.37594L3.38375 8.49219L8.125 13.2328L16.6163 4.74219L17.5 5.62594L8.125 15.0009Z' fill='#FAFAFA' />
	</svg>
);

const GalleryComponent = () => {
	const [selectedImages, setSelectedImages] = useState([]);
	const [isSelecting, setIsSelecting] = useState(false);
	const [activeStates, setActiveStates] = useState([]);
	const { id } = useParams();
	const navigate = useNavigate();

	const images = JSON.parse(localStorage.getItem('capturedImages'));

	const toggleSelectImage = (index) => {
		if (selectedImages.includes(index)) {
			setSelectedImages(selectedImages.filter((i) => i !== index));
			setActiveStates(activeStates.map((active, i) => (i === index ? false : active)));
		} else {
			setSelectedImages([...selectedImages, index]);
			setActiveStates(activeStates.map((active, i) => (i === index ? true : active)));
		}
	};

	const chooseImages = () => {
		setIsSelecting(!isSelecting);
	};
	const backToCamera = () => {
		navigate(`/camera/${id}`);
	};

	return (
		<>
			<div className='top-gallery'>
				<FaArrowLeft onClick={() => backToCamera()} />
				<span className='title'>Galería</span>
				<button className='cancel-gallery' onClick={chooseImages}>
					{isSelecting ? 'Cancelar' : 'Seleccionar'}
				</button>
			</div>
			<div className='gallery'>
				{images?.map((image, index) => (
					<div key={index} className='div-gallery' onClick={() => isSelecting && toggleSelectImage(index)}>
						<div className={`imageContainer`}>
							<img src={image} alt={`foto-${index}`} className='image' />
						</div>
						{isSelecting && (
							<div className='div-button'>
								<button className={`selected-button ${selectedImages.includes(index) ? 'active' : ''}`}>{tickButton}</button>
							</div>
						)}
					</div>
				))}
			</div>
			{isSelecting && (
				<>
					<div className='allFooter'>
						<div className='footer'>
							<p>{selectedImages.length} foto seleccionada</p>
							<FaRegTrashAlt />
						</div>
						<div className='footer-div-button'>
							<button className='footer-button'>Enviar</button>
						</div>
					</div>
				</>
			)}
		</>
	);
};

export default GalleryComponent;
