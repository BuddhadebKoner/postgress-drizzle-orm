import React from 'react'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { blogs } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BlogListWithActions from '@/app/components/BlogListWithActions'

const page = async () => {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Please sign in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Fetch user's blogs
  const userBlogs = await db
    .select()
    .from(blogs)
    .where(eq(blogs.clerkId, userId))
    .orderBy(desc(blogs.createdAt))

  const publishedBlogs = userBlogs.filter(blog => blog.status === 'published')
  const draftBlogs = userBlogs.filter(blog => blog.status === 'draft')

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Profile Header */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-4">
            {user.imageUrl && (
              <img
                src={user.imageUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-16 h-16 rounded-full object-cover"
              />
            )}
            <div>
              <CardTitle className="text-2xl">
                {user.firstName} {user.lastName}
              </CardTitle>
              <CardDescription className="text-base">
                {user.emailAddresses[0]?.emailAddress}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">{userBlogs.length}</p>
              <p className="text-sm text-muted-foreground">Total Blogs</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-green-600">{publishedBlogs.length}</p>
              <p className="text-sm text-muted-foreground">Published</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{draftBlogs.length}</p>
              <p className="text-sm text-muted-foreground">Drafts</p>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-2">
            <h3 className="font-semibold">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">User ID:</span>
                <p className="font-mono text-xs break-all">{user.id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Member since:</span>
                <p>{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
              {user.username && (
                <div>
                  <span className="text-muted-foreground">Username:</span>
                  <p>@{user.username}</p>
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Last sign in:</span>
                <p>{user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blogs Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>My Blogs</CardTitle>
              <CardDescription>Manage and view your blog posts</CardDescription>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Total: <span className="font-semibold">{userBlogs.length}</span>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <span>All</span>
                <Badge variant="secondary" className="text-xs">
                  {userBlogs.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="published" className="flex items-center gap-2">
                <span>Published</span>
                <Badge variant="default" className="text-xs">
                  {publishedBlogs.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="drafts" className="flex items-center gap-2">
                <span>Drafts</span>
                <Badge variant="outline" className="text-xs">
                  {draftBlogs.length}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              {userBlogs.length > 0 ? (
                <BlogListWithActions blogs={userBlogs} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No blogs found.</p>
                  <p className="text-sm text-muted-foreground">
                    Start writing your first blog post to see it here.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="published" className="mt-6">
              {publishedBlogs.length > 0 ? (
                <BlogListWithActions blogs={publishedBlogs} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No published blogs yet.</p>
                  <p className="text-sm text-muted-foreground">
                    Publish your draft blogs to make them visible to others.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="drafts" className="mt-6">
              {draftBlogs.length > 0 ? (
                <BlogListWithActions blogs={draftBlogs} />
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No draft blogs.</p>
                  <p className="text-sm text-muted-foreground">
                    Your draft blogs will appear here before publishing.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default page