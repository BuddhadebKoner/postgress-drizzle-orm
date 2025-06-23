import { db } from '@/db';
import { blogs } from '@/db/schema';
import { clerkClient } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';
import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Params {
  subdomain: string;
}

const page = async ({ params }: { params: Promise<Params> }) => {
  const { subdomain } = await params;
  const client = await clerkClient();
  const org = await client.organizations.getOrganization({ slug: subdomain })

  const orgId = org?.id;
  const blogsData = await db.select().from(blogs).where(and(
    eq(blogs.organizationId, orgId),
    eq(blogs.status, 'published'),
    eq(blogs.isPublic, true)
  ));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogsData.map((blog) => (
          <Card key={blog.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-center justify-between mb-2">
                <Badge variant={blog.status === 'published' ? 'default' : 'secondary'}>
                  {blog.status}
                </Badge>
                {blog.isPublic && (
                  <Badge variant="outline">Public</Badge>
                )}
              </div>
              <CardTitle className="text-xl line-clamp-2">{blog.title}</CardTitle>
              <CardDescription className="line-clamp-2">{blog.subtitle}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {blog.content}
              </p>

              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {blog.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col items-start gap-2 pt-4">
              <div className="text-xs text-muted-foreground">
                By {blog.ownerName}
              </div>
              <div className="text-xs text-muted-foreground">
                {blog.publishedAt ?
                  `Published ${new Date(blog.publishedAt).toLocaleDateString()}` :
                  `Created ${new Date(blog.createdAt ?? '').toLocaleDateString()}`
                }
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {blogsData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No blogs found for this organization.</p>
        </div>
      )}
    </div>
  )
}

export default page