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
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <div className="flex items-center gap-x-3 mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <TagIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">Tags</h1>
              </div>
              <p className="text-sm text-gray-700">
                Manage your document tags. Create new tags, edit existing ones, or remove tags you no longer need.
              </p>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="flex-1">
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  placeholder="New tag name"
                  className="block w-full rounded-lg border-0 py-3 px-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={newTagColor}
                  onChange={(e) => setNewTagColor(e.target.value)}
                  className="h-12 w-12 rounded-lg border-0 p-1 shadow-sm ring-1 ring-inset ring-gray-300"
                />
                <button
                  type="button"
                  onClick={editingTag ? handleUpdateTag : handleCreateTag}
                  disabled={!newTagName.trim() || isSaving}
                  className="inline-flex items-center gap-x-1.5 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="rounded-lg bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-[3px] border-current border-t-transparent text-indigo-600 motion-reduce:animate-[spin_1.5s_linear_infinite]" />
              </div>
            ) : (
              <div className="mt-8 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                              Tag
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Color
                            </th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                              Documents
                            </th>
                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                              <span className="sr-only">Actions</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {tags.map((tag) => (
                            <tr key={tag.id} className="hover:bg-gray-50">
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                                <div className="flex items-center gap-2">
                                  <div className="h-5 w-5 rounded-full" style={{ backgroundColor: tag.color }} />
                                  {tag.name}
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-6 w-6 rounded-md border border-gray-200 shadow-sm"
                                    style={{ backgroundColor: tag.color }}
                                  />
                                  <span className="font-mono">{tag.color}</span>
                                </div>
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                {(tag as any).document_count || 0} documents
                              </td>
                              <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                <div className="flex justify-end gap-3">
                                  <button
                                    onClick={() => startEditing(tag)}
                                    className="inline-flex items-center gap-x-1.5 text-indigo-600 hover:text-indigo-900"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                    <span>Edit</span>
                                  </button>
                                  <button
                                    onClick={() => setTagToDelete(tag)}
                                    className="inline-flex items-center gap-x-1.5 text-red-600 hover:text-red-900"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                    <span>Delete</span>
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
              </div>
            )}
          </div>
        </div>
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
