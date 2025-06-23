'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, FileText, Eye, Save, Send, Users, Building, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import React, { useState, useEffect, useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import 'highlight.js/styles/github-dark.css'
import { useUser, useOrganization } from '@clerk/nextjs'

// Types for better type safety
interface BlogPost {
  title: string
  subtitle: string
  content: string
  tags: string[]
  organizationId: string | null
  organizationName: string | null
  isPublic: boolean
  status: 'draft' | 'published'
}

interface NotificationState {
  type: 'success' | 'error' | 'info' | null
  message: string
}

const page = () => {
  const { user } = useUser()
  const { organization } = useOrganization()

  // Form state
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [isPublic, setIsPublic] = useState(false)

  // UI state
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')

  // Loading states
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Notification state
  const [notification, setNotification] = useState<NotificationState>({ type: null, message: '' })

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-hide notifications after 5 seconds
  useEffect(() => {
    if (notification.type) {
      const timer = setTimeout(() => {
        setNotification({ type: null, message: '' })
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Validation function
  const validateForm = useCallback((forPublish = false): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long'
    }

    if (forPublish && !content.trim()) {
      newErrors.content = 'Content is required for publishing'
    } else if (forPublish && content.trim().length < 10) {
      newErrors.content = 'Content must be at least 10 characters long for publishing'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [title, content])

  // Show notification helper
  const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message })
  }, [])

  // File upload handler with proper loading state
  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setErrors({})

    try {
      // Check if it's a markdown file by extension or MIME type
      const isMarkdownFile =
        file.name.toLowerCase().endsWith('.md') ||
        file.name.toLowerCase().endsWith('.markdown') ||
        file.type === 'text/markdown' ||
        file.type === 'text/plain' ||
        file.type === ''

      if (!isMarkdownFile) {
        throw new Error('Please select a valid markdown file (.md or .markdown)')
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB')
      }

      const reader = new FileReader()

      reader.onload = (e) => {
        const text = e.target?.result as string
        setContent(text)
        showNotification('success', `Markdown file "${file.name}" uploaded successfully`)
        setIsUploading(false)
      }

      reader.onerror = () => {
        throw new Error('Failed to read the file')
      }

      reader.readAsText(file)
    } catch (error) {
      setIsUploading(false)
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file'
      showNotification('error', errorMessage)
    }

    // Clear the input
    event.target.value = ''
  }, [showNotification])  // API call helper
  const submitBlogPost = useCallback(async (blogData: BlogPost): Promise<any> => {
    const response = await fetch('/api/blogs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blogData),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`)
    }

    return result
  }, [])

  // Save as draft handler
  const handleSave = useCallback(async () => {
    if (!validateForm(false)) {
      showNotification('error', 'Please fix the validation errors before saving')
      return
    }

    setIsSaving(true)
    setErrors({})

    const blogPost: BlogPost = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      organizationId: organization?.id || null,
      organizationName: organization?.name || null,
      isPublic,
      status: 'draft'
    }

    try {
      const result = await submitBlogPost(blogPost)
      showNotification('success', 'Blog saved as draft successfully!')
      console.log('Blog saved:', result.blog)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save blog post'
      showNotification('error', errorMessage)
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }, [title, subtitle, content, tags, organization, isPublic, validateForm, showNotification, submitBlogPost])

  // Publish handler
  const handlePublish = useCallback(async () => {
    if (!validateForm(true)) {
      showNotification('error', 'Please fix the validation errors before publishing')
      return
    }

    setIsPublishing(true)
    setErrors({})

    const blogPost: BlogPost = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      organizationId: organization?.id || null,
      organizationName: organization?.name || null,
      isPublic,
      status: 'published'
    }

    try {
      const result = await submitBlogPost(blogPost)
      showNotification('success', 'Blog published successfully!')
      console.log('Blog published:', result.blog)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to publish blog post'
      showNotification('error', errorMessage)
      console.error('Publish error:', error)
    } finally {
      setIsPublishing(false)
    }
  }, [title, subtitle, content, tags, organization, isPublic, validateForm, showNotification, submitBlogPost])

  // Tab change handler
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value as 'edit' | 'preview')
  }, [])

  // Computed values
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))
  const isReady = title.trim() && content.trim()
  const canSave = title.trim().length >= 3
  const canPublish = canSave && content.trim().length >= 10

  // Notification component
  const NotificationBanner = () => {
    if (!notification.type) return null

    const icons = {
      success: CheckCircle,
      error: XCircle,
      info: AlertCircle
    }

    const colors = {
      success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200',
      error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200',
      info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200'
    }

    const Icon = icons[notification.type]

    return (
      <div className={`fixed top-4 right-4 z-50 p-4 border rounded-lg shadow-lg max-w-md ${colors[notification.type]}`}>
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      </div>
    )
  }
  return (
    <>
      <NotificationBanner />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Create New Blog Post</h1>
            <p className="text-muted-foreground">Write and publish your thoughts to the world</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title and Subtitle */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Post Details
                  </CardTitle>
                  <CardDescription>
                    Add your blog post title and subtitle
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter your blog post title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className={`text-lg font-medium ${errors.title ? 'border-red-500' : ''}`}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 flex items-center gap-1">
                        <XCircle className="h-4 w-4" />
                        {errors.title}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subtitle">Subtitle</Label>
                    <Input
                      id="subtitle"
                      placeholder="Enter a subtitle (optional)..."
                      value={subtitle}
                      onChange={(e) => setSubtitle(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Content Editor */}
              <Card className="flex-1">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Content</CardTitle>
                      <CardDescription>
                        Write your blog post content in Markdown format
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTabChange(activeTab === 'edit' ? 'preview' : 'edit')}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        {activeTab === 'preview' ? 'Edit' : 'Preview'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="edit"
                        onClick={() => handleTabChange('edit')}
                      >
                        Edit
                      </TabsTrigger>
                      <TabsTrigger
                        value="preview"
                        onClick={() => handleTabChange('preview')}
                      >
                        Preview
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="edit" className="mt-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                          <Label htmlFor="markdown-file" className="cursor-pointer">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-2"
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Upload className="h-4 w-4" />
                              )}
                              {isUploading ? 'Uploading...' : 'Upload Markdown File'}
                            </Button>
                          </Label>
                          <input
                            id="markdown-file"
                            type="file"
                            accept=".md,.markdown"
                            onChange={handleFileUpload}
                            className="hidden"
                            disabled={isUploading}
                          />
                          <span className="text-sm text-muted-foreground">
                            or write directly below
                          </span>
                        </div>
                        <div className="space-y-2">
                          <Textarea
                            placeholder="# Start writing your blog post here...

