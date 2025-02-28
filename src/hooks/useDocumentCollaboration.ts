import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { DocumentCollaborator, DocumentComment, DocumentPresence } from '@/types'
import { useToast } from '@/components/shared/Toast'

export function useDocumentCollaboration(documentId: string, userId: string) {
  const [collaborators, setCollaborators] = useState<DocumentCollaborator[]>([])
  const [comments, setComments] = useState<DocumentComment[]>([])
  const [activeUsers, setActiveUsers] = useState<DocumentPresence[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showToast } = useToast()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  // Function to update presence
  const updatePresence = async (cursorPosition?: number) => {
    try {
      // First check if we already have a presence record
      const { data: existingPresence } = await supabase
        .from('document_presence')
        .select('id')
        .eq('document_id', documentId)
        .eq('user_id', userId)
        .single()

      const presenceData = {
        document_id: documentId,
        user_id: userId,
        last_seen_at: new Date().toISOString(),
        cursor_position: cursorPosition
      }

      if (existingPresence) {
        // Update existing presence
        const { error } = await supabase
          .from('document_presence')
          .update(presenceData)
          .eq('id', existingPresence.id)

        if (error) throw error
      } else {
        // Insert new presence
        const { error } = await supabase
          .from('document_presence')
          .insert(presenceData)

        if (error) throw error
      }
    } catch (err) {
      console.error('Error updating presence:', err)
    }
  }

  // Load initial data
  useEffect(() => {
    async function loadCollaborationData() {
      try {
        setIsLoading(true)
        setError(null)

        // Load collaborators
        const { data: collaboratorsData, error: collaboratorsError } = await supabase
          .from('document_collaborators')
          .select(`
            *,
            profile:user_id (
              id,
              email,
              full_name
            )
          `)
          .eq('document_id', documentId)

        if (collaboratorsError) throw collaboratorsError
        setCollaborators(collaboratorsData.map(c => ({
          ...c,
          user: c.profile ? {
            id: c.profile.id,
            email: c.profile.email,
            full_name: c.profile.full_name
          } : undefined
        })))

        // Load comments
        const { data: commentsData, error: commentsError } = await supabase
          .from('document_comments')
          .select(`
            *,
            profile:user_id (
              id,
              email,
              full_name
            )
          `)
          .eq('document_id', documentId)
          .order('created_at', { ascending: true })

        if (commentsError) throw commentsError
        setComments(commentsData.map(c => ({
          ...c,
          user: c.profile ? {
            id: c.profile.id,
            email: c.profile.email,
            full_name: c.profile.full_name
          } : undefined
        })))

        // Load active users
        const { data: presenceData, error: presenceError } = await supabase
          .from('document_presence')
          .select(`
            *,
            profile:user_id (
              id,
              email,
              full_name
            )
          `)
          .eq('document_id', documentId)
          .gt('last_seen_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Active in last 5 minutes

        if (presenceError) throw presenceError
        setActiveUsers(presenceData.map(p => ({
          ...p,
          user: p.profile ? {
            id: p.profile.id,
            email: p.profile.email,
            full_name: p.profile.full_name
          } : undefined
        })))

      } catch (err) {
        console.error('Error loading collaboration data:', err)
        setError('Failed to load collaboration data')
        showToast('error', 'Failed to load collaboration data')
      } finally {
        setIsLoading(false)
      }
    }

    loadCollaborationData()
  }, [documentId])

  // Subscribe to real-time updates
  useEffect(() => {
    // Initial presence update
    updatePresence()

    // Set up real-time subscriptions
    const presenceSubscription = supabase
      .channel(`document_presence:${documentId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'document_presence',
        filter: `document_id=eq.${documentId}`
      }, async () => {
        // Refresh active users
        const { data } = await supabase
          .from('document_presence')
          .select(`
            *,
            profile:user_id (
              id,
              email,
              full_name
            )
          `)
          .eq('document_id', documentId)
          .gt('last_seen_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())

        if (data) setActiveUsers(data.map(p => ({
          ...p,
          user: p.profile ? {
            id: p.profile.id,
            email: p.profile.email,
            full_name: p.profile.full_name
          } : undefined
        })))
      })
      .subscribe()

    // Clean up old presence records periodically
    const cleanupInterval = setInterval(async () => {
      try {
        await supabase
          .from('document_presence')
          .delete()
          .eq('document_id', documentId)
          .lt('last_seen_at', new Date(Date.now() - 5 * 60 * 1000).toISOString())
      } catch (err) {
        console.error('Error cleaning up presence records:', err)
      }
    }, 60000) // Run every minute

    // Update presence every 30 seconds
    const presenceInterval = setInterval(() => {
      updatePresence()
    }, 30000)

    return () => {
      presenceSubscription.unsubscribe();
      clearInterval(presenceInterval);
      clearInterval(cleanupInterval);
      
      // Clean up our presence when unmounting
      void (async () => {
        try {
          await supabase
            .from('document_presence')
            .delete()
            .eq('document_id', documentId)
            .eq('user_id', userId);
        } catch (err) {
          console.error('Error cleaning up presence:', err);
        }
      })();
    };
  }, [documentId, userId])

  // Helper functions for collaboration
  const addCollaborator = async (userEmail: string, role: DocumentCollaborator['role']) => {
    try {
      // First, get the user ID from the email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single()

      if (userError || !userData) throw new Error('User not found')

      const { data, error } = await supabase
        .from('document_collaborators')
        .insert({
          document_id: documentId,
          user_id: userData.id,
          role,
          added_by: userId
        })
        .select(`
          *,
          profile:user_id (
            id,
            email,
            full_name
          )
        `)
        .single()

      if (error) throw error

      setCollaborators([...collaborators, {
        ...data,
        user: data.profile ? {
          id: data.profile.id,
          email: data.profile.email,
          full_name: data.profile.full_name
        } : undefined
      }])
      showToast('success', 'Collaborator added successfully')
    } catch (err) {
      console.error('Error adding collaborator:', err)
      showToast('error', 'Failed to add collaborator')
      throw err
    }
  }

  const removeCollaborator = async (collaboratorId: string) => {
    try {
      const { error } = await supabase
        .from('document_collaborators')
        .delete()
        .eq('id', collaboratorId)

      if (error) throw error

      setCollaborators(collaborators.filter(c => c.id !== collaboratorId))
      showToast('success', 'Collaborator removed successfully')
    } catch (err) {
      console.error('Error removing collaborator:', err)
      showToast('error', 'Failed to remove collaborator')
      throw err
    }
  }

  const addComment = async (content: string, parentId?: string, position?: { start: number, end: number }) => {
    try {
      const { data, error } = await supabase
        .from('document_comments')
        .insert({
          document_id: documentId,
          user_id: userId,
          content,
          parent_id: parentId,
          position_start: position?.start,
          position_end: position?.end
        })
        .select(`
          *,
          profile:user_id (
            id,
            email,
            full_name
          )
        `)
        .single()

      if (error) throw error

      setComments([...comments, {
        ...data,
        user: data.profile ? {
          id: data.profile.id,
          email: data.profile.email,
          full_name: data.profile.full_name
        } : undefined
      }])
      showToast('success', 'Comment added successfully')
      return data
    } catch (err) {
      console.error('Error adding comment:', err)
      showToast('error', 'Failed to add comment')
      throw err
    }
  }

  const updateComment = async (commentId: string, content: string) => {
    try {
      const { data, error } = await supabase
        .from('document_comments')
        .update({ content })
        .eq('id', commentId)
        .select(`
          *,
          profile:user_id (
            id,
            email,
            full_name
          )
        `)
        .single()

      if (error) throw error

      setComments(comments.map(c => c.id === commentId ? {
        ...data,
        user: data.profile ? {
          id: data.profile.id,
          email: data.profile.email,
          full_name: data.profile.full_name
        } : undefined
      } : c))
      showToast('success', 'Comment updated successfully')
    } catch (err) {
      console.error('Error updating comment:', err)
      showToast('error', 'Failed to update comment')
      throw err
    }
  }

  const resolveComment = async (commentId: string) => {
    try {
      const { data, error } = await supabase
        .from('document_comments')
        .update({
          resolved: true,
          resolved_at: new Date().toISOString(),
          resolved_by: userId
        })
        .eq('id', commentId)
        .select(`
          *,
          profile:user_id (
            id,
            email,
            full_name
          )
        `)
        .single()

      if (error) throw error

      setComments(comments.map(c => c.id === commentId ? {
        ...data,
        user: data.profile ? {
          id: data.profile.id,
          email: data.profile.email,
          full_name: data.profile.full_name
        } : undefined
      } : c))
      showToast('success', 'Comment resolved successfully')
    } catch (err) {
      console.error('Error resolving comment:', err)
      showToast('error', 'Failed to resolve comment')
      throw err
    }
  }

  const updateCursorPosition = async (position: number) => {
    try {
      await updatePresence(position)
    } catch (err) {
      console.error('Error updating cursor position:', err)
    }
  }

  return {
    collaborators,
    comments,
    activeUsers,
    isLoading,
    error,
    addCollaborator,
    removeCollaborator,
    addComment,
    updateComment,
    resolveComment,
    updateCursorPosition
  }
}
