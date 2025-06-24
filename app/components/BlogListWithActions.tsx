'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface BlogListProps {
  blogs: any[]
}

const BlogListWithActions = ({ blogs }: BlogListProps) => {
  const [isPending, startTransition] = useTransition()
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const router = useRouter()

  const updateBlogStatus = async (blogId: string, newStatus: 'draft' | 'published') => {
    setLoadingStates(prev => ({ ...prev, [blogId]: true }))
    
    try {
      const response = await fetch('/api/blogs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blogId,
          status: newStatus,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update blog status')
      }

      // Refresh the page to show updated data
      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error('Error updating blog status:', error)
      // You can add a toast notification here if you have one available
    } finally {
      setLoadingStates(prev => ({ ...prev, [blogId]: false }))
    }
  }

  const togglePublicStatus = async (blogId: string, currentIsPublic: boolean) => {
    setLoadingStates(prev => ({ ...prev, [`${blogId}-public`]: true }))
    
    try {
      const response = await fetch('/api/blogs', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          blogId,
          isPublic: !currentIsPublic,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update blog visibility')
      }

      startTransition(() => {
        router.refresh()
      })
    } catch (error) {
      console.error('Error updating blog visibility:', error)
    } finally {
      setLoadingStates(prev => ({ ...prev, [`${blogId}-public`]: false }))
    }
  }

  if (blogs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No blogs found.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {blogs.map((blog) => (
        <Card key={blog.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                  {blog.status}
                </Badge>
                {blog.isPublic && (
                  <Badge variant="outline">Public</Badge>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {blog.status === 'draft' ? (
                  <Button
                    size="sm"
                    onClick={() => updateBlogStatus(blog.id, 'published')}
                    disabled={loadingStates[blog.id] || isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loadingStates[blog.id] ? 'Publishing...' : 'Publish'}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => updateBlogStatus(blog.id, 'draft')}
                    disabled={loadingStates[blog.id] || isPending}
                  >
                    {loadingStates[blog.id] ? 'Unpublishing...' : 'Unpublish'}
                  </Button>
                )}
                
                {blog.status === 'published' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => togglePublicStatus(blog.id, blog.isPublic)}
                    disabled={loadingStates[`${blog.id}-public`] || isPending}
                  >
                    {loadingStates[`${blog.id}-public`] ? 
                      'Updating...' : 
                      blog.isPublic ? 'Make Private' : 'Make Public'
                    }
                  </Button>
                )}
              </div>
            </div>
            
            <CardTitle className="text-lg line-clamp-2">{blog.title}</CardTitle>
            {blog.subtitle && (
              <CardDescription className="line-clamp-2">{blog.subtitle}</CardDescription>
            )}
          </CardHeader>

          <CardContent className="pt-0">
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              {blog.content}
            </p>

            {blog.tags && blog.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {blog.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>
                {blog.organizationName && `Org: ${blog.organizationName}`}
              </span>
              <span>
                {blog.publishedAt ?
                  `Published ${new Date(blog.publishedAt).toLocaleDateString()}` :
                  `Created ${new Date(blog.createdAt ?? '').toLocaleDateString()}`
                }
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default BlogListWithActions
