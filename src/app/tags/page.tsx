'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Tag } from '@/types'
import { useToast } from '@/components/shared/Toast'
import { TagManagement } from '@/components/tags/TagManagement'

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showToast } = useToast()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const loadTags = async () => {
    try {
      setIsLoading(true)

      // First get all tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('*')
        .order('name')

      if (tagsError) throw tagsError

      // Then get document counts for each tag using a raw count query
      const { data: countData, error: countError } = await supabase
        .rpc('get_tag_counts')

      if (countError) throw countError

      // Create a map of tag_id to count
      const countMap = new Map(
        countData?.map((item:any) => [item.tag_id, item.count])
      )

      // Combine the data
      const transformedTags = tagsData?.map(tag => ({
        ...tag,
        document_count: countMap.get(tag.id) || 0
      })) || []

      setTags(transformedTags)
    } catch (err) {
      console.error('Error loading tags:', err)
      showToast('error', 'Error loading tags', 'Failed to load tags. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTags()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <TagManagement tags={tags} isLoading={isLoading} onUpdate={loadTags} />
    </div>
  )
}
