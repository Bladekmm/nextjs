// components/CommentForm.tsx

import React, { useState } from 'react';

interface CommentFormProps {
    onSubmit: (orderId: number, comment: string) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit }) => {
    const [orderId, setOrderId] = useState<number>(0);
    const [comment, setComment] = useState<string>('');

    const handlePostComment = () => {
        onSubmit(orderId, comment);
        setOrderId(0);
        setComment('');
    };

    return (
        <div>
            <label htmlFor="orderId">Order ID:</label>
            <input type="text" id="orderId" value={orderId} onChange={(e) => setOrderId(Number(e.target.value))} />
            <label htmlFor="comment">Comment:</label>
            <input type="text" id="comment" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button onClick={handlePostComment}>Post Comment</button>
        </div>
    );
};

export default CommentForm;
