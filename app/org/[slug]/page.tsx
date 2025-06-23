'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, FileText, Eye, Save, Send, Clock, User, Calendar, Hash, BookOpen, Zap, Image, Link2, Type } from 'lucide-react'
import React, { useState } from 'react'

const page = () => {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [author, setAuthor] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [isPreview, setIsPreview] = useState(false)
  const [publishDate, setPublishDate] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [slug, setSlug] = useState('')
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && (file.type === 'text/markdown' || file.name.endsWith('.md') || file.name.endsWith('.markdown'))) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        // Parse markdown content for title, subtitle, and content
        const lines = text.split('\n')
        let mdTitle = ''
        let mdSubtitle = ''
        let mdContent = text

        // Extract title (first # heading)
        const titleMatch = lines.find(line => line.startsWith('# '))
        if (titleMatch) {
          mdTitle = titleMatch.replace('# ', '').trim()
          if (!title) setTitle(mdTitle)
        }

        // Extract subtitle (first ## heading after title)
        const subtitleMatch = lines.find((line, index) => {
          const prevLine = lines[index - 1] || ''
          return line.startsWith('## ') && (index === 0 || !prevLine.startsWith('# '))
        })
        if (subtitleMatch) {
          mdSubtitle = subtitleMatch.replace('## ', '').trim()
          if (!subtitle) setSubtitle(mdSubtitle)
        }

        setContent(text)
      }
      reader.readAsText(file)
    }
  }
  const handleSave = () => {
    const blogPost = {
      title,
      subtitle,
      description,
      author,
      category,
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      publishDate,
      featuredImage,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      createdAt: new Date().toISOString(),
      status: 'draft'
    }
    console.log('Saving blog post:', blogPost)
  }

  const handlePublish = () => {
    const blogPost = {
      title,
      subtitle,
      description,
      author,
      category,
      content,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0),
      publishDate: publishDate || new Date().toISOString(),
      featuredImage,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      createdAt: new Date().toISOString(),
      publishedAt: new Date().toISOString(),
      status: 'published'
    }
    console.log('Publishing blog post:', blogPost)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            Create New Blog Post
          </h1>
          <p className="text-muted-foreground">Write and publish your thoughts to the world</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">            {/* Title and Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="h-5 w-5" />
                  Post Details
                </CardTitle>
                <CardDescription>
                  Add your blog post title and basic information
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
                    className="text-lg font-medium"
                  />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Input
                      id="author"
                      placeholder="Author name..."
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      placeholder="e.g., Technology, Lifestyle..."
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Write a brief description of your blog post..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card className="flex-1">
              <CardHeader>                <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Content
                  </CardTitle>
                  <CardDescription>
                    Write your blog post content in Markdown format
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPreview(!isPreview)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    {isPreview ? 'Edit' : 'Preview'}
                  </Button>
                </div>
              </div>
              </CardHeader>
              <CardContent>
                <Tabs value={isPreview ? 'preview' : 'edit'} className="w-full">                  <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="edit" onClick={() => setIsPreview(false)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview" onClick={() => setIsPreview(true)}>
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </TabsTrigger>
                </TabsList>
                  <TabsContent value="edit" className="mt-4">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Label htmlFor="markdown-file" className="cursor-pointer">
                          <Button variant="outline" size="sm" className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Markdown File
                          </Button>
                        </Label>
                        <input
                          id="markdown-file"
                          type="file"
                          accept=".md,.markdown"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <span className="text-sm text-muted-foreground">
                          or write directly below
                        </span>
                      </div>
                      <Textarea
                        placeholder="# Start writing your blog post here...

## Use Markdown syntax for formatting

- **Bold text** for emphasis
- *Italic text* for style
- `code snippets` for technical content
- [Links](https://example.com) for references

### Code blocks
```javascript
console.log('Hello, World!')
```

Write your amazing content here..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="preview" className="mt-4">
                    <div className="border rounded-md p-4 min-h-[400px] bg-card">
                      {content ? (
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <pre className="whitespace-pre-wrap font-sans">
                            {content}
                          </pre>
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
          </div>          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Publishing
                </CardTitle>
                <CardDescription>
                  Set publishing options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="publish-date">Publish Date</Label>
                  <Input
                    id="publish-date"
                    type="datetime-local"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input
                    id="slug"
                    placeholder="custom-url-slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {slug || title ? `/blog/${slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}` : '/blog/your-post-url'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="featured-image">Featured Image URL</Label>
                  <Input
                    id="featured-image"
                    placeholder="https://example.com/image.jpg"
                    value={featuredImage}
                    onChange={(e) => setFeaturedImage(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  Tags
                </CardTitle>
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
                          <Badge key={index} variant="secondary" className="flex items-center gap-1">
                            <Hash className="h-3 w-3" />
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
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Actions
                </CardTitle>
                <CardDescription>
                  Save or publish your blog post
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleSave}
                  variant="outline"
                  className="w-full flex items-center gap-2"
                  disabled={!title.trim()}
                >
                  <Save className="h-4 w-4" />
                  Save Draft
                </Button>
                <Button
                  onClick={handlePublish}
                  className="w-full flex items-center gap-2"
                  disabled={!title.trim() || !content.trim()}
                >
                  <Send className="h-4 w-4" />
                  Publish Post
                </Button>
              </CardContent>
            </Card>

            {/* Post Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Characters:</span>
                  <span className="font-medium">{content.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Words:</span>
                  <span className="font-medium">
                    {content.trim() ? content.trim().split(/\s+/).length : 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reading time:</span>
                  <span className="font-medium">
                    {Math.max(1, Math.ceil((content.trim() ? content.trim().split(/\s+/).length : 0) / 200))} min
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={title && content ? "default" : "secondary"}>
                    {title && content ? "Ready" : "Draft"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

export default page