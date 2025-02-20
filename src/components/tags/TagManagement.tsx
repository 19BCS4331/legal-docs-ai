'use client'

import { useState } from 'react'
import { Tag } from '@/types'
import { createBrowserClient } from '@supabase/ssr'
import { useToast } from '../shared/Toast'
import { TagIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { ConfirmDialog } from '../shared/ConfirmDialog'

interface TagManagementProps {
  tags: Tag[]
  isLoading: boolean
  onUpdate: () => void
}

export function TagManagement({ tags, isLoading, onUpdate }: TagManagementProps) {
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3B82F6')
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { showToast } = useToast()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    try {
      setIsSaving(true)
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { error } = await supabase
        .from('tags')
        .insert({
          name: newTagName.trim(),
          color: newTagColor,
          user_id: userData.user.id
        })

      if (error) throw error

      setNewTagName('')
      showToast('success', 'Tag created', `Tag "${newTagName}" has been created successfully.`)
      onUpdate()
    } catch (err) {
      console.error('Error creating tag:', err)
      showToast('error', 'Error creating tag', 'Failed to create tag. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateTag = async () => {
    if (!editingTag || !newTagName.trim()) return

    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('tags')
        .update({
          name: newTagName.trim(),
          color: newTagColor
        })
        .eq('id', editingTag.id)

      if (error) throw error

      setEditingTag(null)
      setNewTagName('')
      showToast('success', 'Tag updated', 'Tag has been updated successfully.')
      onUpdate()
    } catch (err) {
      console.error('Error updating tag:', err)
      showToast('error', 'Error updating tag', 'Failed to update tag. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteTag = async () => {
    if (!tagToDelete) return

    try {
      setIsSaving(true)
      const { error } = await supabase
        .from('tags')
        .delete()
        .eq('id', tagToDelete.id)

      if (error) throw error

      setTagToDelete(null)
      showToast('success', 'Tag deleted', 'Tag has been deleted successfully.')
      onUpdate()
    } catch (err) {
      console.error('Error deleting tag:', err)
      showToast('error', 'Error deleting tag', 'Failed to delete tag. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const startEditing = (tag: Tag) => {
    setEditingTag(tag)
    setNewTagName(tag.name)
    setNewTagColor(tag.color)
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Tags</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your document tags. Create new tags, edit existing ones, or remove tags you no longer need.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            placeholder="New tag name"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
          />
          <input
            type="color"
            value={newTagColor}
            onChange={(e) => setNewTagColor(e.target.value)}
            className="h-9 w-9 rounded-md border-0 p-0"
          />
          <button
            type="button"
            onClick={editingTag ? handleUpdateTag : handleCreateTag}
            disabled={!newTagName.trim() || isSaving}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {editingTag ? 'Update Tag' : 'Create Tag'}
          </button>
          {editingTag && (
            <button
              type="button"
              onClick={() => {
                setEditingTag(null)
                setNewTagName('')
              }}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="text-center py-4">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          </div>
        ) : (
          <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        Tag
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Color
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Documents
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {tags.map((tag) => (
                      <tr key={tag.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                          <div className="flex items-center gap-2">
                            <TagIcon className="h-5 w-5" style={{ color: tag.color }} />
                            {tag.name}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <div
                              className="h-6 w-6 rounded border border-gray-200"
                              style={{ backgroundColor: tag.color }}
                            />
                            {tag.color}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {(tag as any).document_count || 0} documents
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => startEditing(tag)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <PencilIcon className="h-5 w-5" />
                              <span className="sr-only">Edit tag</span>
                            </button>
                            <button
                              onClick={() => setTagToDelete(tag)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                              <span className="sr-only">Delete tag</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!tagToDelete}
        title="Delete Tag"
        message={`Are you sure you want to delete the tag "${tagToDelete?.name}"? This will remove it from all documents.`}
        onConfirm={handleDeleteTag}
        onCancel={() => setTagToDelete(null)}
      />
    </div>
  )
}
