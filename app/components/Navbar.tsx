import { OrganizationSwitcher, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'
import { cn } from '@/lib/utils'

const Navbar = () => {
   return (
      <nav className={cn(
         "sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      )}>
         <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
               {/* Logo/Brand */}
               <div className="flex items-center">
                  <Link href="/" className="group">
                     <h1 className="text-xl sm:text-2xl font-bold text-foreground group-hover:text-primary transition-colors duration-200">
                        Super Blogs
                     </h1>
                  </Link>
                  
               </div>

               {/* Navigation Links - Hidden on mobile, shown on desktop */}
               <div className="hidden md:flex items-center space-x-8">
                  <Link
                     href="/"
                     className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                     Home
                  </Link>
                  <Link
                     href="/blogs"
                     className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                     Blog
                  </Link>
                  <Link
                     href="/about"
                     className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                     About
                  </Link>
               </div>

               {/* User Actions */}
               <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 rounded-md border border-border bg-card p-1.5">
                     <OrganizationSwitcher
                        afterSelectOrganizationUrl="/:slug"
                        afterLeaveOrganizationUrl="/"
                        afterSelectPersonalUrl={"/"}
                        appearance={{
                           elements: {
                              organizationSwitcherTrigger: "text-foreground hover:bg-accent hover:text-accent-foreground",
                              organizationPreview: "text-foreground",
                              organizationSwitcherPopoverCard: "bg-popover border-border",
                              organizationSwitcherPopoverActionButton: "text-muted-foreground hover:text-foreground hover:bg-accent"
                           }
                        }}
                     />
                     <div className="h-4 w-px bg-border" />
                     <UserButton
                        appearance={{
                           elements: {
                              userButtonAvatarBox: "w-8 h-8",
                              userButtonPopoverCard: "bg-popover border-border",
                              userButtonPopoverActionButton: "text-muted-foreground hover:text-foreground hover:bg-accent"
                           }
                        }}
                     />
                  </div>
               </div>
            </div>
         </div>

         {/* Mobile Navigation - You can expand this later */}
         <div className="md:hidden border-t border-border">
            <div className="container mx-auto px-4 py-2">
               <div className="flex space-x-6">
                  <Link
                     href="/"
                     className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                     Home
                  </Link>
                  <Link
                     href="/blog"
                     className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                     Blog
                  </Link>
                  <Link
                     href="/about"
                     className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                     About
                  </Link>
               </div>
            </div>
         </div>
      </nav>
   )
}

export default Navbar