## Use Markdown syntax for formatting

- **Bold text** for emphasis
- *Italic text* for style
- \`code snippets\` for technical content
- [Links](https://example.com) for references

### Code blocks
\`\`\`javascript
console.log('Hello, World!')
\`\`\`

Write your amazing content here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className={`min-h-[400px] font-mono text-sm ${errors.content ? 'border-red-500' : ''}`}
                          />
                          {errors.content && (
                            <p className="text-sm text-red-500 flex items-center gap-1">
                              <XCircle className="h-4 w-4" />
                              {errors.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="preview" className="mt-4">
                      <div className="border rounded-md p-6 min-h-[400px] bg-card overflow-auto">
                        {content ? (
                          <div className="prose prose-slate max-w-none dark:prose-invert prose-pre:bg-gray-100 dark:prose-pre:bg-gray-800 prose-pre:text-gray-800 dark:prose-pre:text-gray-200">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                            >
                              {content}
                            </ReactMarkdown>
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground py-20">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>Start writing to see preview</p>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Tags */}
              <Card>
                <CardHeader>
                  <CardTitle>Tags</CardTitle>
                  <CardDescription>
                    Add tags to help categorize your post
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Enter tags separated by commas (e.g., technology, javascript, tutorial)"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="min-h-[80px]"
                    />
                    {tags && (
                      <div className="flex flex-wrap gap-2">
                        {tags.split(',').map((tag, index) => {
                          const trimmedTag = tag.trim()
                          return trimmedTag ? (
                            <Badge key={index} variant="secondary">
                              {trimmedTag}
                            </Badge>
                          ) : null
                        })}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions</CardTitle>
                  <CardDescription>
                    Save or publish your blog post
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleSave}
                    variant="outline"
                    className="w-full flex items-center gap-2"
                    disabled={!canSave || isSaving || isPublishing}
                  >
                    {isSaving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {isSaving ? 'Saving...' : 'Save Draft'}
                  </Button>
                  <Button
                    onClick={handlePublish}
                    className="w-full flex items-center gap-2"
                    disabled={!canPublish || isSaving || isPublishing}
                  >
                    {isPublishing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {isPublishing ? 'Publishing...' : 'Publish Post'}
                  </Button>
                </CardContent>
              </Card>

              {/* Post Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Characters:</span>
                    <span className="font-medium">{content.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Words:</span>
                    <span className="font-medium">{wordCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Reading time:</span>
                    <span className="font-medium">{readingTime} min</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant={isReady ? "default" : "secondary"}>
                      {isReady ? "Ready" : "Draft"}
                    </Badge>
                  </div>
                  {organization && (
                    <>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Organization:</span>
                        <span className="font-medium flex items-center gap-1">
                          <Building className="h-3 w-3" />
                          {organization.name}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Visibility Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Visibility</CardTitle>
                  <CardDescription>
                    Control who can see your blog post
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isPublic"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isPublic" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Make this post public
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {isPublic
                      ? "Anyone can view this post"
                      : organization
                        ? "Only organization members can view this post"
                        : "Only you can view this post"
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

export default page