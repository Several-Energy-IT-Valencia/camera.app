import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import './QRGenerator.scss';

const url = 'http://192.168.1.156:5173/camera';

const QRGenerator = () => {
	// const { id } = localStorage.getItem('user') || null;
	const [urlState, setUrl] = useState('');

	useEffect(() => {
		setUrl(url + '/' + 1); // en un futuro en vez de uno sera el id del usuario
	}, []);

	return (
		<div className='qr-generator-container'>
			<div className='line-box'>
				<div className='black-line'></div>o<div className='black-line'></div>
			</div>
            <div>
                <p>Puedes cargar directamente tu factura con el móvil escaneando este código: </p>
            </div>
			<div className='qr-code-box'>
				<QRCode value={urlState} size={256} level='H' />
			</div>
		</div>
	);
};

export default QRGenerator;
