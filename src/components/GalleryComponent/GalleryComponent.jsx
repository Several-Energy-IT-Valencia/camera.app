import React, { useState, useEffect } from 'react';
import './GalleryComponent.scss';
import { FaArrowLeft, FaRegTrashAlt } from 'react-icons/fa';
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
	const [images, setImages] = useState([]);
	const { id } = useParams();
	const navigate = useNavigate();

	useEffect(() => {
		const storedImages = JSON.parse(localStorage.getItem('capturedImages')) || [];
		setImages(storedImages);
	}, []);

	const toggleSelectImage = (index) => {
		if (selectedImages.includes(index)) {
			setSelectedImages(selectedImages.filter((i) => i !== index));
		} else {
			setSelectedImages([...selectedImages, index]);
		}
	};

	const chooseImages = () => {
		setIsSelecting(!isSelecting);
	};

	const backToCamera = () => {
		navigate(`/camera/${id}`);
	};

	const deleteSelectedImages = () => {
		const updatedImages = images.filter((_, index) => !selectedImages.includes(index));
		setImages(updatedImages);
		localStorage.setItem('capturedImages', JSON.stringify(updatedImages));
		setSelectedImages([]);
		setIsSelecting(false);
	};

	return (
		<>
			<div className='top-gallery'>
				<FaArrowLeft onClick={() => backToCamera()} />
				<span className='title'>Galería</span>
				<button className={`cancel-gallery ${!isSelecting ? 'selecting' : ''}`} onClick={chooseImages}>
					{isSelecting ? 'Cancelar' : 'Seleccionar'}
				</button>
			</div>
			<div className='gallery'>
				{images.map((image, index) => (
					<div key={index} onClick={() => isSelecting && toggleSelectImage(index)} className='imageContainer'>
						<img src={image} alt={`foto-${index}`} className='image' />
						<span className='imageText'>Página {index + 1}</span>
						{isSelecting && (
							<div className='div-button'>
								<button className={`selected-button ${selectedImages.includes(index) ? 'active' : ''}`}>{tickButton}</button>
							</div>
						)}
					</div>

				))}
			</div>
			{isSelecting && (
				<div className='allFooter'>
					{selectedImages.length > 0 ? (
						<p>
							{selectedImages.length} {selectedImages.length === 1 ? 'foto seleccionada' : 'fotos seleccionadas'}
						</p>
					) : (
						<p className='photosCounter'>Seleccionar</p>
					)}
					<FaRegTrashAlt onClick={deleteSelectedImages} />
				</div>
			)}
			<div className='footer-div-button'>
				<button
					className={`footer-button ${selectedImages.length > 0 ? 'active' : ''}`}
					disabled={selectedImages.length === 0}>
					Enviar
				</button>
			</div>
		</>
	);
};

export default GalleryComponent;
