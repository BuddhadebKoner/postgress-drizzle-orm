import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/db'
import { blogs } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'

// Simple validation function instead of zod for now
function validateBlogData(data: any) {
   const errors: string[] = []

   if (!data.title || typeof data.title !== 'string' || data.title.trim().length === 0) {
      errors.push('Title is required')
   }
   if (data.title && data.title.length > 255) {
      errors.push('Title must be less than 255 characters')
   }
   if (data.subtitle && data.subtitle.length > 500) {
      errors.push('Subtitle must be less than 500 characters')
   }
   if (!data.content || typeof data.content !== 'string' || data.content.trim().length === 0) {
      errors.push('Content is required')
   }
   if (data.status && !['draft', 'published'].includes(data.status)) {
      errors.push('Status must be either draft or published')
   }

   return errors
}

export async function POST(request: NextRequest) {
   try {
      console.log('Blog creation API called');

      // Check authentication
      const { userId, orgId } = await auth()
      console.log('Auth result:', { userId, orgId });

      if (!userId) {
         console.log('No userId found, returning unauthorized');
         return NextResponse.json(
            { error: 'Unauthorized - Please sign in' },
            { status: 401 }
         )
      }

      // Get current user details
      const user = await currentUser()
      console.log('Current user:', {
         id: user?.id,
         firstName: user?.firstName,
         lastName: user?.lastName
      });

      if (!user) {
         console.log('No user found, returning 404');
         return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
         )
      }

      // Parse and validate request body
      const body = await request.json()
      console.log('Request body:', body);

      const validationErrors = validateBlogData(body)

      if (validationErrors.length > 0) {
         console.log('Validation errors:', validationErrors);
         return NextResponse.json({
            error: 'Validation failed',
            details: validationErrors
         }, { status: 400 })
      }

      // Get user's full name
      const ownerName = `${user.firstName || ''} ${user.lastName || ''}`.trim() ||
         user.username ||
         user.emailAddresses[0]?.emailAddress ||
         'Unknown User'

      // Prepare blog data
      const blogData = {
         title: body.title.trim(),
         subtitle: body.subtitle?.trim() || null,
         content: body.content.trim(),
         tags: Array.isArray(body.tags) ? body.tags : [],
         status: body.status || 'draft',
         ownerName,
         clerkId: userId,
         organizationId: body.organizationId || orgId || null,
         organizationName: body.organizationName || null,
         isPublic: Boolean(body.isPublic),
         publishedAt: (body.status === 'published') ? new Date() : null,
      }

      console.log('Prepared blog data:', blogData);

      // Insert into database
      console.log('Attempting to insert into database...');
      const [newBlog] = await db.insert(blogs).values(blogData).returning()
      console.log('Blog created successfully:', newBlog);

      return NextResponse.json({
         success: true,
         message: `Blog ${blogData.status === 'published' ? 'published' : 'saved as draft'} successfully`,
         blog: {
            id: newBlog.id,
            title: newBlog.title,
            status: newBlog.status,
            isPublic: newBlog.isPublic,
            createdAt: newBlog.createdAt,
         }
      }, { status: 201 })

   } catch (error) {
      console.error('Error creating blog:', error)

      // Handle database errors
      if (error instanceof Error && error.message.includes('duplicate')) {
         return NextResponse.json(
            { error: 'A blog with this title already exists' },
            { status: 409 }
         )
      }

      // Generic error
      return NextResponse.json(
         { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
         { status: 500 }
      )
   }
}

export async function GET(request: NextRequest) {
   try {
      // Check authentication
      const { userId } = await auth()
      if (!userId) {
         return NextResponse.json(
            { error: 'Unauthorized - Please sign in' },
            { status: 401 }
         )
      }

      // Get query parameters
      const { searchParams } = new URL(request.url)
      const limit = parseInt(searchParams.get('limit') || '10')
      const offset = parseInt(searchParams.get('offset') || '0')

      // Get user's blogs
      const userBlogs = await db
         .select()
         .from(blogs)
         .where(eq(blogs.clerkId, userId))
         .limit(limit)
         .offset(offset)
         .orderBy(desc(blogs.createdAt))

      return NextResponse.json({
         success: true,
         blogs: userBlogs,
         pagination: {
            limit,
            offset,
            hasMore: userBlogs.length === limit
         }
      })

   } catch (error) {
      console.error('Error fetching blogs:', error)
      return NextResponse.json(
         { error: 'Internal server error' },
         { status: 500 }
      )
   }
}

export async function PATCH(request: NextRequest) {
   try {
      // Check authentication
      const { userId } = await auth()
      if (!userId) {
         return NextResponse.json(
            { error: 'Unauthorized - Please sign in' },
            { status: 401 }
         )
      }

      // Parse request body
      const body = await request.json()
      const { blogId, status, isPublic } = body

      if (!blogId) {
         return NextResponse.json(
            { error: 'Blog ID is required' },
            { status: 400 }
         )
      }

      if (status && !['draft', 'published'].includes(status)) {
         return NextResponse.json(
            { error: 'Status must be either draft or published' },
            { status: 400 }
         )
      }

      // Prepare update data
      const updateData: any = {}
      
      if (status !== undefined) {
         updateData.status = status
         updateData.publishedAt = status === 'published' ? new Date() : null
         updateData.updatedAt = new Date()
      }
      
      if (isPublic !== undefined) {
         updateData.isPublic = Boolean(isPublic)
         updateData.updatedAt = new Date()
      }

      // Update blog (only if user owns it)
      const [updatedBlog] = await db
         .update(blogs)
         .set(updateData)
         .where(and(eq(blogs.id, blogId), eq(blogs.clerkId, userId)))
         .returning()

      if (!updatedBlog) {
         return NextResponse.json(
            { error: 'Blog not found or you do not have permission to update it' },
            { status: 404 }
         )
      }

      return NextResponse.json({
         success: true,
         message: 'Blog updated successfully',
         blog: updatedBlog
      })

   } catch (error) {
      console.error('Error updating blog:', error)
      return NextResponse.json(
         { error: 'Internal server error' },
         { status: 500 }
      )
   }
}
