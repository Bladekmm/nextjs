// components/CommentForm.tsx

import React, { useState } from 'react';

interface CommentFormProps {
    onSubmit: (comment: string) => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ onSubmit }) => {
    const [comment, setComment] = useState<string>('');

    const handlePostComment = () => {
        onSubmit(comment);
        setComment('');
    };

    return (
        <div>
            <label htmlFor="comment">Comment:</label>
            <input type="text" id="comment" value={comment} onChange={(e) => setComment(e.target.value)} />
            <button onClick={handlePostComment}>Post Comment</button>
        </div>
    );
};

export default CommentForm;

