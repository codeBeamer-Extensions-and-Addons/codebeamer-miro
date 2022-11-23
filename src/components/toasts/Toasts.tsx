import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';

import ToastContainer from 'react-bootstrap/ToastContainer';
import { Toast, ToastHeader } from 'react-bootstrap';
import { removeAppMessage } from '../../store/slices/appMessagesSlice';

export default function Toasts(props: {
	position?:
		| 'top-start'
		| 'top-center'
		| 'top-end'
		| 'middle-start'
		| 'middle-center'
		| 'middle-end'
		| 'bottom-start'
		| 'bottom-center'
		| 'bottom-end';
}) {
	const dispatch = useDispatch();
	const { messages } = useSelector((store: RootState) => store.appMessages);

	const removeToast = (messageId: number) => {
		dispatch(removeAppMessage(messageId));
	};

	const DEFAULT_DELAY = 5000;

	return (
		<ToastContainer position={props.position ?? 'bottom-end'}>
			{messages.map((m) => (
				<Toast
					bg={m.bg}
					autohide={true}
					delay={m.delay ?? DEFAULT_DELAY}
					onClose={() => removeToast(m.id!)}
					key={m.id} //ids are reused
					data-test={`toast-${m.id}`}
				>
					{m.header && <ToastHeader>{m.header}</ToastHeader>}
					{m.content && (
						<Toast.Body
							className={m.bg === 'dark' ? 'text-white' : ''}
						>
							{m.content}
						</Toast.Body>
					)}
				</Toast>
			))}
		</ToastContainer>
	);
}
