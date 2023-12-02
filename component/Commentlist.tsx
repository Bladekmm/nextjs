// components/CommentList.tsx

import React from 'react';

interface CommentListProps {
    comments: string[];
    onLike: (comment: string) => void;
    onDislike: (comment: string) => void;
}

const CommentList: React.FC<CommentListProps> = ({ comments, onLike, onDislike }) => {
    return (
        <ul>
            {comments.map((comment, index) => (
                <li key={index}>
                    {comment}{' '}
                    <button onClick={() => onLike(comment)}>Like</button>
                    <button onClick={() => onDislike(comment)}>Dislike</button>
                </li>
            ))}
        </ul>
    );
};

export default CommentList;

