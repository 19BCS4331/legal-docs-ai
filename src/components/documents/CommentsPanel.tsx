import React, { useState } from 'react';
import { DocumentComment } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface CommentsPanelProps {
  comments: DocumentComment[];
  onAddComment: (content: string, positionStart?: number, positionEnd?: number) => Promise<void>;
  onUpdateComment: (commentId: string, content: string) => Promise<void>;
  onResolveComment: (commentId: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
  userPlan: string;
  canComment: boolean;
  userId: string;
}

export default function CommentsPanel({
  comments,
  onAddComment,
  onUpdateComment,
  onResolveComment,
  onDeleteComment,
  userPlan,
  canComment,
  userId
}: CommentsPanelProps) {
  const [newCommentContent, setNewCommentContent] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleAddComment = async (e: React.FormEvent) => {
    if (!canComment) {
      alert('Permission denied: You do not have permission to add comments.');
      return;
    }

    e.preventDefault();
    if (!newCommentContent.trim()) return;

    try {
      await onAddComment(newCommentContent);
      setNewCommentContent('');
    } catch (err) {
      console.error('Error adding comment:', err);
    }
  };

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      await onUpdateComment(commentId, editContent);
      setEditingCommentId(null);
      setEditContent('');
    } catch (err) {
      console.error('Error updating comment:', err);
    }
  };

  const startEditing = (comment: DocumentComment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  if (userPlan !== 'enterprise') {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Comments are available for enterprise users only.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900">Comments</h3>
        {canComment && (
          <form onSubmit={handleAddComment} className="mt-4">
            <textarea
              value={newCommentContent}
              onChange={(e) => setNewCommentContent(e.target.value)}
              placeholder="Add a comment..."
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              rows={3}
            />
            <div className="mt-2 flex justify-end">
              <button
                type="submit"
                disabled={!newCommentContent.trim()}
                className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Comment
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {comments.map((comment) => (
          <div key={comment.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                {comment.user?.avatar_url && (
                  <img
                    src={comment.user.avatar_url}
                    alt={comment.user.full_name || comment.user.email}
                    className="h-8 w-8 rounded-full"
                  />
                )}
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {comment.user?.full_name || comment.user?.email}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {!comment.resolved && (canComment || comment.user_id === userId) && (
                  <>
                    <button
                      onClick={() => startEditing(comment)}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onResolveComment(comment.id)}
                      className="text-sm text-green-600 hover:text-green-700"
                    >
                      Resolve
                    </button>
                  </>
                )}
                <button
                  onClick={() => onDeleteComment(comment.id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>

            {editingCommentId === comment.id ? (
              <div className="mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  rows={3}
                />
                <div className="mt-2 flex justify-end space-x-2">
                  <button
                    onClick={() => setEditingCommentId(null)}
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleUpdateComment(comment.id)}
                    disabled={!editContent.trim()}
                    className="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className={`mt-2 text-sm text-gray-700 ${comment.resolved ? 'line-through' : ''}`}>
                {comment.content}
              </div>
            )}

            {comment.resolved && (
              <div className="mt-2 text-xs text-gray-500">
                Resolved {formatDistanceToNow(new Date(comment.resolved_at!), { addSuffix: true })}
                {comment.resolved_by?.full_name && ` by ${comment.resolved_by.full_name}`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
