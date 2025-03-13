'use client'

import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, TagIcon } from '@heroicons/react/24/outline'
import { createBrowserClient } from '@supabase/ssr'
import { Tag } from '@/types'
import { useToast } from '../shared/Toast'

interface TagsDialogProps {
  isOpen: boolean
  onClose: () => void
  documentId: string
  onTagsChange?: () => void
}

export function TagsDialog({ isOpen, onClose, documentId, onTagsChange }: TagsDialogProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#3B82F6') // Default blue color
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { showToast } = useToast()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (isOpen) {
      loadTags()
    }
  }, [isOpen, documentId])

  const loadTags = async () => {
    try {
      setIsLoading(true)
      
      // Load available tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name')

      if (tagsError) throw tagsError

      // Load document's current tags
      const { data: documentTags, error: documentTagsError } = await supabase
        .from('document_tags')
        .select('tag_id')
        .eq('document_id', documentId)

      if (documentTagsError) throw documentTagsError

      setAvailableTags(tagsData || [])
      setSelectedTags(documentTags?.map(dt => dt.tag_id) || [])
    } catch (err) {
      console.error('Error loading tags:', err)
      showToast('error', 'Error loading tags', 'Failed to load tags. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError

      const { data: tag, error } = await supabase
        .from('tags')
        .insert({
          name: newTagName.trim(),
          color: newTagColor,
          user_id: userData.user.id
        })
        .select()
        .single()

      if (error) throw error

      setAvailableTags([...availableTags, tag])
      setNewTagName('')
      showToast('success', 'Tag created', `Tag "${newTagName}" has been created successfully.`)
    } catch (err) {
      console.error('Error creating tag:', err)
      showToast('error', 'Error creating tag', 'Failed to create tag. Please try again.')
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      // Get current tags to check if there are any changes
      const { data: currentTags, error: fetchError } = await supabase
        .from('document_tags')
        .select('tag_id')
        .eq('document_id', documentId)

      if (fetchError) throw fetchError

      const currentTagIds = new Set(currentTags?.map(t => t.tag_id) || [])
      const selectedTagsSet = new Set(selectedTags)

      // Check if there are any changes
      const hasChanges = selectedTags.length !== currentTagIds.size ||
        selectedTags.some(tagId => !currentTagIds.has(tagId))

      if (!hasChanges) {
        onClose()
        return
      }

      // First, remove all existing tags
      const { error: deleteError } = await supabase
        .from('document_tags')
        .delete()
        .eq('document_id', documentId)

      if (deleteError) throw deleteError

      // Then add all selected tags
      if (selectedTags.length > 0) {
        const { error: insertError } = await supabase
          .from('document_tags')
          .insert(
            selectedTags.map(tagId => ({
              document_id: documentId,
              tag_id: tagId
            }))
          )

        if (insertError) throw insertError
      }

      showToast('success', 'Tags updated', 'Document tags have been updated successfully.')
      
      // Call onTagsChange before closing the dialog
      if (onTagsChange) {
        await onTagsChange()
      }
      
      onClose()
    } catch (err) {
      console.error('Error saving tags:', err)
      showToast('error', 'Error saving tags', 'Failed to save tags. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TagIcon className="h-6 w-6 text-indigo-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Manage Tags
                    </Dialog.Title>
                    
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Create new tags or select existing ones. Click on a tag to select/deselect it, then click "Save Changes" to apply your changes to the document.
                      </p>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex gap-2 mb-4">
                        <input
                          type="text"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                          placeholder="New tag name"
                          className="block w-full rounded-md border-0 py-1.5 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                          required
                        />
                        <input
                          type="color"
                          value={newTagColor}
                          onChange={(e) => setNewTagColor(e.target.value)}
                          className="h-9 w-9 rounded-md border-0 p-0"
                        />
                        <button
                          type="button"
                          onClick={handleCreateTag}
                          disabled={!newTagName.trim()}
                          className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Add
                        </button>
                      </div>

                      {isLoading ? (
                        <div className="text-center py-4">
                          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {availableTags.length === 0 ? (
                            <p className="col-span-2 text-sm text-gray-500 text-center py-4">
                              No tags available. Create a new tag using the form above.
                            </p>
                          ) : (
                            availableTags.map((tag) => (
                              <button
                                key={tag.id}
                                onClick={() => toggleTag(tag.id)}
                                className={`flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium ${
                                  selectedTags.includes(tag.id)
                                    ? 'ring-2 ring-offset-2'
                                    : 'hover:bg-gray-50'
                                }`}
                                style={{
                                  backgroundColor: tag.color + '33',
                                  color: tag.color,
                                  borderColor: tag.color
                                }}
                              >
                                {tag.name}
                                {selectedTags.includes(tag.id) && (
                                  <span className="ml-2">✓</span>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                      <button
                        type="button"
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={handleSave}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        type="button"
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                        onClick={onClose}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}